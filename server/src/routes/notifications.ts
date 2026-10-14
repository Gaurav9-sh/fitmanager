import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Notification } from '../models/Notification';
import { AppError } from '../middleware/errorHandler';

const router = Router();
router.use(authenticate);

// GET /api/notifications
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const unreadOnly = req.query.unread === 'true';

    const filter: Record<string, any> = { recipient: req.user!.id };
    if (unreadOnly) filter.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient: req.user!.id, isRead: false }),
    ]);

    res.json({ success: true, data: notifications, unreadCount, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user!.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) throw new AppError('Notification not found', 404);
    res.json({ success: true, data: notification });
  } catch (err) { next(err); }
});

// PATCH /api/notifications/mark-all-read
router.patch('/mark-all-read', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await Notification.updateMany({ recipient: req.user!.id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
});

export default router;
