/**
 * Application configuration constants.
 */

/** Current Terms of Service version — bump when ToS changes */
export const TOS_VERSION = '2026-02-26';

/** Feature flags for gradual rollout of risky features */
export const FEATURE_FLAGS = {
  /** 2FA enforcement (require 2FA for trading) */
  REQUIRE_2FA_FOR_TRADE: false,
  /** Email verification required to place orders */
  REQUIRE_EMAIL_VERIFIED_FOR_TRADE: true,
  /** Show ToS modal on version mismatch */
  ENFORCE_TOS: true,
} as const;
