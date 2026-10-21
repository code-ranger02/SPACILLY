import { Router } from 'express';
import { authenticate, authorize } from "../middleware/auth.js";
import { getKycQueues, getSellerKycQueueDetail } from "../controllers/adminKycQueueController.js";

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', getKycQueues);
router.get('/sellers/:sellerId', getSellerKycQueueDetail);

export default router;
