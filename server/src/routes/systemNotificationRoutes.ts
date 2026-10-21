import { Router } from 'express';
import { authenticate, authorize } from "../middleware/auth.js";
import {
  getNotifications,
  markAsRead,
  getUnreadCount,
} from "../controllers/systemNotificationController.js";

const router = Router();

router.use(authenticate);
router.use(authorize('seller', 'admin', 'buyer'));

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.post('/:notificationId/read', markAsRead);

export default router;

