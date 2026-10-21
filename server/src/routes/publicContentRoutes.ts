import { Router } from 'express';
import { optionalAuthenticate } from "../middleware/auth.js";
import { getPublicHomePromoBanners } from "../controllers/buyerHomePromoController.js";
import { getPublicHeroCarousel } from "../controllers/buyerHeroCarouselController.js";
import { getPublicReferralProgramStatus } from "../controllers/marketingPublicController.js";
import { getPublicPaymentGateways } from "../controllers/paymentPublicController.js";
import { createAdvertisingInquiry } from "../controllers/sellerAdvertisingController.js";
import { getPublicFeeSchedule } from "../controllers/sellerFeeScheduleController.js";
import { getPublicHomeLayout } from "../controllers/buyerHomeLayoutController.js";

const router = Router();

router.get('/home-promo-banners', getPublicHomePromoBanners);
router.get('/hero-carousel', getPublicHeroCarousel);
router.get('/marketing/referral-status', getPublicReferralProgramStatus);
router.get('/payment-gateways', getPublicPaymentGateways);
router.post('/advertising/inquiries', optionalAuthenticate, createAdvertisingInquiry);
router.get('/fee-schedule', getPublicFeeSchedule);
router.get('/home-product-layout', getPublicHomeLayout);

export default router;
