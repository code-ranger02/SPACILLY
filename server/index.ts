import dotenv from 'dotenv';
import path from 'path';

// Load .env first so RESEND_API_KEY and others are available when other modules load
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, 'env') });

import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import cors, { type CorsOptions } from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import authRoutes from "./src/routes/authRoutes.js";
import sellerRoutes from "./src/routes/sellerRoutes.js";
import inventoryRoutes from "./src/routes/inventoryRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import sellerSettingsRoutes from "./src/routes/sellerSettingsRoutes.js";
import sellerKycRoutes from "./src/routes/sellerKycRoutes.js";
import adminKycQueueRoutes from "./src/routes/adminKycQueueRoutes.js";
import supportTicketRoutes from "./src/routes/supportTicketRoutes.js";
import knowledgeBaseRoutes from "./src/routes/knowledgeBaseRoutes.js";
import disputeRoutes from "./src/routes/disputeRoutes.js";
import accountHealthRoutes from "./src/routes/accountHealthRoutes.js";
import systemNotificationRoutes from "./src/routes/systemNotificationRoutes.js";
import subscriptionRoutes from "./src/routes/subscriptionRoutes.js";
import analyticsRoutes from "./src/routes/analyticsRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import buyerOrderRoutes from "./src/routes/buyerOrderRoutes.js";
import buyerCartRoutes from "./src/routes/buyerCartRoutes.js";
import couponRoutes from "./src/routes/couponRoutes.js";
import shippingRoutes from "./src/routes/shippingRoutes.js";
import inboxRoutes from "./src/routes/inboxRoutes.js";
import buyerInboxRoutes from "./src/routes/buyerInboxRoutes.js";
import buyerDisputeRoutes from "./src/routes/buyerDisputeRoutes.js";
import buyerReturnsRoutes from "./src/routes/buyerReturnsRoutes.js";
import sellerReturnsRoutes from "./src/routes/sellerReturnsRoutes.js";
import blogRoutes from "./src/routes/blogRoutes.js";
import affiliateRoutes from "./src/routes/affiliateRoutes.js";
import trackingRoutes from "./src/routes/trackingRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import adminStaffRoutes from "./src/routes/adminStaffRoutes.js";
import adminFinanceRoutes from "./src/routes/adminFinanceRoutes.js";
import adminSupportRoutes from "./src/routes/adminSupportRoutes.js";
import adminLogisticsRoutes from "./src/routes/adminLogisticsRoutes.js";
import adminNotificationsRoutes from "./src/routes/adminNotificationsRoutes.js";
import adminMarketingRoutes from "./src/routes/adminMarketingRoutes.js";
import adminReviewsRoutes from "./src/routes/adminReviewsRoutes.js";
import adminCollectionsRoutes from "./src/routes/adminCollectionsRoutes.js";
import adminProductsRoutes from "./src/routes/adminProductsRoutes.js";
import adminOrdersRoutes from "./src/routes/adminOrdersRoutes.js";
import adminComplianceRoutes from "./src/routes/adminComplianceRoutes.js";
import adminReturnsRoutes from "./src/routes/adminReturnsRoutes.js";
import adminSystemFeaturesRoutes from "./src/routes/adminSystemFeaturesRoutes.js";
import systemFeaturesPublicRoutes from "./src/routes/systemFeaturesPublicRoutes.js";
import adminSellerSubscriptionRoutes from "./src/routes/adminSellerSubscriptionRoutes.js";
import adminIntelligenceSearchRoutes from "./src/routes/adminIntelligenceSearchRoutes.js";
import publicContentRoutes from "./src/routes/publicContentRoutes.js";
import adminSiteContentRoutes from "./src/routes/adminSiteContentRoutes.js";
import { startScheduledNotificationWorker } from "./src/jobs/scheduledNotificationWorker.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import stripeWebhookRoutes from "./src/routes/stripeWebhookRoutes.js";
import webhookRoutes from "./src/routes/webhookRoutes.js";
import seoRoutes from "./src/routes/seoRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import publicOgRoutes from "./src/routes/publicOgRoutes.js";
import assistantRoutes from "./src/routes/assistantRoutes.js";
import aiChatRoutes from "./src/routes/aiChatRoutes.js";
import aiAgentRoutes from "./src/routes/aiAgentRoutes.js";
import buyerNotificationRoutes from "./src/routes/buyerNotificationRoutes.js";
import buyerReferralRoutes from "./src/routes/buyerReferralRoutes.js";
import { sanitizeInput } from "./src/middleware/sanitizeInput.js";
import "./src/jobs/escrowJobs.js";
import "./src/jobs/subscriptionRenewalJob.js";
import { websocketService } from "./src/services/websocketService.js";
import { getAllowedCorsOrigins, isAllowedCorsOrigin } from "./src/config/publicEnv.js";
import keepAlive from "./keepAlive.js";
import rateLimit from 'express-rate-limit';
import { recordApiTiming, seedMonitorLogsOnce } from "./src/services/systemMonitor.service.js";
import systemMonitorRoutes from "./src/routes/systemMonitor.routes.js";
import securityAnalysisRoutes from "./src/routes/securityAnalysis.routes.js";
import recommendationEmailRoutes from "./src/routes/recommendationEmailRoutes.js";
import { startRecommendationEmailWorker } from "./src/services/recommendationEmail.service.js";
import { publicHomeRouter, adminAIRouter } from "./src/routes/marketplaceAIRoutes.js";
import { startMarketplaceAIWorker } from "./src/jobs/marketplaceAIWorker.js";
import productVerificationRoutes from "./src/routes/productVerificationRoutes.js";
import currencyRoutes from "./src/routes/currencyRoutes.js";
import { startExchangeRateWorker } from "./src/services/exchangeRate.service.js";
import newsletterRoutes from "./src/routes/newsletterRoutes.js";
import { startAbandonedCartEmailWorker } from "./src/jobs/abandonedCartEmailWorker.js";
import { startBuyerInsightWorker } from "./src/jobs/buyerInsightWorker.js";
import { startLifecycleEmailWorker } from "./src/jobs/lifecycleEmailWorker.js";
import { startCartPulseEmailWorker } from "./src/jobs/cartPulseEmailWorker.js";
import { startBrowseAbandonEmailWorker } from "./src/jobs/browseAbandonEmailWorker.js";
import { startOrderFulfillmentGuardWorker } from "./src/jobs/orderFulfillmentGuardWorker.js";
import { startDeliveryAutoCompleteWorker } from "./src/jobs/deliveryAutoCompleteWorker.js";
import { startSellerDeliverySLAWorker } from "./src/jobs/sellerDeliverySLAWorker.js";
import { startComplianceCertificateReminderJob } from "./src/jobs/complianceCertificateReminderJob.js";
import pushDeviceRoutes from "./src/routes/pushDeviceRoutes.js";
import warehouseRoutes from "./src/routes/warehouseRoutes.js";
import pickupRoutes from "./src/routes/pickupRoutes.js";
import marketplaceInnovationRoutes from "./src/routes/marketplaceInnovationRoutes.js";
import liveCommerceRoutes from "./src/routes/liveCommerceRoutes.js";
import { logMicroblinkStartupCheck } from "./src/services/microblink.service.js";
import { assertJwtSecretForProduction } from "./src/config/jwtSecret.js";

