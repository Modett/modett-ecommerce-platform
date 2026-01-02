// Components
export { Newsletter } from "./components/newsletter";

// Hooks (using barrel export)
export * from "./hooks";

// Constants
export {
  NEWSLETTER_CLASSES,
  NEWSLETTER_COLORS,
  NEWSLETTER_TYPOGRAPHY,
  NEWSLETTER_CONFIG,
} from "./constants/newsletter-styles";

// Types
export type * from "./types";

// API
export {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getNewsletterSubscription,
} from "./api";
