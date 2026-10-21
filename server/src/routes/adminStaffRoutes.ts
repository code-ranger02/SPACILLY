import { Router } from 'express';
import { authenticate, authorize } from "../middleware/auth.js";
import { attachAdminAccess, requireSuperAdmin } from "../middleware/adminAccess.js";
import {
  createAdminStaff,
  deactivateAdminStaff,
  getAdminStaffPresets,
  getMyAdminAccess,
  listAdminStaff,
  listAdminStaffAudit,
  updateAdminStaff,
} from "../controllers/adminStaffController.js";

const router = Router();

router.use(authenticate, authorize('admin'), attachAdminAccess);

router.get('/presets', getAdminStaffPresets);
router.get('/me', getMyAdminAccess);

router.get('/', requireSuperAdmin, listAdminStaff);
router.get('/audit', requireSuperAdmin, listAdminStaffAudit);
router.post('/', requireSuperAdmin, createAdminStaff);
router.patch('/:staffId', requireSuperAdmin, updateAdminStaff);
router.delete('/:staffId', requireSuperAdmin, deactivateAdminStaff);

export default router;
