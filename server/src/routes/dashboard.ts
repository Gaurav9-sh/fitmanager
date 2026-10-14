import { Router, Response, NextFunction } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { Member } from '../models/Member';
import { Subscription } from '../models/Subscription';
import { Invoice } from '../models/Invoice';
import { Attendance } from '../models/Attendance';
import { Expense } from '../models/Expense';

const router = Router();

router.use(authenticate);
router.use(authorize('admin', 'staff'));

// GET /api/dashboard/kpi
router.get('/kpi', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Member counts
    const [
      totalMembers,
      activeMembers,
      expiredMembers,
      pendingMembers,
      newMembersThisMonth,
      todayAttendance,
    ] = await Promise.all([
      Member.countDocuments({ isActive: true }),
      // Active = has active subscription
      Subscription.distinct('member', {
        status: 'active',
        startDate: { $lte: now },
        endDate: { $gte: now },
      }).then((ids) => ids.length),
      // Expired = most recent subscription is expired
      Member.countDocuments({ status: 'expired' }),
      Member.countDocuments({ status: 'pending' }),
      Member.countDocuments({
        joiningDate: { $gte: startOfMonth, $lte: endOfMonth },
      }),
      Attendance.countDocuments({ date: today }),
    ]);

    // Revenue
    const revenueToday = await Invoice.aggregate([
      { $unwind: '$payments' },
      {
        $match: {
          'payments.paidAt': {
            $gte: new Date(today),
            $lt: new Date(new Date(today).getTime() + 86400000),
          },
        },
      },
      { $group: { _id: null, total: { $sum: '$payments.amount' } } },
    ]);

    const revenueThisMonth = await Invoice.aggregate([
      { $unwind: '$payments' },
      {
        $match: {
          'payments.paidAt': { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$payments.amount' } } },
    ]);

    const pendingDues = await Invoice.aggregate([
      { $match: { status: { $in: ['pending', 'partially_paid', 'overdue'] } } },
      { $group: { _id: null, total: { $sum: '$pendingAmount' } } },
    ]);

    // Expenses this month
    const expensesThisMonth = await Expense.aggregate([
      { $match: { date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Expiring soon (next 7 days)
    const expiringIn7Days = await Subscription.countDocuments({
      status: 'active',
      endDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 86400000) },
    });

    const rev = revenueToday[0]?.total || 0;
    const revMonth = revenueThisMonth[0]?.total || 0;
    const dues = pendingDues[0]?.total || 0;
    const expenses = expensesThisMonth[0]?.total || 0;

    res.json({
      success: true,
      data: {
        totalMembers,
        activeMembers,
        expiredMembers,
        pendingMembers,
        newMembersThisMonth,
        todayAttendance,
        revenueToday: rev,
        revenueThisMonth: revMonth,
        pendingDues: dues,
        expensesThisMonth: expenses,
        estimatedProfit: revMonth - expenses,
        expiringIn7Days,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/charts/revenue
router.get('/charts/revenue', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const months = parseInt(req.query.months as string) || 12;
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    const revenue = await Invoice.aggregate([
      { $unwind: '$payments' },
      { $match: { 'payments.paidAt': { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$payments.paidAt' },
            month: { $month: '$payments.paidAt' },
          },
          total: { $sum: '$payments.amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const expenses = await Expense.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({ success: true, data: { revenue, expenses } });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/charts/membership-trends
router.get('/charts/membership-trends', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const months = parseInt(req.query.months as string) || 12;
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    const trends = await Member.aggregate([
      { $match: { joiningDate: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$joiningDate' },
            month: { $month: '$joiningDate' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({ success: true, data: trends });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/charts/attendance
router.get('/charts/attendance', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 86400000);
    const startDateStr = startDate.toISOString().split('T')[0];

    const attendance = await Attendance.aggregate([
      { $match: { date: { $gte: startDateStr } } },
      { $group: { _id: '$date', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: attendance });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/charts/plan-revenue
router.get('/charts/plan-revenue', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await Invoice.aggregate([
      { $unwind: '$payments' },
      {
        $lookup: {
          from: 'subscriptions',
          localField: 'subscription',
          foreignField: '_id',
          as: 'sub',
        },
      },
      { $unwind: { path: '$sub', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$sub.planSnapshot.name',
          total: { $sum: '$payments.amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/recent-activity
router.get('/recent-activity', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [recentMembers, recentPayments, recentAttendance] = await Promise.all([
      Member.find().sort({ createdAt: -1 }).limit(5).select('name memberId status joiningDate'),
      Invoice.find({ 'payments.0': { $exists: true } })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate('member', 'name memberId'),
      Attendance.find()
        .sort({ checkInTime: -1 })
        .limit(10)
        .populate('member', 'name memberId'),
    ]);

    // Expiring soon
    const now = new Date();
    const expiringSubscriptions = await Subscription.find({
      status: 'active',
      endDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 86400000) },
    })
      .populate('member', 'name memberId phone')
      .sort({ endDate: 1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        recentMembers,
        recentPayments,
        recentAttendance,
        expiringSubscriptions,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
