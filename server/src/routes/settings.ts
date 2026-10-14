import { Router, Response, NextFunction } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { GymSettings } from '../models/GymSettings';
import { AppError } from '../middleware/errorHandler';

const router = Router();
router.use(authenticate);

// GET /api/settings (public-ish for website display)
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let settings = await GymSettings.findOne();
    if (!settings) {
      // Create defaults
      settings = await GymSettings.create({
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
  } catch (err) { next(err); }
});

// PUT /api/settings (admin only)
router.put('/', authorize('admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const allowedFields = [
      'gymName', 'tagline', 'logo', 'address', 'city', 'state', 'pincode',
      'phone', 'email', 'website', 'currency', 'currencySymbol', 'timezone',
      'operatingHours', 'socialMedia', 'receiptFooter', 'gstNumber', 'notificationSettings',
    ];
    const updates: Record<string, any> = {};
    allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    let settings = await GymSettings.findOne();
    if (!settings) {
      settings = await GymSettings.create(updates);
    } else {
      Object.assign(settings, updates);
      await settings.save();
    }
    res.json({ success: true, data: settings, message: 'Settings updated' });
  } catch (err) { next(err); }
});

export default router;
