"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const MembershipPlan_1 = require("../models/MembershipPlan");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
// GET /api/membership-plans (public for website display)
router.get('/', async (req, res, next) => {
    try {
        const onlyActive = req.query.active !== 'false';
        const filter = onlyActive ? { isActive: true } : {};
        const plans = await MembershipPlan_1.MembershipPlan.find(filter).sort({ price: 1 });
        res.json({ success: true, data: plans });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/membership-plans
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('admin'), async (req, res, next) => {
    try {
        const { name, description, durationDays, durationLabel, price, features, category, isPopular, color, maxFreeze, allowedGuestPasses } = req.body;
        if (!name || !durationDays || !price) {
            throw new errorHandler_1.AppError('Name, duration, and price are required', 400);
        }
        const plan = await MembershipPlan_1.MembershipPlan.create({
            name, description, durationDays, durationLabel: durationLabel || `${durationDays} Days`,
            price: Math.round(price * 100), // convert to paise
            features: features || [],
            category: category || 'standard',
            isPopular: isPopular || false,
            color, maxFreeze, allowedGuestPasses,
        });
        res.status(201).json({ success: true, data: plan });
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/membership-plans/:id
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), async (req, res, next) => {
    try {
        const { name, description, durationDays, durationLabel, price, features, category, isPopular, isActive, color } = req.body;
        const updateData = { name, description, durationDays, durationLabel, features, category, isPopular, isActive, color };
        if (price !== undefined)
            updateData.price = Math.round(price * 100);
        const plan = await MembershipPlan_1.MembershipPlan.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!plan)
            throw new errorHandler_1.AppError('Plan not found', 404);
        res.json({ success: true, data: plan });
    }
    catch (err) {
        next(err);
    }
});
// PATCH /api/membership-plans/:id/toggle
router.patch('/:id/toggle', auth_1.authenticate, (0, auth_1.authorize)('admin'), async (req, res, next) => {
    try {
        const plan = await MembershipPlan_1.MembershipPlan.findById(req.params.id);
        if (!plan)
            throw new errorHandler_1.AppError('Plan not found', 404);
        plan.isActive = !plan.isActive;
        await plan.save();
        res.json({ success: true, data: plan });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=membershipPlans.js.map