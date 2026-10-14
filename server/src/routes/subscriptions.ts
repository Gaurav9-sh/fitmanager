import { Router, Response, NextFunction } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { Subscription } from '../models/Subscription';
import { Member } from '../models/Member';
import { MembershipPlan } from '../models/MembershipPlan';
import { Invoice } from '../models/Invoice';
import { AuditLog } from '../models/AuditLog';
import { AppError } from '../middleware/errorHandler';

const router = Router();
router.use(authenticate);

// POST /api/subscriptions - Create new or renewal subscription
router.post('/', authorize('admin', 'staff'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { memberId, planId, startDate, discount, discountReason, notes } = req.body;
    if (!memberId || !planId || !startDate) {
      throw new AppError('Member, plan, and start date are required', 400);
    }

    const [member, plan] = await Promise.all([
      Member.findById(memberId),
      MembershipPlan.findById(planId),
    ]);

    if (!member) throw new AppError('Member not found', 404);
    if (!plan || !plan.isActive) throw new AppError('Plan not found or inactive', 404);

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + plan.durationDays);

    // Check for overlapping active subscription
    const overlapping = await Subscription.findOne({
      member: memberId,
      status: 'active',
      startDate: { $lte: end },
      endDate: { $gte: start },
    });
    if (overlapping) {
      throw new AppError('Member already has an active subscription for this period', 409);
    }

    const discountPaise = discount ? Math.round(discount * 100) : 0;
    const finalPrice = plan.price - discountPaise;

    // Get previous subscription for renewal tracking
    const prevSub = await Subscription.findOne({ member: memberId }).sort({ createdAt: -1 });
    const isRenewal = !!prevSub;

    const subscription = await Subscription.create({
      member: memberId,
      plan: planId,
      planSnapshot: {
        name: plan.name,
        price: plan.price,
        durationDays: plan.durationDays,
        features: plan.features,
      },
      startDate: start,
      endDate: end,
      status: 'active',
      isRenewal,
      previousSubscription: prevSub?._id,
      discount: discountPaise,
      discountReason,
      finalPrice,
      notes,
      createdBy: req.user!.id,
    });

    // Update member status to active
    await Member.findByIdAndUpdate(memberId, { status: 'active' });

    // Create invoice
    const invoice = await Invoice.create({
      member: memberId,
      subscription: subscription._id,
      description: `${plan.name} - ${plan.durationLabel}`,
      totalAmount: plan.price,
      discountAmount: discountPaise,
      netAmount: finalPrice,
      paidAmount: 0,
      pendingAmount: finalPrice,
      status: 'pending',
      dueDate: start,
      createdBy: req.user!.id,
    });

    await AuditLog.create({
      performedBy: req.user!.id,
      action: isRenewal ? 'SUBSCRIPTION_RENEWED' : 'SUBSCRIPTION_CREATED',
      entity: 'Subscription',
      entityId: subscription._id,
      after: { plan: plan.name, startDate: start, endDate: end, finalPrice },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      data: { subscription, invoice },
      message: isRenewal ? 'Membership renewed successfully' : 'Subscription created successfully',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/subscriptions?memberId=xxx
router.get('/', authorize('admin', 'staff', 'trainer'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { memberId, status, expiringDays } = req.query;
    const filter: Record<string, any> = {};

    if (memberId) filter.member = memberId;
    if (status) filter.status = status;

    if (expiringDays) {
      const days = parseInt(expiringDays as string);
      const now = new Date();
      filter.status = 'active';
      filter.endDate = { $gte: now, $lte: new Date(now.getTime() + days * 86400000) };
    }

    const subs = await Subscription.find(filter)
      .populate('member', 'name memberId phone')
      .populate('plan', 'name')
      .sort({ endDate: 1 });

    res.json({ success: true, data: subs });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/subscriptions/:id/suspend
router.patch('/:id/suspend', authorize('admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    const sub = await Subscription.findById(req.params.id);
    if (!sub) throw new AppError('Subscription not found', 404);

    sub.status = 'suspended';
    sub.suspendedAt = new Date();
    sub.suspendReason = reason;
    await sub.save();

    await Member.findByIdAndUpdate(sub.member, { status: 'suspended' });

    res.json({ success: true, data: sub, message: 'Subscription suspended' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/subscriptions/:id/reactivate
router.patch('/:id/reactivate', authorize('admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) throw new AppError('Subscription not found', 404);

    const now = new Date();
    if (now > sub.endDate) {
      throw new AppError('Cannot reactivate an expired subscription. Please renew instead.', 400);
    }

    sub.status = 'active';
    sub.suspendedAt = undefined;
    sub.suspendReason = undefined;
    await sub.save();

    await Member.findByIdAndUpdate(sub.member, { status: 'active' });

    res.json({ success: true, data: sub, message: 'Subscription reactivated' });
  } catch (err) {
    next(err);
  }
});

export default router;
