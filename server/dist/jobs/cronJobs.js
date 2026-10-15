"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCronJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const Subscription_1 = require("../models/Subscription");
const Member_1 = require("../models/Member");
const Invoice_1 = require("../models/Invoice");
const Notification_1 = require("../models/Notification");
const User_1 = require("../models/User");
const logger_1 = require("../utils/logger");
const initCronJobs = () => {
    // Run daily at 7 AM IST
    node_cron_1.default.schedule('0 0 7 * * *', async () => {
        logger_1.logger.info('Running daily cron jobs...');
        await Promise.allSettled([
            updateExpiredSubscriptions(),
            sendExpiryReminders(),
            markOverdueInvoices(),
        ]);
    }, { timezone: 'Asia/Kolkata' });
    logger_1.logger.info('✅ Cron jobs initialized');
};
exports.initCronJobs = initCronJobs;
async function updateExpiredSubscriptions() {
    try {
        const now = new Date();
        const expired = await Subscription_1.Subscription.find({
            status: 'active',
            endDate: { $lt: now },
        });
        for (const sub of expired) {
            sub.status = 'expired';
            await sub.save();
            await Member_1.Member.findByIdAndUpdate(sub.member, { status: 'expired' });
        }
        if (expired.length > 0) {
            logger_1.logger.info(`Updated ${expired.length} expired subscriptions`);
        }
    }
    catch (err) {
        logger_1.logger.error('Error updating expired subscriptions:', err);
    }
}
async function sendExpiryReminders() {
    try {
        const now = new Date();
        const reminderDays = [7, 3, 1];
        for (const days of reminderDays) {
            const targetDate = new Date(now.getTime() + days * 86400000);
            const targetDateStr = targetDate.toISOString().split('T')[0];
            const expiringToday = await Subscription_1.Subscription.find({
                status: 'active',
                endDate: {
                    $gte: new Date(targetDateStr),
                    $lt: new Date(new Date(targetDateStr).getTime() + 86400000),
                },
            }).populate('member', 'userId name');
            for (const sub of expiringToday) {
                const member = sub.member;
                if (!member?.userId)
                    continue;
                // Check if notification already sent today for this member+days
                const existingNotif = await Notification_1.Notification.findOne({
                    relatedMember: member._id,
                    type: 'renewal_reminder',
                    createdAt: { $gte: new Date(now.toISOString().split('T')[0]) },
                });
                if (existingNotif)
                    continue;
                await Notification_1.Notification.create({
                    recipient: member.userId,
                    type: 'renewal_reminder',
                    title: 'Membership Expiring Soon',
                    message: `Your membership expires in ${days} day(s) on ${new Date(sub.endDate).toLocaleDateString('en-IN')}. Renew now to stay active!`,
                    relatedMember: member._id,
                    relatedSubscription: sub._id,
                });
            }
        }
        // Send admin notifications for expiring within 7 days
        const adminUsers = await User_1.User.find({ role: 'admin', isActive: true });
        const expiring7 = await Subscription_1.Subscription.countDocuments({
            status: 'active',
            endDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 86400000) },
        });
        if (expiring7 > 0) {
            for (const admin of adminUsers) {
                const existing = await Notification_1.Notification.findOne({
                    recipient: admin._id,
                    type: 'membership_expiry',
                    createdAt: { $gte: new Date(now.toISOString().split('T')[0]) },
                });
                if (!existing) {
                    await Notification_1.Notification.create({
                        recipient: admin._id,
                        type: 'membership_expiry',
                        title: `${expiring7} Memberships Expiring Soon`,
                        message: `${expiring7} member(s) have memberships expiring in the next 7 days.`,
                    });
                }
            }
        }
    }
    catch (err) {
        logger_1.logger.error('Error sending expiry reminders:', err);
    }
}
async function markOverdueInvoices() {
    try {
        const now = new Date();
        const result = await Invoice_1.Invoice.updateMany({
            status: { $in: ['pending', 'partially_paid'] },
            dueDate: { $lt: now },
        }, { status: 'overdue' });
        if (result.modifiedCount > 0) {
            logger_1.logger.info(`Marked ${result.modifiedCount} invoices as overdue`);
        }
    }
    catch (err) {
        logger_1.logger.error('Error marking overdue invoices:', err);
    }
}
//# sourceMappingURL=cronJobs.js.map