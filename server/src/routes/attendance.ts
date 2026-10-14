import { Router, Response, NextFunction } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { Attendance } from '../models/Attendance';
import { Member } from '../models/Member';
import { Subscription } from '../models/Subscription';
import { AppError } from '../middleware/errorHandler';

const router = Router();
router.use(authenticate);

const getTodayStr = () => new Date().toISOString().split('T')[0];

// POST /api/attendance/checkin
router.post('/checkin', authorize('admin', 'staff'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { memberId, method = 'manual', notes } = req.body;
    if (!memberId) throw new AppError('Member ID is required', 400);

    const member = await Member.findById(memberId);
    if (!member) throw new AppError('Member not found', 404);

    const today = getTodayStr();

    // Check for duplicate active check-in today
    const existing = await Attendance.findOne({ member: memberId, date: today, checkOutTime: null });
    if (existing) throw new AppError('Member already checked in today', 409);

    // Check subscription status
    const now = new Date();
    const activeSub = await Subscription.findOne({
      member: memberId,
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    let membershipWarning: string | undefined;
    if (!activeSub) {
      membershipWarning = member.status === 'expired' ? 'Membership expired' : 'No active membership';
    } else {
      const daysLeft = Math.ceil((activeSub.endDate.getTime() - now.getTime()) / 86400000);
      if (daysLeft <= 7) membershipWarning = `Membership expiring in ${daysLeft} day(s)`;
    }

    const attendance = await Attendance.create({
      member: memberId,
      checkInTime: new Date(),
      date: today,
      recordedBy: req.user!.id,
      method,
      membershipWarning,
      notes,
    });

    await attendance.populate('member', 'name memberId phone');

    res.status(201).json({
      success: true,
      data: attendance,
      warning: membershipWarning,
      message: `${member.name} checked in successfully`,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/attendance/checkout
router.post('/checkout', authorize('admin', 'staff'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { memberId } = req.body;
    const today = getTodayStr();

    const attendance = await Attendance.findOne({
      member: memberId,
      date: today,
      checkOutTime: null,
    });

    if (!attendance) throw new AppError('No active check-in found for today', 404);

    attendance.checkOutTime = new Date();
    await attendance.save();

    res.json({ success: true, data: attendance, message: 'Checked out successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/attendance/qr-scan
router.post('/qr-scan', authorize('admin', 'staff'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { qrToken } = req.body;
    if (!qrToken) throw new AppError('QR token is required', 400);

    const member = await Member.findOne({ qrToken, isActive: true });
    if (!member) throw new AppError('Invalid or expired QR code', 404);

    const today = getTodayStr();
    const existing = await Attendance.findOne({ member: member._id, date: today, checkOutTime: null });
    if (existing) throw new AppError('Member already checked in today', 409);

    const now = new Date();
    const activeSub = await Subscription.findOne({
      member: member._id,
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    let membershipWarning: string | undefined;
    if (!activeSub) {
      membershipWarning = 'No active membership';
    }

    const attendance = await Attendance.create({
      member: member._id,
      checkInTime: now,
      date: today,
      recordedBy: req.user!.id,
      method: 'qr_scan',
      membershipWarning,
    });

    res.status(201).json({
      success: true,
      data: attendance,
      member: { name: member.name, memberId: member.memberId },
      warning: membershipWarning,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/attendance/today
router.get('/today', authorize('admin', 'staff'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const today = getTodayStr();
    const records = await Attendance.find({ date: today })
      .populate('member', 'name memberId phone status')
      .sort({ checkInTime: -1 });

    res.json({ success: true, data: records, count: records.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/attendance/member/:memberId
router.get('/member/:memberId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role === 'member') {
      const { User } = require('../models/User');
      const user = await User.findById(req.user.id);
      if (user?.memberId?.toString() !== req.params.memberId) {
        throw new AppError('Access denied', 403);
      }
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 30;

    const [records, total] = await Promise.all([
      Attendance.find({ member: req.params.memberId })
        .sort({ checkInTime: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Attendance.countDocuments({ member: req.params.memberId }),
    ]);

    res.json({
      success: true,
      data: records,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/attendance/report
router.get('/report', authorize('admin', 'staff'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    const start = (startDate as string) || getTodayStr();
    const end = (endDate as string) || getTodayStr();

    const daily = await Attendance.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: '$date', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Inactive members (haven't visited in 14 days)
    const cutoffDate = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];
    const recentlyActive = await Attendance.distinct('member', { date: { $gte: cutoffDate } });
    const inactiveCount = await Member.countDocuments({
      isActive: true,
      _id: { $nin: recentlyActive },
    });

    res.json({ success: true, data: { daily, inactiveCount } });
  } catch (err) {
    next(err);
  }
});

export default router;
