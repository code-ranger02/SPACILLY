import { Router } from 'express';
import { authenticate } from "../middleware/auth.js";
import { getBuyerReferral } from "../controllers/buyerReferralController.js";

const router = Router();

router.use(authenticate);
router.get('/', getBuyerReferral);

export default router;
