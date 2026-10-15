"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const GymSettings_1 = require("../models/GymSettings");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// GET /api/settings (public-ish for website display)
router.get('/', async (req, res, next) => {
    try {
        let settings = await GymSettings_1.GymSettings.findOne();
        if (!settings) {
            // Create defaults
            settings = await GymSettings_1.GymSettings.create({
                gymName: process.env.GYM_NAME || 'FitManager Gym',
                address: '123 Fitness Street',
                city: 'Mumbai',
                phone: '+91 9876543210',
                currency: 'INR',
                currencySymbol: '₹',
                timezone: 'Asia/Kolkata',
                operatingHours: [
                    { day: 'Monday', open: '05:00', close: '22:00', isClosed: false },
                    { day: 'Tuesday', open: '05:00', close: '22:00', isClosed: false },
                    { day: 'Wednesday', open: '05:00', close: '22:00', isClosed: false },
                    { day: 'Thursday', open: '05:00', close: '22:00', isClosed: false },
                    { day: 'Friday', open: '05:00', close: '22:00', isClosed: false },
                    { day: 'Saturday', open: '06:00', close: '20:00', isClosed: false },
                    { day: 'Sunday', open: '07:00', close: '14:00', isClosed: false },
                ],
                smtpConfigured: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
                razorpayConfigured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
            });
        }
        res.json({ success: true, data: settings });
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/settings (admin only)
router.put('/', (0, auth_1.authorize)('admin'), async (req, res, next) => {
    try {
        const allowedFields = [
            'gymName', 'tagline', 'logo', 'address', 'city', 'state', 'pincode',
            'phone', 'email', 'website', 'currency', 'currencySymbol', 'timezone',
            'operatingHours', 'socialMedia', 'receiptFooter', 'gstNumber', 'notificationSettings',
        ];
        const updates = {};
        allowedFields.forEach(f => { if (req.body[f] !== undefined)
            updates[f] = req.body[f]; });
        let settings = await GymSettings_1.GymSettings.findOne();
        if (!settings) {
            settings = await GymSettings_1.GymSettings.create(updates);
        }
        else {
            Object.assign(settings, updates);
            await settings.save();
        }
        res.json({ success: true, data: settings, message: 'Settings updated' });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=settings.js.map