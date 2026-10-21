import { Router } from 'express';
import { authenticate } from "../middleware/auth.js";
import { getBuyerCloudCart, syncBuyerCloudCart } from "../controllers/buyerCartController.js";

const router = Router();

router.get('/', authenticate, getBuyerCloudCart);
router.put('/sync', authenticate, syncBuyerCloudCart);

export default router;
