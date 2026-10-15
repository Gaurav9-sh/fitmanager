"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
const AuditLog_1 = require("../models/AuditLog");
const router = (0, express_1.Router)();
const signToken = (id, role, email) => {
    return jsonwebtoken_1.default.sign({ id, role, email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};
const sendTokenResponse = (user, statusCode, res) => {
    const token = signToken(user._id.toString(), user.role, user.email);
    const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax'),
    };
    res.cookie('token', token, cookieOptions);
    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            avatar: user.avatar,
            memberId: user.memberId,
            trainerId: user.trainerId,
        },
    });
};
// POST /api/auth/login
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new errorHandler_1.AppError('Email and password are required', 400);
        }
        const user = await User_1.User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            throw new errorHandler_1.AppError('Invalid email or password', 401);
        }
        if (!user.isActive) {
            throw new errorHandler_1.AppError('Account is deactivated. Please contact admin.', 403);
        }
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });
        logger_1.logger.info(`User ${user.email} logged in`);
        sendTokenResponse(user, 200, res);
    }
    catch (err) {
        next(err);
    }
});
// POST /api/auth/register (public - creates member role)
router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password || !phone) {
            throw new errorHandler_1.AppError('Name, email, password, and phone are required', 400);
        }
        if (password.length < 6) {
            throw new errorHandler_1.AppError('Password must be at least 6 characters', 400);
        }
        const existing = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existing) {
            throw new errorHandler_1.AppError('An account with this email already exists', 409);
        }
        // Always create as member role - never admin
        const user = await User_1.User.create({
            name,
            email,
            password,
            phone,
            role: 'member',
        });
        sendTokenResponse(user, 201, res);
    }
    catch (err) {
        next(err);
    }
});
// POST /api/auth/logout
router.post('/logout', auth_1.authenticate, (req, res) => {
    res.cookie('token', '', {
        expires: new Date(0),
        httpOnly: true,
    });
    res.json({ success: true, message: 'Logged out successfully' });
});
// GET /api/auth/me
router.get('/me', auth_1.authenticate, async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.id)
            .populate('memberId', 'memberId name status')
            .populate('trainerId', 'name specialties');
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404);
        }
        res.json({ success: true, user });
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/auth/change-password
router.put('/change-password', auth_1.authenticate, async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            throw new errorHandler_1.AppError('Current and new password are required', 400);
        }
        if (newPassword.length < 6) {
            throw new errorHandler_1.AppError('New password must be at least 6 characters', 400);
        }
        const user = await User_1.User.findById(req.user.id).select('+password');
        if (!user || !(await user.comparePassword(currentPassword))) {
            throw new errorHandler_1.AppError('Current password is incorrect', 401);
        }
        user.password = newPassword;
        await user.save();
        await AuditLog_1.AuditLog.create({
            performedBy: req.user.id,
            action: 'PASSWORD_CHANGED',
            entity: 'User',
            entityId: user._id,
            ipAddress: req.ip,
        });
        res.json({ success: true, message: 'Password changed successfully' });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map