const app = express();
const httpServer = createServer(app);
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || '';

try {
  assertJwtSecretForProduction();
} catch (err: unknown) {
  console.error('❌', err instanceof Error ? err.message : err);
  process.exit(1);
}

process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
  process.exit(1);
});

async function runStartupStep(label: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[startup] ${label} failed:`, message);
    if (err instanceof Error && err.stack) {
      console.error(err.stack);
    }
  }
}


app.set('trust proxy', 1);

// Basic validation to help during setup
const required = ['MONGODB_URI'];
for (const key of required) {
  if (!process.env[key] && !process.env.MONGO_URI) {
    console.error(`[FATAL] Missing environment variable: ${key}`);
    process.exit(1);
  }
}
const emailProvider = (process.env.EMAIL_PROVIDER || 'smtp').toLowerCase();
if (emailProvider === 'resend') {
  if (!process.env.RESEND_API_KEY?.trim() || !process.env.RESEND_FROM_EMAIL?.trim()) {
    console.warn(
      '[email] EMAIL_PROVIDER=resend but RESEND_API_KEY or RESEND_FROM_EMAIL is missing; outbound mail will fail.',
    );
  }
} else if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn(
    '[email] SMTP_USER or SMTP_PASS not set; password reset and verification emails will not be sent. See server/EMAIL_SETUP.md.',
  );
}

logMicroblinkStartupCheck();

// Global middlewares - CORS: CLIENT_URL + ALLOWED_ORIGINS + canonical storefront (see publicEnv)
const allowedCorsOrigins = getAllowedCorsOrigins();
console.log(`[cors] allowed origins: ${allowedCorsOrigins.join(', ') || '(none)'}`);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (isAllowedCorsOrigin(origin, allowedCorsOrigins)) return callback(null, true);
    console.warn(`[cors] blocked origin: ${origin || '(none)'}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  exposedHeaders: ['X-Spacilly-Session'],
  optionsSuccessStatus: 204,
};

