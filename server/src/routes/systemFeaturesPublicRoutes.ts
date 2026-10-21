import { Router } from 'express';
import { getPublicFeatures } from "../controllers/systemFeaturesPublicController.js";

const router = Router();
router.get('/features', getPublicFeatures);

export default router;
