import { Router, Response, NextFunction } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { Expense } from '../models/Expense';
import { AppError } from '../middleware/errorHandler';

const router = Router();
router.use(authenticate, authorize('admin'));

// POST /api/expenses
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, category, amount, date, description, vendor, paymentMethod, isRecurring, recurringFrequency, receiptUrl } = req.body;
    if (!title || !category || !amount || !date) throw new AppError('Title, category, amount, and date are required', 400);

    const expense = await Expense.create({
      title, category,
      amount: Math.round(amount * 100), // paise
      date: new Date(date), description, vendor,
      paymentMethod: paymentMethod || 'cash',
      isRecurring: isRecurring || false, recurringFrequency, receiptUrl,
      recordedBy: req.user!.id,
    });
    res.status(201).json({ success: true, data: expense });
  } catch (err) { next(err); }
});

// GET /api/expenses
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { category, startDate, endDate } = req.query;

    const filter: Record<string, any> = {};
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const [expenses, total] = await Promise.all([
      Expense.find(filter).sort({ date: -1 }).skip((page - 1) * limit).limit(limit),
      Expense.countDocuments(filter),
    ]);
    res.json({ success: true, data: expenses, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

// GET /api/expenses/summary
router.get('/summary', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate as string) : new Date();

    const byCat = await Expense.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);
    const grandTotal = byCat.reduce((s, e) => s + e.total, 0);
    res.json({ success: true, data: { byCategory: byCat, grandTotal } });
  } catch (err) { next(err); }
});

// PUT /api/expenses/:id
router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const updates = { ...req.body };
    if (updates.amount) updates.amount = Math.round(updates.amount * 100);
    const expense = await Expense.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!expense) throw new AppError('Expense not found', 404);
    res.json({ success: true, data: expense });
  } catch (err) { next(err); }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) throw new AppError('Expense not found', 404);
    res.json({ success: true, message: 'Expense deleted' });
  } catch (err) { next(err); }
});

export default router;
