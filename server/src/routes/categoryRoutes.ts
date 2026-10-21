import { Router } from 'express';
import { cacheMiddleware } from "../middleware/cache.js";
import { listCategories, getCategoryPublic } from "../controllers/categoryController.js";

const router = Router();

router.get('/', cacheMiddleware(3600), listCategories);
router.get('/slug/:slug', cacheMiddleware(900), getCategoryPublic);

export default router;
