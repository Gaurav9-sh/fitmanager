"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Attendance_1 = require("../models/Attendance");
const Member_1 = require("../models/Member");
const Subscription_1 = require("../models/Subscription");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const getTodayStr = () => new Date().toISOString().split('T')[0];
// POST /api/attendance/checkin
router.post('/checkin', (0, auth_1.authorize)('admin', 'staff'), async (req, res, next) => {
    try {
        const { memberId, method = 'manual', notes } = req.body;
        if (!memberId)
            throw new errorHandler_1.AppError('Member ID is required', 400);
        const member = await Member_1.Member.findById(memberId);
        if (!member)
            throw new errorHandler_1.AppError('Member not found', 404);
        const today = getTodayStr();
        // Check for duplicate active check-in today
        const existing = await Attendance_1.Attendance.findOne({ member: memberId, date: today, checkOutTime: null });
        if (existing)
            throw new errorHandler_1.AppError('Member already checked in today', 409);
        // Check subscription status
        const now = new Date();
        const activeSub = await Subscription_1.Subscription.findOne({
            member: memberId,
            status: 'active',
            startDate: { $lte: now },
            endDate: { $gte: now },
        });
        let membershipWarning;
        if (!activeSub) {
            membershipWarning = member.status === 'expired' ? 'Membership expired' : 'No active membership';
        }
        else {
            const daysLeft = Math.ceil((activeSub.endDate.getTime() - now.getTime()) / 86400000);
            if (daysLeft <= 7)
                membershipWarning = `Membership expiring in ${daysLeft} day(s)`;
        }
        const attendance = await Attendance_1.Attendance.create({
            member: memberId,
            checkInTime: new Date(),
            date: today,
            recordedBy: req.user.id,
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
    }
    catch (err) {
        next(err);
    }
});
// POST /api/attendance/checkout
router.post('/checkout', (0, auth_1.authorize)('admin', 'staff'), async (req, res, next) => {
    try {
        const { memberId } = req.body;
        const today = getTodayStr();
        const attendance = await Attendance_1.Attendance.findOne({
            member: memberId,
            date: today,
            checkOutTime: null,
        });
        if (!attendance)
            throw new errorHandler_1.AppError('No active check-in found for today', 404);
        attendance.checkOutTime = new Date();
        await attendance.save();
        res.json({ success: true, data: attendance, message: 'Checked out successfully' });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/attendance/qr-scan
router.post('/qr-scan', (0, auth_1.authorize)('admin', 'staff'), async (req, res, next) => {
    try {
        const { qrToken } = req.body;
        if (!qrToken)
            throw new errorHandler_1.AppError('QR token is required', 400);
        const member = await Member_1.Member.findOne({ qrToken, isActive: true });
        if (!member)
            throw new errorHandler_1.AppError('Invalid or expired QR code', 404);
        const today = getTodayStr();
        const existing = await Attendance_1.Attendance.findOne({ member: member._id, date: today, checkOutTime: null });
        if (existing)
            throw new errorHandler_1.AppError('Member already checked in today', 409);
        const now = new Date();
        const activeSub = await Subscription_1.Subscription.findOne({
            member: member._id,
            status: 'active',
            startDate: { $lte: now },
            endDate: { $gte: now },
        });
        let membershipWarning;
        if (!activeSub) {
            membershipWarning = 'No active membership';
        }
        const attendance = await Attendance_1.Attendance.create({
            member: member._id,
            checkInTime: now,
            date: today,
            recordedBy: req.user.id,
            method: 'qr_scan',
            membershipWarning,
        });
        res.status(201).json({
            success: true,
            data: attendance,
            member: { name: member.name, memberId: member.memberId },
            warning: membershipWarning,
        });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/attendance/today
router.get('/today', (0, auth_1.authorize)('admin', 'staff'), async (req, res, next) => {
    try {
        const today = getTodayStr();
        const records = await Attendance_1.Attendance.find({ date: today })
            .populate('member', 'name memberId phone status')
            .sort({ checkInTime: -1 });
        res.json({ success: true, data: records, count: records.length });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/attendance/member/:memberId
router.get('/member/:memberId', async (req, res, next) => {
    try {
        if (req.user?.role === 'member') {
            const { User } = require('../models/User');
            const user = await User.findById(req.user.id);
            if (user?.memberId?.toString() !== req.params.memberId) {
                throw new errorHandler_1.AppError('Access denied', 403);
            }
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 30;
        const [records, total] = await Promise.all([
            Attendance_1.Attendance.find({ member: req.params.memberId })
                .sort({ checkInTime: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Attendance_1.Attendance.countDocuments({ member: req.params.memberId }),
        ]);
        res.json({
            success: true,
            data: records,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/attendance/report
router.get('/report', (0, auth_1.authorize)('admin', 'staff'), async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startDate || getTodayStr();
        const end = endDate || getTodayStr();
        const daily = await Attendance_1.Attendance.aggregate([
            { $match: { date: { $gte: start, $lte: end } } },
            { $group: { _id: '$date', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);
        // Inactive members (haven't visited in 14 days)
        const cutoffDate = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];
        const recentlyActive = await Attendance_1.Attendance.distinct('member', { date: { $gte: cutoffDate } });
        const inactiveCount = await Member_1.Member.countDocuments({
            isActive: true,
            _id: { $nin: recentlyActive },
        });
        res.json({ success: true, data: { daily, inactiveCount } });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=attendance.js.map