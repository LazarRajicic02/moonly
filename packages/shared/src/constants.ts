export const LOCALES = ['en', 'sr'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'sr';

export const USER_ROLES = ['USER', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const SUBSCRIPTION_STATUSES = [
  'NONE',
  'TRIALING',
  'ACTIVE',
  'PAST_DUE',
  'CANCELED',
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const APP_NAME = 'Luna';
export const API_PREFIX = 'api/v1';
