import { Router } from 'express';
import { authenticate } from "../middleware/auth.js";
import {
  getBuyerNotifications,
  getBuyerUnreadNotificationCount,
} from "../controllers/buyerNotificationController.js";

const router = Router();

router.use(authenticate);
router.get('/', getBuyerNotifications);
router.get('/unread-count', getBuyerUnreadNotificationCount);

export default router;