function applySpacillyCors(req: Request, res: Response, next: NextFunction) {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : '';
  res.vary('Origin');
  if (origin && isAllowedCorsOrigin(origin, allowedCorsOrigins)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Expose-Headers', 'X-Spacilly-Session');
  }
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    const requested = req.headers['access-control-request-headers'];
    res.setHeader(
      'Access-Control-Allow-Headers',
      typeof requested === 'string' && requested.trim()
        ? requested
        : 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Spacilly-Session, X-Spacilly-Client, X-Session-Id',
    );
    res.setHeader('Access-Control-Max-Age', '600');
    return res.status(204).end();
  }
  next();
}

app.use(applySpacillyCors);
app.use(cors(corsOptions));
app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate');
  next();
});
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhookRoutes);
app.use(express.json());
app.use(sanitizeInput);
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// System monitor: sample API latency & errors (additive, in-memory).
app.use((req, res, next) => {
  const t0 = Date.now();
  res.on('finish', () => {
    try {
      if (req.originalUrl.startsWith('/api')) {
        seedMonitorLogsOnce();
        const xf = req.headers['x-forwarded-for'];
        const clientIp =
          typeof xf === 'string'
            ? xf.split(',')[0]?.trim() || ''
            : req.ip || req.socket.remoteAddress || '';
        recordApiTiming({
          path: req.originalUrl.split('?')[0],
          method: req.method,
          ms: Date.now() - t0,
          statusCode: res.statusCode,
          clientIp: clientIp || '—',
          userAgent: req.get('user-agent') || '',
          payloadBytes: Number(req.headers['content-length'] || 0),
        });
      }
    } catch {
      /* ignore */
    }
  });
  next();
});

// Basic request timing to quickly spot backend bottlenecks.
// If a request takes longer than 2s, we log method/route/status/duration.
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    if (ms > 2000) {
      const userId = (req as any).user?.id;
      // eslint-disable-next-line no-console
      console.warn(
        `[slow] ${req.method} ${req.originalUrl} -> ${res.statusCode} ${ms.toFixed(0)}ms${
          userId ? ` (user:${userId})` : ''
        }`,
      );
    }
  });
  next();
});
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy:
      process.env.NODE_ENV === 'production'
        ? {
            useDefaults: true,
            directives: {
              defaultSrc: ["'none'"],
              frameAncestors: ["'none'"],
            },
          }
        : false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: process.env.NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true } : false,
  }),
);
app.use(compression({ threshold: 1024 }));

// Rate limiting (protects against abuse and reduces load under concurrency)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again in a few minutes.' },
});
app.use('/api', apiLimiter);
// Per-route limits live in authRoutes (login, register, OTP, etc.). A global /api/auth
// limiter was stacking with those and counting /me + every auth call — causing 429 on normal use.

