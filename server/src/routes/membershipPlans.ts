import { Router, Response, NextFunction } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { MembershipPlan } from '../models/MembershipPlan';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// GET /api/membership-plans (public for website display)
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const onlyActive = req.query.active !== 'false';
    const filter = onlyActive ? { isActive: true } : {};
    const plans = await MembershipPlan.find(filter).sort({ price: 1 });
    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
});

// POST /api/membership-plans
router.post('/', authenticate, authorize('admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, durationDays, durationLabel, price, features, category, isPopular, color, maxFreeze, allowedGuestPasses } = req.body;
    if (!name || !durationDays || !price) {
      throw new AppError('Name, duration, and price are required', 400);
    }
    const plan = await MembershipPlan.create({
      name, description, durationDays, durationLabel: durationLabel || `${durationDays} Days`,
      price: Math.round(price * 100), // convert to paise
      features: features || [],
      category: category || 'standard',
      isPopular: isPopular || false,
      color, maxFreeze, allowedGuestPasses,
    });
    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
});

// PUT /api/membership-plans/:id
router.put('/:id', authenticate, authorize('admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, durationDays, durationLabel, price, features, category, isPopular, isActive, color } = req.body;
    const updateData: any = { name, description, durationDays, durationLabel, features, category, isPopular, isActive, color };
    if (price !== undefined) updateData.price = Math.round(price * 100);

    const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!plan) throw new AppError('Plan not found', 404);
    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/membership-plans/:id/toggle
router.patch('/:id/toggle', authenticate, authorize('admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const plan = await MembershipPlan.findById(req.params.id);
    if (!plan) throw new AppError('Plan not found', 404);
    plan.isActive = !plan.isActive;
    await plan.save();
    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
});

export default router;
