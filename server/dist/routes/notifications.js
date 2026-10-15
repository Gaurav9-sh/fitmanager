"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Notification_1 = require("../models/Notification");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// GET /api/notifications
router.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const unreadOnly = req.query.unread === 'true';
        const filter = { recipient: req.user.id };
        if (unreadOnly)
            filter.isRead = false;
        const [notifications, total, unreadCount] = await Promise.all([
            Notification_1.Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
            Notification_1.Notification.countDocuments(filter),
            Notification_1.Notification.countDocuments({ recipient: req.user.id, isRead: false }),
        ]);
        res.json({ success: true, data: notifications, unreadCount, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    }
    catch (err) {
        next(err);
    }
});
// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res, next) => {
    try {
        const notification = await Notification_1.Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user.id }, { isRead: true }, { new: true });
        if (!notification)
            throw new errorHandler_1.AppError('Notification not found', 404);
        res.json({ success: true, data: notification });
    }
    catch (err) {
        next(err);
    }
});
// PATCH /api/notifications/mark-all-read
router.patch('/mark-all-read', async (req, res, next) => {
    try {
        await Notification_1.Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
        res.json({ success: true, message: 'All notifications marked as read' });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map