// Health check — must respond before MongoDB finishes connecting (EB/nginx probes this path).
app.get('/api/health', (_req: Request, res: Response) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: 'ok',
    message: 'Spacilly API is running',
    db: dbConnected ? 'connected' : 'pending',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/public', publicContentRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Auth routes
app.use('/api/auth', authRoutes);
// Profile routes
app.use('/api/profile', profileRoutes);
// Seller inventory routes
app.use('/api/seller/inventory', inventoryRoutes);
// Seller settings routes
app.use('/api/seller/settings', sellerSettingsRoutes);
app.use('/api/seller/kyc', sellerKycRoutes);
// Seller support ticket routes
app.use('/api/seller/support', supportTicketRoutes);
// Seller knowledge base routes
app.use('/api/seller/knowledge-base', knowledgeBaseRoutes);
// Seller dispute routes
app.use('/api/seller/disputes', disputeRoutes);
// Seller account health routes
app.use('/api/seller/account-health', accountHealthRoutes);
// System inbox (sellers, buyers, admins) — also mounted under /seller for backward compatibility
app.use('/api/notifications', systemNotificationRoutes);
app.use('/api/seller/notifications', systemNotificationRoutes);

// Seller inbox routes
app.use('/api/seller/inbox', inboxRoutes);

// Buyer inbox routes
app.use('/api/buyer/inbox', buyerInboxRoutes);
// Buyer notification routes
app.use('/api/buyer/notifications', buyerNotificationRoutes);
app.use('/api/buyer/referral', buyerReferralRoutes);
// Buyer dispute routes
app.use('/api/buyer/disputes', buyerDisputeRoutes);
app.use('/api/buyer/returns', buyerReturnsRoutes);

// Seller routes
app.use('/api/seller', sellerRoutes);
app.use('/api/seller/returns', sellerReturnsRoutes);

// Subscription routes
app.use('/api/seller/subscription', subscriptionRoutes);
// Analytics routes
app.use('/api/seller/analytics', analyticsRoutes);
// Product routes (public - for buyers to view products)
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/public/og', publicOgRoutes);
// Blog routes (public - for blog posts)
app.use('/api/blog', blogRoutes);
// Affiliate routes
app.use('/api/affiliate', affiliateRoutes);
// Tracking routes
app.use('/api/track', trackingRoutes);
// Buyer order routes
app.use('/api/orders', buyerOrderRoutes);
app.use('/api/buyer/cart', buyerCartRoutes);
app.use('/api/coupons', couponRoutes);
// Shipping (quotes)
app.use('/api/shipping', shippingRoutes);
// Admin routes
app.use('/api/admin/staff', adminStaffRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/kyc-queues', adminKycQueueRoutes);
app.use('/api/admin/finance', adminFinanceRoutes);
app.use('/api/admin/support', adminSupportRoutes);
app.use('/api/admin/logistics', adminLogisticsRoutes);
app.use('/api/admin/notifications', adminNotificationsRoutes);
app.use('/api/admin/marketing', adminMarketingRoutes);
app.use('/api/admin/reviews', adminReviewsRoutes);
app.use('/api/admin/collections', adminCollectionsRoutes);
app.use('/api/admin/products', adminProductsRoutes);
app.use('/api/admin/orders', adminOrdersRoutes);
app.use('/api/admin/compliance', adminComplianceRoutes);
app.use('/api/admin/returns', adminReturnsRoutes);
app.use('/api/admin/system-features', adminSystemFeaturesRoutes);
app.use('/api/platform', systemFeaturesPublicRoutes);
app.use('/api/admin/seller-subscriptions', adminSellerSubscriptionRoutes);
app.use('/api/admin/intelligence', adminIntelligenceSearchRoutes);
app.use('/api/admin/site', adminSiteContentRoutes);
// Payments & escrow routes
app.use('/api/payments', paymentRoutes);
// Webhooks
app.use('/api/webhooks', webhookRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/ai', aiChatRoutes);
app.use('/api/ai', aiAgentRoutes);
app.use('/api/system', systemMonitorRoutes);
app.use('/api/security-analysis', securityAnalysisRoutes);
app.use('/api/recommendation-emails', recommendationEmailRoutes);
app.use('/api/home', publicHomeRouter);
app.use('/api/admin/marketplace-ai', adminAIRouter);
app.use('/api/verification', productVerificationRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/push', pushDeviceRoutes);
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/pickup', pickupRoutes);
app.use('/api/marketplace', marketplaceInnovationRoutes);
app.use('/api/live-commerce', liveCommerceRoutes);

// SEO endpoints (robots + sitemap)
app.use(seoRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found', path: req.path });
});

// Handle multer and Cloudinary upload errors
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err?.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large. Maximum size is 10MB per image.',
        message: 'File too large. Maximum size is 10MB per image.',
      });
    }
    return res.status(400).json({ error: err.message, message: err.message });
  }

  if (err?.message && String(err.message).includes('Invalid file type')) {
    return res.status(400).json({ error: err.message, message: err.message });
  }

  next(err);
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Connect to MongoDB and start background workers (HTTP server listens first — see boot()).
const connectDB = async () => {
  try {
    if (!MONGO_URI) {
      console.error('❌ MONGO_URI is not set in .env file');
      process.exit(1);
    }

    const options: mongoose.ConnectOptions = {
      // Reduce worst-case cold-start latency (better than waiting 2+ minutes).
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
      maxPoolSize: process.env.NODE_ENV === 'production' ? 10 : 20,
      minPoolSize: process.env.NODE_ENV === 'production' ? 0 : 5,
      maxIdleTimeMS: 45000,
      heartbeatFrequencyMS: 10000,
    };

    // For development: allow invalid certificates to resolve TLS handshake issues
    // Remove this in production and ensure proper SSL certificates are configured
    if (process.env.NODE_ENV !== 'production') {
      options.tlsAllowInvalidCertificates = true;
    }

    // Add retry logic for connection
    let retries = 2;
    let lastError: any;
    
    while (retries > 0) {
      try {
        await mongoose.connect(MONGO_URI, options);
        break; // Success, exit retry loop
      } catch (err: any) {
        lastError = err;
        retries--;
        if (retries > 0) {
          console.log(`⚠️  MongoDB connection attempt failed. Retrying in 1 second... (${2 - retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
    }
    
    if (retries === 0) {
      throw lastError; // Throw the last error if all retries failed
    }
    
    console.log('✅ Connected to MongoDB');

    await runStartupStep('system monitor config', async () => {
      const { hydrateMonitorSettingsFromDb } = await import("./src/services/systemMonitor.service.js");
      await hydrateMonitorSettingsFromDb();
    });

    await runStartupStep('payment gateways', async () => {
      const { ensureCorePaymentGateways } = await import("./src/services/paymentGateway.service.js");
      await ensureCorePaymentGateways();
      console.log('✅ Payment gateways registry synced');
    });

    await runStartupStep('background workers', async () => {
      startScheduledNotificationWorker();
      startRecommendationEmailWorker();
      startAbandonedCartEmailWorker();
      startBuyerInsightWorker();
      startLifecycleEmailWorker();
      startCartPulseEmailWorker();
      startBrowseAbandonEmailWorker();
      startOrderFulfillmentGuardWorker();
      startDeliveryAutoCompleteWorker();
      startSellerDeliverySLAWorker();
      startExchangeRateWorker();
      startComplianceCertificateReminderJob();
      startMarketplaceAIWorker();
      console.log('✅ Background workers started');
    });

    if (process.env.MEILISEARCH_HOST?.trim()) {
      void import("./src/search/intelligenceIndex.service.js")
        .then(({ syncIntelligenceIndex }) =>
          syncIntelligenceIndex({ perType: 200 })
            .then((r) => console.log(`✅ Intelligence search index: ${r.indexed} documents`))
            .catch((e) => console.warn('[intelligence-search] index sync skipped:', e?.message)),
        )
        .catch((e) => console.warn('[intelligence-search] module load skipped:', e?.message));
    }

    void import("./src/queues/intelligenceIndex.queue.js")
      .then(({ startIntelligenceIndexWorker }) => startIntelligenceIndexWorker())
      .catch((e) => console.warn('[intelligence-index] worker skipped:', e?.message));
  } catch (err: any) {
    console.error('❌ MongoDB/workers startup failed (HTTP server stays up for health checks):', err?.message || err);
    if (err?.stack) console.error(err.stack);
  }
};

const startServer = async () => {
  websocketService.initialize(httpServer);

  await new Promise<void>((resolve, reject) => {
    httpServer.once('error', (listenErr: NodeJS.ErrnoException) => {
      console.error('❌ HTTP server failed to start:', listenErr.message);
      reject(listenErr);
    });
    httpServer.listen(PORT, HOST, () => {
      console.log(`🚀 Server listening on ${HOST}:${PORT}`);
      console.log('📡 WebSocket server ready');
      keepAlive();
      resolve();
    });
  });
};

const boot = async () => {
  try {
    await startServer();
  } catch (err: unknown) {
    console.error('❌ HTTP server failed to start:', err instanceof Error ? err.message : err);
    if (err instanceof Error && err.stack) console.error(err.stack);
    process.exit(1);
  }
  void connectDB();
};

boot();



