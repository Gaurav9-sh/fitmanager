"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Expense_1 = require("../models/Expense");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.authorize)('admin'));
// POST /api/expenses
router.post('/', async (req, res, next) => {
    try {
        const { title, category, amount, date, description, vendor, paymentMethod, isRecurring, recurringFrequency, receiptUrl } = req.body;
        if (!title || !category || !amount || !date)
            throw new errorHandler_1.AppError('Title, category, amount, and date are required', 400);
        const expense = await Expense_1.Expense.create({
            title, category,
            amount: Math.round(amount * 100), // paise
            date: new Date(date), description, vendor,
            paymentMethod: paymentMethod || 'cash',
            isRecurring: isRecurring || false, recurringFrequency, receiptUrl,
            recordedBy: req.user.id,
        });
        res.status(201).json({ success: true, data: expense });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/expenses
router.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const { category, startDate, endDate } = req.query;
        const filter = {};
        if (category)
            filter.category = category;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate)
                filter.date.$gte = new Date(startDate);
            if (endDate)
                filter.date.$lte = new Date(endDate);
        }
        const [expenses, total] = await Promise.all([
            Expense_1.Expense.find(filter).sort({ date: -1 }).skip((page - 1) * limit).limit(limit),
            Expense_1.Expense.countDocuments(filter),
        ]);
        res.json({ success: true, data: expenses, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/expenses/summary
router.get('/summary', async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const end = endDate ? new Date(endDate) : new Date();
        const byCat = await Expense_1.Expense.aggregate([
            { $match: { date: { $gte: start, $lte: end } } },
            { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
            { $sort: { total: -1 } },
        ]);
        const grandTotal = byCat.reduce((s, e) => s + e.total, 0);
        res.json({ success: true, data: { byCategory: byCat, grandTotal } });
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/expenses/:id
router.put('/:id', async (req, res, next) => {
    try {
        const updates = { ...req.body };
        if (updates.amount)
            updates.amount = Math.round(updates.amount * 100);
        const expense = await Expense_1.Expense.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!expense)
            throw new errorHandler_1.AppError('Expense not found', 404);
        res.json({ success: true, data: expense });
    }
    catch (err) {
        next(err);
    }
});
// DELETE /api/expenses/:id
router.delete('/:id', async (req, res, next) => {
    try {
        const expense = await Expense_1.Expense.findByIdAndDelete(req.params.id);
        if (!expense)
            throw new errorHandler_1.AppError('Expense not found', 404);
        res.json({ success: true, message: 'Expense deleted' });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=expenses.js.map