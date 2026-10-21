import { Router } from 'express';
import { authenticate } from "../middleware/auth.js";
import { postShippingEstimatePublic, postShippingQuote } from "../controllers/shippingQuoteController.js";
import {
  listPublicDestinations,
  resolveDestination,
} from "../controllers/deliveryDestinationController.js";
import { getPublicPlatformContext } from "../controllers/platformShippingPolicyController.js";

const router = Router();

router.get('/platform-context', getPublicPlatformContext);
router.get('/destinations', listPublicDestinations);
router.get('/destinations/resolve', resolveDestination);
router.post('/estimate', postShippingEstimatePublic);
router.post('/quote', authenticate, postShippingQuote);

export default router;
