import { z } from 'zod';

// ── Login ──────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Invalid email address').max(254).toLowerCase(),
  password: z.string().min(1, 'Password is required').max(128),
});
export type LoginInput = z.infer<typeof loginSchema>;

// ── Signup ─────────────────────────────
export const signupSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Name contains invalid characters'),
  email: z.string().email('Invalid email address').max(254).toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});
export type SignupInput = z.infer<typeof signupSchema>;

// ── Change password ────────────────────
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required').max(128),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ── Google OAuth ───────────────────────
export const googleAuthSchema = z.object({
  credential: z.string().min(1, 'Google credential is required'),
});
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;

// ── TOTP verify ────────────────────────
export const totpVerifySchema = z.object({
  code: z
    .string()
    .length(6, 'TOTP code must be 6 digits')
    .regex(/^\d{6}$/, 'TOTP code must be numeric'),
});
export type TotpVerifyInput = z.infer<typeof totpVerifySchema>;

// ── TOTP disable ───────────────────────
export const totpDisableSchema = z.object({
  code: z.string().length(6).regex(/^\d{6}$/),
  password: z.string().min(1, 'Password is required'),
});
export type TotpDisableInput = z.infer<typeof totpDisableSchema>;

// ── Forgot password request ────────────
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').max(254).toLowerCase(),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// ── Reset password confirm ─────────────
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ── Email verification ─────────────────
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
