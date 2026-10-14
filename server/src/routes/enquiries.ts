import { Router, Response, NextFunction } from 'express';
import { Enquiry } from '../models/Enquiry';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// POST /api/enquiries (public)
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, message, interestedIn, source } = req.body;
    if (!name || !phone || !message) throw new AppError('Name, phone, and message are required', 400);

    const enquiry = await Enquiry.create({
      name, email, phone, message, interestedIn,
      source: source || 'website',
      ip: req.ip,
    });
    res.status(201).json({ success: true, message: 'Enquiry submitted. We will contact you soon!', data: { id: enquiry._id } });
  } catch (err) { next(err); }
});

router.use(authenticate, authorize('admin', 'staff'));

// GET /api/enquiries
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { status } = req.query;
    const filter: Record<string, any> = {};
    if (status) filter.status = status;

    const [enquiries, total] = await Promise.all([
      Enquiry.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Enquiry.countDocuments(filter),
    ]);
    res.json({ success: true, data: enquiries, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

// PATCH /api/enquiries/:id
router.patch('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, notes, followUpDate, assignedTo } = req.body;
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { status, notes, followUpDate, assignedTo }, { new: true });
    if (!enquiry) throw new AppError('Enquiry not found', 404);
    res.json({ success: true, data: enquiry });
  } catch (err) { next(err); }
});

export default router;
