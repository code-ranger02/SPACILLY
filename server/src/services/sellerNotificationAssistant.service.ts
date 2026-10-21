/**
 * Seller notification copy — re-exports the intelligent notification engine.
 * @see sellerNotificationEngine/
 */
export type {
  SellerNotificationEvent,
  SellerNotificationContext,
  SellerNotificationCopy,
  SellerNotificationTone,
  SellerNotificationVisualStyle,
} from "./sellerNotificationEngine/types.js";

export {
  generateSellerNotificationCopy,
  generateSellerNotificationCopySync,
} from "./sellerNotificationEngine/index.js";
