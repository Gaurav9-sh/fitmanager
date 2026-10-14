import cron from 'node-cron';
import { Subscription } from '../models/Subscription';
import { Member } from '../models/Member';
import { Invoice } from '../models/Invoice';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { logger } from '../utils/logger';

export const initCronJobs = () => {
  // Run daily at 7 AM IST
  cron.schedule('0 0 7 * * *', async () => {
    logger.info('Running daily cron jobs...');
    await Promise.allSettled([
      updateExpiredSubscriptions(),
      sendExpiryReminders(),
      markOverdueInvoices(),
    ]);
  }, { timezone: 'Asia/Kolkata' });

  logger.info('✅ Cron jobs initialized');
};

async function updateExpiredSubscriptions() {
  try {
    const now = new Date();
    const expired = await Subscription.find({
      status: 'active',
      endDate: { $lt: now },
    });

    for (const sub of expired) {
      sub.status = 'expired';
      await sub.save();
      await Member.findByIdAndUpdate(sub.member, { status: 'expired' });
    }

    if (expired.length > 0) {
      logger.info(`Updated ${expired.length} expired subscriptions`);
    }
  } catch (err) {
    logger.error('Error updating expired subscriptions:', err);
  }
}

async function sendExpiryReminders() {
  try {
    const now = new Date();
    const reminderDays = [7, 3, 1];

    for (const days of reminderDays) {
      const targetDate = new Date(now.getTime() + days * 86400000);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      const expiringToday = await Subscription.find({
        status: 'active',
        endDate: {
          $gte: new Date(targetDateStr),
          $lt: new Date(new Date(targetDateStr).getTime() + 86400000),
        },
      }).populate('member', 'userId name');

      for (const sub of expiringToday) {
        const member = sub.member as any;
        if (!member?.userId) continue;

        // Check if notification already sent today for this member+days
        const existingNotif = await Notification.findOne({
          relatedMember: member._id,
          type: 'renewal_reminder',
          createdAt: { $gte: new Date(now.toISOString().split('T')[0]) },
        });
        if (existingNotif) continue;

        await Notification.create({
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
    const adminUsers = await User.find({ role: 'admin', isActive: true });
    const expiring7 = await Subscription.countDocuments({
      status: 'active',
      endDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 86400000) },
    });

    if (expiring7 > 0) {
      for (const admin of adminUsers) {
        const existing = await Notification.findOne({
          recipient: admin._id,
          type: 'membership_expiry',
          createdAt: { $gte: new Date(now.toISOString().split('T')[0]) },
        });
        if (!existing) {
          await Notification.create({
            recipient: admin._id,
            type: 'membership_expiry',
            title: `${expiring7} Memberships Expiring Soon`,
            message: `${expiring7} member(s) have memberships expiring in the next 7 days.`,
          });
        }
      }
    }
  } catch (err) {
    logger.error('Error sending expiry reminders:', err);
  }
}

async function markOverdueInvoices() {
  try {
    const now = new Date();
    const result = await Invoice.updateMany(
      {
        status: { $in: ['pending', 'partially_paid'] },
        dueDate: { $lt: now },
      },
      { status: 'overdue' }
    );
    if (result.modifiedCount > 0) {
      logger.info(`Marked ${result.modifiedCount} invoices as overdue`);
    }
  } catch (err) {
    logger.error('Error marking overdue invoices:', err);
  }
}
