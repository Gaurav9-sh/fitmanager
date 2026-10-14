import { Router, Response, NextFunction } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { Trainer } from '../models/Trainer';
import { User } from '../models/User';
import { Member } from '../models/Member';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// GET /api/trainers (public for website)
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const trainers = await Trainer.find({ isActive: true })
      .select('-salary -assignedMembers')
      .sort({ experience: -1 });
    res.json({ success: true, data: trainers });
  } catch (err) { next(err); }
});

router.use(authenticate);

// POST /api/trainers
router.post('/', authorize('admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, specialties, qualifications, experience, bio, salary, availability, joinDate } = req.body;
    if (!name || !phone) throw new AppError('Name and phone are required', 400);

    const user = await User.create({
      name, email: email || `trainer_${phone}@fitmanager.local`,
      password: phone, phone, role: 'trainer',
    });

    const trainer = await Trainer.create({
      userId: user._id, name, email, phone,
      specialties: specialties || [], qualifications: qualifications || [],
      experience: experience || 0, bio, salary: salary ? Math.round(salary * 100) : undefined,
      availability: availability || [], joinDate: joinDate || new Date(),
    });

    await User.findByIdAndUpdate(user._id, { trainerId: trainer._id });

    res.status(201).json({ success: true, data: trainer });
  } catch (err) { next(err); }
});

// PUT /api/trainers/:id
router.put('/:id', authorize('admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const updates = req.body;
    if (updates.salary) updates.salary = Math.round(updates.salary * 100);
    const trainer = await Trainer.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!trainer) throw new AppError('Trainer not found', 404);
    res.json({ success: true, data: trainer });
  } catch (err) { next(err); }
});

// POST /api/trainers/:id/assign-member
router.post('/:id/assign-member', authorize('admin', 'staff'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { memberId } = req.body;
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) throw new AppError('Trainer not found', 404);

    if (!trainer.assignedMembers.some(m => m.toString() === memberId)) {
      trainer.assignedMembers.push(memberId);
      await trainer.save();
    }

    await Member.findByIdAndUpdate(memberId, { assignedTrainer: trainer._id });

    res.json({ success: true, data: trainer, message: 'Member assigned to trainer' });
  } catch (err) { next(err); }
});

// GET /api/trainers/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const trainer = await Trainer.findById(req.params.id)
      .populate('assignedMembers', 'name memberId phone status');
    if (!trainer) throw new AppError('Trainer not found', 404);
    res.json({ success: true, data: trainer });
  } catch (err) { next(err); }
});

export default router;
