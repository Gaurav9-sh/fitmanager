"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Subscription_1 = require("../models/Subscription");
const Member_1 = require("../models/Member");
const MembershipPlan_1 = require("../models/MembershipPlan");
const Invoice_1 = require("../models/Invoice");
const AuditLog_1 = require("../models/AuditLog");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// POST /api/subscriptions - Create new or renewal subscription
router.post('/', (0, auth_1.authorize)('admin', 'staff'), async (req, res, next) => {
    try {
        const { memberId, planId, startDate, discount, discountReason, notes } = req.body;
        if (!memberId || !planId || !startDate) {
            throw new errorHandler_1.AppError('Member, plan, and start date are required', 400);
        }
        const [member, plan] = await Promise.all([
            Member_1.Member.findById(memberId),
            MembershipPlan_1.MembershipPlan.findById(planId),
        ]);
        if (!member)
            throw new errorHandler_1.AppError('Member not found', 404);
        if (!plan || !plan.isActive)
            throw new errorHandler_1.AppError('Plan not found or inactive', 404);
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + plan.durationDays);
        // Check for overlapping active subscription
        const overlapping = await Subscription_1.Subscription.findOne({
            member: memberId,
            status: 'active',
            startDate: { $lte: end },
            endDate: { $gte: start },
        });
        if (overlapping) {
            throw new errorHandler_1.AppError('Member already has an active subscription for this period', 409);
        }
        const discountPaise = discount ? Math.round(discount * 100) : 0;
        const finalPrice = plan.price - discountPaise;
        // Get previous subscription for renewal tracking
        const prevSub = await Subscription_1.Subscription.findOne({ member: memberId }).sort({ createdAt: -1 });
        const isRenewal = !!prevSub;
        const subscription = await Subscription_1.Subscription.create({
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
            createdBy: req.user.id,
        });
        // Update member status to active
        await Member_1.Member.findByIdAndUpdate(memberId, { status: 'active' });
        // Create invoice
        const invoice = await Invoice_1.Invoice.create({
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
            createdBy: req.user.id,
        });
        await AuditLog_1.AuditLog.create({
            performedBy: req.user.id,
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
    }
    catch (err) {
        next(err);
    }
});
// GET /api/subscriptions?memberId=xxx
router.get('/', (0, auth_1.authorize)('admin', 'staff', 'trainer'), async (req, res, next) => {
    try {
        const { memberId, status, expiringDays } = req.query;
        const filter = {};
        if (memberId)
            filter.member = memberId;
        if (status)
            filter.status = status;
        if (expiringDays) {
            const days = parseInt(expiringDays);
            const now = new Date();
            filter.status = 'active';
            filter.endDate = { $gte: now, $lte: new Date(now.getTime() + days * 86400000) };
        }
        const subs = await Subscription_1.Subscription.find(filter)
            .populate('member', 'name memberId phone')
            .populate('plan', 'name')
            .sort({ endDate: 1 });
        res.json({ success: true, data: subs });
    }
    catch (err) {
        next(err);
    }
});
// PATCH /api/subscriptions/:id/suspend
router.patch('/:id/suspend', (0, auth_1.authorize)('admin'), async (req, res, next) => {
    try {
        const { reason } = req.body;
        const sub = await Subscription_1.Subscription.findById(req.params.id);
        if (!sub)
            throw new errorHandler_1.AppError('Subscription not found', 404);
        sub.status = 'suspended';
        sub.suspendedAt = new Date();
        sub.suspendReason = reason;
        await sub.save();
        await Member_1.Member.findByIdAndUpdate(sub.member, { status: 'suspended' });
        res.json({ success: true, data: sub, message: 'Subscription suspended' });
    }
    catch (err) {
        next(err);
    }
});
// PATCH /api/subscriptions/:id/reactivate
router.patch('/:id/reactivate', (0, auth_1.authorize)('admin'), async (req, res, next) => {
    try {
        const sub = await Subscription_1.Subscription.findById(req.params.id);
        if (!sub)
            throw new errorHandler_1.AppError('Subscription not found', 404);
        const now = new Date();
        if (now > sub.endDate) {
            throw new errorHandler_1.AppError('Cannot reactivate an expired subscription. Please renew instead.', 400);
        }
        sub.status = 'active';
        sub.suspendedAt = undefined;
        sub.suspendReason = undefined;
        await sub.save();
        await Member_1.Member.findByIdAndUpdate(sub.member, { status: 'active' });
        res.json({ success: true, data: sub, message: 'Subscription reactivated' });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=subscriptions.js.map