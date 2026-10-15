"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Invoice_1 = require("../models/Invoice");
const AuditLog_1 = require("../models/AuditLog");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// POST /api/payments - Record payment on an invoice
router.post('/', (0, auth_1.authorize)('admin', 'staff'), async (req, res, next) => {
    try {
        const { invoiceId, amount, method, transactionRef, notes, paidAt } = req.body;
        if (!invoiceId || !amount || !method) {
            throw new errorHandler_1.AppError('Invoice ID, amount, and method are required', 400);
        }
        const invoice = await Invoice_1.Invoice.findById(invoiceId).populate('member', 'name memberId');
        if (!invoice)
            throw new errorHandler_1.AppError('Invoice not found', 404);
        if (invoice.status === 'paid' || invoice.status === 'cancelled') {
            throw new errorHandler_1.AppError(`Invoice is already ${invoice.status}`, 400);
        }
        const amountPaise = Math.round(amount * 100);
        if (amountPaise <= 0)
            throw new errorHandler_1.AppError('Payment amount must be positive', 400);
        if (amountPaise > invoice.pendingAmount + 1) {
            throw new errorHandler_1.AppError(`Amount exceeds pending balance of ₹${(invoice.pendingAmount / 100).toFixed(2)}`, 400);
        }
        invoice.payments.push({
            amount: amountPaise,
            method,
            transactionRef,
            paidAt: paidAt ? new Date(paidAt) : new Date(),
            recordedBy: req.user.id,
            notes,
        });
        invoice.paidAmount += amountPaise;
        invoice.pendingAmount = Math.max(0, invoice.netAmount - invoice.paidAmount);
        if (invoice.pendingAmount === 0) {
            invoice.status = 'paid';
        }
        else if (invoice.paidAmount > 0) {
            invoice.status = 'partially_paid';
        }
        await invoice.save();
        await AuditLog_1.AuditLog.create({
            performedBy: req.user.id,
            action: 'PAYMENT_RECORDED',
            entity: 'Invoice',
            entityId: invoice._id,
            after: { amount: amountPaise, method, invoiceNumber: invoice.invoiceNumber },
            ipAddress: req.ip,
        });
        res.status(201).json({
            success: true,
            data: invoice,
            message: `Payment of ₹${(amountPaise / 100).toFixed(2)} recorded successfully`,
        });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/payments - Payment ledger with filters
router.get('/', (0, auth_1.authorize)('admin', 'staff'), async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const { status, method, memberId, startDate, endDate } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (memberId)
            filter.member = memberId;
        // Date filter on payments array
        const dateFilter = {};
        if (startDate)
            dateFilter.$gte = new Date(startDate);
        if (endDate)
            dateFilter.$lte = new Date(endDate);
        let query = Invoice_1.Invoice.find(filter)
            .populate('member', 'name memberId phone')
            .sort({ updatedAt: -1 });
        const [invoices, total] = await Promise.all([
            query.skip(skip).limit(limit),
            Invoice_1.Invoice.countDocuments(filter),
        ]);
        res.json({
            success: true,
            data: invoices,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/payments/summary
router.get('/summary', (0, auth_1.authorize)('admin'), async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const end = endDate ? new Date(endDate) : new Date();
        const summary = await Invoice_1.Invoice.aggregate([
            { $unwind: '$payments' },
            { $match: { 'payments.paidAt': { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: '$payments.method',
                    total: { $sum: '$payments.amount' },
                    count: { $sum: 1 },
                },
            },
        ]);
        const totalCollected = summary.reduce((acc, s) => acc + s.total, 0);
        const totalPending = await Invoice_1.Invoice.aggregate([
            { $match: { status: { $in: ['pending', 'partially_paid', 'overdue'] } } },
            { $group: { _id: null, total: { $sum: '$pendingAmount' } } },
        ]);
        res.json({
            success: true,
            data: {
                byMethod: summary,
                totalCollected,
                totalPending: totalPending[0]?.total || 0,
            },
        });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/payments/refund
router.post('/refund', (0, auth_1.authorize)('admin'), async (req, res, next) => {
    try {
        const { invoiceId, amount, reason } = req.body;
        const invoice = await Invoice_1.Invoice.findById(invoiceId);
        if (!invoice)
            throw new errorHandler_1.AppError('Invoice not found', 404);
        const refundPaise = Math.round(amount * 100);
        if (refundPaise > invoice.paidAmount) {
            throw new errorHandler_1.AppError('Refund amount exceeds paid amount', 400);
        }
        invoice.paidAmount -= refundPaise;
        invoice.pendingAmount += refundPaise;
        invoice.status = invoice.paidAmount === 0 ? 'refunded' : 'partially_paid';
        // Record refund as negative payment
        invoice.payments.push({
            amount: -refundPaise,
            method: 'other',
            transactionRef: `REFUND-${Date.now()}`,
            paidAt: new Date(),
            recordedBy: req.user.id,
            notes: `Refund: ${reason}`,
        });
        await invoice.save();
        await AuditLog_1.AuditLog.create({
            performedBy: req.user.id,
            action: 'PAYMENT_REFUNDED',
            entity: 'Invoice',
            entityId: invoice._id,
            after: { amount: refundPaise, reason },
            ipAddress: req.ip,
        });
        res.json({ success: true, data: invoice, message: 'Refund recorded' });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/payments/invoice/:id - Receipt
router.get('/invoice/:id', async (req, res, next) => {
    try {
        const invoice = await Invoice_1.Invoice.findById(req.params.id)
            .populate('member', 'name memberId phone email address city')
            .populate('subscription');
        if (!invoice)
            throw new errorHandler_1.AppError('Invoice not found', 404);
        // Member can only view their own invoices
        if (req.user?.role === 'member') {
            const member = invoice.member;
            const { User } = require('../models/User');
            const user = await User.findById(req.user.id);
            if (user?.memberId?.toString() !== member._id?.toString()) {
                throw new errorHandler_1.AppError('Access denied', 403);
            }
        }
        res.json({ success: true, data: invoice });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=payments.js.map