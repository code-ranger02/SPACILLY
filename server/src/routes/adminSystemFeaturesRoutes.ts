import { Router } from 'express';
import { authenticate, authorize } from "../middleware/auth.js";
import { requireSuperAdmin } from "../middleware/adminAccess.js";
import {
  getAdminSystemFeatures,
  patchAdminSystemFeatures,
  postSystemFeaturesUnlock,
} from "../controllers/adminSystemFeaturesController.js";
import {
  getAdminHomeLayout,
  postAdminHomeLayoutPublish,
  postAdminHomeLayoutReset,
  putAdminHomeLayoutDraft,
} from "../controllers/buyerHomeLayoutController.js";

const router = Router();

router.use(authenticate, authorize('admin'), requireSuperAdmin);

router.get('/', getAdminSystemFeatures);
router.post('/unlock', postSystemFeaturesUnlock);
router.patch('/', patchAdminSystemFeatures);

router.get('/home-layout', getAdminHomeLayout);
router.put('/home-layout/draft', putAdminHomeLayoutDraft);
router.post('/home-layout/publish', postAdminHomeLayoutPublish);
router.post('/home-layout/reset', postAdminHomeLayoutReset);

export default router;
