import { Router } from 'express';
import { authenticate, authorize } from "../middleware/auth.js";
import { addReturnCaseStaffMessage, sellerListReturnCases, updateReturnCaseStatus } from "../controllers/returnsManagementController.js";

const router = Router();

router.use(authenticate);
router.use(authorize('seller', 'admin'));

router.get('/', sellerListReturnCases);
router.patch('/:caseId/status', updateReturnCaseStatus);
router.post('/:caseId/messages', addReturnCaseStaffMessage);

export default router;

