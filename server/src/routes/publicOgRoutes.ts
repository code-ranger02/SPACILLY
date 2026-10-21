import { Router } from 'express';
import { ogProductCard } from "../controllers/publicOgController.js";

const router = Router();

router.get('/product/:slug', ogProductCard);

export default router;
