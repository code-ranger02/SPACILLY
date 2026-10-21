import { Router } from 'express';
import { authenticate, authorize } from "../middleware/auth.js";
import {
  getDashboard,
  getOrderFacets,
  getOrders,
  getOrder,
  updateOrderStatus,
  completeOrder,
  getOrderLogs,
} from "../controllers/adminOrdersController.js";

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/facets', getOrderFacets);
router.get('/', getOrders);
router.get('/:orderId', getOrder);
router.patch('/:orderId/status', updateOrderStatus);
router.post('/:orderId/complete', completeOrder);
router.get('/:orderId/logs', getOrderLogs);

export default router;
