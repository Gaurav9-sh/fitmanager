import { Router, Response, NextFunction } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { Invoice } from '../models/Invoice';
import { Subscription } from '../models/Subscription';
import { AuditLog } from '../models/AuditLog';
import { AppError } from '../middleware/errorHandler';

const router = Router();
router.use(authenticate);

// POST /api/payments - Record payment on an invoice
router.post('/', authorize('admin', 'staff'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { invoiceId, amount, method, transactionRef, notes, paidAt } = req.body;
    if (!invoiceId || !amount || !method) {
      throw new AppError('Invoice ID, amount, and method are required', 400);
    }

    const invoice = await Invoice.findById(invoiceId).populate('member', 'name memberId');
    if (!invoice) throw new AppError('Invoice not found', 404);
    if (invoice.status === 'paid' || invoice.status === 'cancelled') {
      throw new AppError(`Invoice is already ${invoice.status}`, 400);
    }

    const amountPaise = Math.round(amount * 100);
    if (amountPaise <= 0) throw new AppError('Payment amount must be positive', 400);
    if (amountPaise > invoice.pendingAmount + 1) {
      throw new AppError(`Amount exceeds pending balance of ₹${(invoice.pendingAmount / 100).toFixed(2)}`, 400);
    }

    invoice.payments.push({
      amount: amountPaise,
      method,
      transactionRef,
      paidAt: paidAt ? new Date(paidAt) : new Date(),
      recordedBy: req.user!.id as any,
      notes,
    });

    invoice.paidAmount += amountPaise;
    invoice.pendingAmount = Math.max(0, invoice.netAmount - invoice.paidAmount);

    if (invoice.pendingAmount === 0) {
      invoice.status = 'paid';
    } else if (invoice.paidAmount > 0) {
      invoice.status = 'partially_paid';
    }

    await invoice.save();

    await AuditLog.create({
      performedBy: req.user!.id,
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
  } catch (err) {
    next(err);
  }
});

// GET /api/payments - Payment ledger with filters
router.get('/', authorize('admin', 'staff'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const { status, method, memberId, startDate, endDate } = req.query;

    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (memberId) filter.member = memberId;

    // Date filter on payments array
    const dateFilter: Record<string, any> = {};
    if (startDate) dateFilter.$gte = new Date(startDate as string);
    if (endDate) dateFilter.$lte = new Date(endDate as string);

    let query: any = Invoice.find(filter)
      .populate('member', 'name memberId phone')
      .sort({ updatedAt: -1 });

    const [invoices, total] = await Promise.all([
      query.skip(skip).limit(limit),
      Invoice.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: invoices,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/payments/summary
router.get('/summary', authorize('admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate as string) : new Date();

    const summary = await Invoice.aggregate([
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
    const totalPending = await Invoice.aggregate([
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
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/refund
router.post('/refund', authorize('admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { invoiceId, amount, reason } = req.body;
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) throw new AppError('Invoice not found', 404);

    const refundPaise = Math.round(amount * 100);
    if (refundPaise > invoice.paidAmount) {
      throw new AppError('Refund amount exceeds paid amount', 400);
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
      recordedBy: req.user!.id as any,
      notes: `Refund: ${reason}`,
    });

    await invoice.save();

    await AuditLog.create({
      performedBy: req.user!.id,
      action: 'PAYMENT_REFUNDED',
      entity: 'Invoice',
      entityId: invoice._id,
      after: { amount: refundPaise, reason },
      ipAddress: req.ip,
    });

    res.json({ success: true, data: invoice, message: 'Refund recorded' });
  } catch (err) {
    next(err);
  }
});

// GET /api/payments/invoice/:id - Receipt
router.get('/invoice/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('member', 'name memberId phone email address city')
      .populate('subscription');

    if (!invoice) throw new AppError('Invoice not found', 404);

    // Member can only view their own invoices
    if (req.user?.role === 'member') {
      const member = invoice.member as any;
      const { User } = require('../models/User');
      const user = await User.findById(req.user.id);
      if (user?.memberId?.toString() !== member._id?.toString()) {
        throw new AppError('Access denied', 403);
      }
    }

    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
});

export default router;
