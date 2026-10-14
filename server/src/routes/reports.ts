import { Router, Response, NextFunction } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { Invoice } from '../models/Invoice';
import { Expense } from '../models/Expense';
import { Member } from '../models/Member';
import { Subscription } from '../models/Subscription';

const router = Router();
router.use(authenticate, authorize('admin'));

// GET /api/reports/financial
router.get('/financial', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate as string) : new Date();

    const [revenue, expenses, refunds] = await Promise.all([
      Invoice.aggregate([
        { $unwind: '$payments' },
        { $match: { 'payments.paidAt': { $gte: start, $lte: end }, 'payments.amount': { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$payments.amount' }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate([
        { $match: { date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Invoice.aggregate([
        { $unwind: '$payments' },
        { $match: { 'payments.paidAt': { $gte: start, $lte: end }, 'payments.amount': { $lt: 0 } } },
        { $group: { _id: null, total: { $sum: '$payments.amount' } } },
      ]),
    ]);

    const totalRevenue = revenue[0]?.total || 0;
    const totalExpenses = expenses[0]?.total || 0;
    const totalRefunds = Math.abs(refunds[0]?.total || 0);
    const netRevenue = totalRevenue - totalRefunds;
    const estimatedProfit = netRevenue - totalExpenses;

    const outstanding = await Invoice.aggregate([
      { $match: { status: { $in: ['pending', 'partially_paid', 'overdue'] } } },
      { $group: { _id: null, total: { $sum: '$pendingAmount' } } },
    ]);

    res.json({
      success: true,
      data: {
        period: { start, end },
        totalRevenue,
        totalRefunds,
        netRevenue,
        totalExpenses,
        estimatedProfit,
        outstanding: outstanding[0]?.total || 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/membership
router.get('/membership', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const [activeCount, expiredCount, pendingCount, expiringIn30] = await Promise.all([
      Subscription.countDocuments({ status: 'active', startDate: { $lte: now }, endDate: { $gte: now } }),
      Member.countDocuments({ status: 'expired' }),
      Member.countDocuments({ status: 'pending' }),
      Subscription.countDocuments({
        status: 'active',
        endDate: { $gte: now, $lte: new Date(now.getTime() + 30 * 86400000) },
      }),
    ]);

    res.json({ success: true, data: { activeCount, expiredCount, pendingCount, expiringIn30 } });
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/export/csv?type=payments&startDate=&endDate=
router.get('/export/csv', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type, startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate as string) : new Date();

    let csvData = '';
    let filename = '';

    if (type === 'payments') {
      const invoices = await Invoice.find({
        'payments.0': { $exists: true },
        updatedAt: { $gte: start, $lte: end },
      }).populate('member', 'name memberId phone');

      filename = 'payments_report.csv';
      csvData = 'Invoice No,Member,Member ID,Phone,Amount (₹),Method,Date,Status\n';
      invoices.forEach((inv) => {
        const m = inv.member as any;
        inv.payments.forEach((p) => {
          if (p.amount > 0) {
            csvData += `${inv.invoiceNumber},${m?.name || ''},${m?.memberId || ''},${m?.phone || ''},${(p.amount / 100).toFixed(2)},${p.method},${new Date(p.paidAt).toLocaleDateString('en-IN')},${inv.status}\n`;
          }
        });
      });
    } else if (type === 'expenses') {
      const expenses = await Expense.find({ date: { $gte: start, $lte: end } })
        .populate('recordedBy', 'name');

      filename = 'expenses_report.csv';
      csvData = 'Title,Category,Amount (₹),Date,Vendor,Payment Method,Recorded By\n';
      expenses.forEach((e) => {
        const rb = e.recordedBy as any;
        csvData += `"${e.title}",${e.category},${(e.amount / 100).toFixed(2)},${new Date(e.date).toLocaleDateString('en-IN')},"${e.vendor || ''}",${e.paymentMethod},"${rb?.name || ''}"\n`;
      });
    } else if (type === 'members') {
      const members = await Member.find({ isActive: true })
        .populate('assignedTrainer', 'name');

      filename = 'members_report.csv';
      csvData = 'Member ID,Name,Phone,Email,Joining Date,Status,City\n';
      members.forEach((m) => {
        csvData += `${m.memberId},"${m.name}",${m.phone},${m.email || ''},${new Date(m.joiningDate).toLocaleDateString('en-IN')},${m.status},${m.city || ''}\n`;
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);
  } catch (err) {
    next(err);
  }
});

export default router;
