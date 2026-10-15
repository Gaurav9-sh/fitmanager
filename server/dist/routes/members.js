"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const qrcode_1 = __importDefault(require("qrcode"));
const auth_1 = require("../middleware/auth");
const Member_1 = require("../models/Member");
const User_1 = require("../models/User");
const Subscription_1 = require("../models/Subscription");
const Invoice_1 = require("../models/Invoice");
const Attendance_1 = require("../models/Attendance");
const AuditLog_1 = require("../models/AuditLog");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// GET /api/members
router.get('/', (0, auth_1.authorize)('admin', 'staff'), async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const status = req.query.status;
        const planId = req.query.planId;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const filter = { isActive: true };
        if (status && status !== 'all')
            filter.status = status;
        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [{ name: regex }, { phone: regex }, { email: regex }, { memberId: regex }];
        }
        const [members, total] = await Promise.all([
            Member_1.Member.find(filter)
                .populate('assignedTrainer', 'name specialties')
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(limit)
                .lean(),
            Member_1.Member.countDocuments(filter),
        ]);
        // Attach active subscription info
        const memberIds = members.map((m) => m._id);
        const now = new Date();
        const activeSubs = await Subscription_1.Subscription.find({
            member: { $in: memberIds },
            status: 'active',
            startDate: { $lte: now },
            endDate: { $gte: now },
        }).lean();
        const subMap = new Map(activeSubs.map((s) => [s.member.toString(), s]));
        const enriched = members.map((m) => ({
            ...m,
            activeSubscription: subMap.get(m._id.toString()) || null,
        }));
        res.json({
            success: true,
            data: enriched,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/members
router.post('/', (0, auth_1.authorize)('admin', 'staff'), async (req, res, next) => {
    try {
        const { name, email, phone, alternatePhone, dateOfBirth, gender, address, city, bloodGroup, fitnessGoal, medicalNotes, emergencyContact, joiningDate, notes, } = req.body;
        if (!name || !phone) {
            throw new errorHandler_1.AppError('Name and phone are required', 400);
        }
        // Create user account for member
        let userPassword = phone; // default password = phone number
        const user = await User_1.User.create({
            name,
            email: email || `${phone}@fitmanager.local`,
            password: userPassword,
            phone,
            role: 'member',
        });
        // Generate QR code
        const qrToken = require('uuid').v4();
        const qrDataUrl = await qrcode_1.default.toDataURL(JSON.stringify({ type: 'member_checkin', token: qrToken, v: 1 }), { errorCorrectionLevel: 'M', width: 256 });
        const member = await Member_1.Member.create({
            userId: user._id,
            name,
            email: email || undefined,
            phone,
            alternatePhone,
            dateOfBirth,
            gender,
            address,
            city,
            bloodGroup,
            fitnessGoal,
            medicalNotes,
            emergencyContact,
            joiningDate: joiningDate || new Date(),
            notes,
            status: 'pending',
            qrToken,
            qrCode: qrDataUrl,
            createdBy: req.user.id,
        });
        // Link member to user
        await User_1.User.findByIdAndUpdate(user._id, { memberId: member._id });
        await AuditLog_1.AuditLog.create({
            performedBy: req.user.id,
            action: 'MEMBER_CREATED',
            entity: 'Member',
            entityId: member._id,
            after: { name, phone, email },
            ipAddress: req.ip,
        });
        res.status(201).json({ success: true, data: member, message: 'Member created successfully' });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/members/:id
router.get('/:id', async (req, res, next) => {
    try {
        // Members can only view their own profile
        const isMember = req.user?.role === 'member';
        const member = await Member_1.Member.findById(req.params.id)
            .populate('assignedTrainer', 'name specialties phone email bio photo')
            .populate('userId', 'email lastLogin');
        if (!member)
            throw new errorHandler_1.AppError('Member not found', 404);
        if (isMember) {
            const user = await User_1.User.findById(req.user.id);
            if (user?.memberId?.toString() !== member._id.toString()) {
                throw new errorHandler_1.AppError('Access denied', 403);
            }
        }
        const subscriptions = await Subscription_1.Subscription.find({ member: member._id })
            .sort({ startDate: -1 });
        const invoices = await Invoice_1.Invoice.find({ member: member._id })
            .sort({ createdAt: -1 });
        const attendanceCount = await Attendance_1.Attendance.countDocuments({ member: member._id });
        const recentAttendance = await Attendance_1.Attendance.find({ member: member._id })
            .sort({ checkInTime: -1 })
            .limit(30);
        res.json({
            success: true,
            data: { member, subscriptions, invoices, attendanceCount, recentAttendance },
        });
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/members/:id
router.put('/:id', (0, auth_1.authorize)('admin', 'staff'), async (req, res, next) => {
    try {
        const { name, email, phone, alternatePhone, dateOfBirth, gender, address, city, bloodGroup, fitnessGoal, medicalNotes, emergencyContact, notes, assignedTrainer, } = req.body;
        const before = await Member_1.Member.findById(req.params.id).lean();
        if (!before)
            throw new errorHandler_1.AppError('Member not found', 404);
        const updated = await Member_1.Member.findByIdAndUpdate(req.params.id, {
            name, email, phone, alternatePhone, dateOfBirth, gender,
            address, city, bloodGroup, fitnessGoal, medicalNotes,
            emergencyContact, notes, assignedTrainer,
        }, { new: true, runValidators: true });
        await AuditLog_1.AuditLog.create({
            performedBy: req.user.id,
            action: 'MEMBER_UPDATED',
            entity: 'Member',
            entityId: updated._id,
            before: { name: before.name, phone: before.phone },
            after: { name, phone },
            ipAddress: req.ip,
        });
        res.json({ success: true, data: updated });
    }
    catch (err) {
        next(err);
    }
});
// PATCH /api/members/:id/status
router.patch('/:id/status', (0, auth_1.authorize)('admin'), async (req, res, next) => {
    try {
        const { status, reason } = req.body;
        if (!['active', 'suspended', 'pending'].includes(status)) {
            throw new errorHandler_1.AppError('Invalid status', 400);
        }
        const member = await Member_1.Member.findByIdAndUpdate(req.params.id, { status, isActive: status !== 'suspended' }, { new: true });
        if (!member)
            throw new errorHandler_1.AppError('Member not found', 404);
        await AuditLog_1.AuditLog.create({
            performedBy: req.user.id,
            action: 'MEMBER_STATUS_CHANGED',
            entity: 'Member',
            entityId: member._id,
            after: { status, reason },
            ipAddress: req.ip,
        });
        res.json({ success: true, data: member });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/members/:id/qr
router.get('/:id/qr', async (req, res, next) => {
    try {
        const member = await Member_1.Member.findById(req.params.id).select('qrCode name memberId');
        if (!member)
            throw new errorHandler_1.AppError('Member not found', 404);
        // Only admin, staff, or the member themselves
        if (req.user?.role === 'member') {
            const user = await User_1.User.findById(req.user.id);
            if (user?.memberId?.toString() !== member._id.toString()) {
                throw new errorHandler_1.AppError('Access denied', 403);
            }
        }
        res.json({ success: true, data: { qrCode: member.qrCode, name: member.name, memberId: member.memberId } });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/members/search/global
router.get('/search/global', (0, auth_1.authorize)('admin', 'staff'), async (req, res, next) => {
    try {
        const q = req.query.q;
        if (!q || q.length < 2) {
            res.json({ success: true, data: [] });
            return;
        }
        const regex = new RegExp(q, 'i');
        const members = await Member_1.Member.find({
            isActive: true,
            $or: [{ name: regex }, { phone: regex }, { memberId: regex }, { email: regex }],
        })
            .select('name memberId phone status')
            .limit(10);
        res.json({ success: true, data: members });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=members.js.map