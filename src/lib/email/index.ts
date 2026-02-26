/**
 * Email service — uses Resend for transactional emails.
 * Falls back to console.log in dev when RESEND_API_KEY is not set.
 */

import { logger } from '@/lib/logger';

const log = logger.child({ module: 'email' });

let resendClient: unknown = null;

async function getResend() {
  if (resendClient) return resendClient as { emails: { send: (opts: Record<string, unknown>) => Promise<unknown> } };
  if (!process.env.RESEND_API_KEY) {
    log.debug('RESEND_API_KEY not set — emails logged to console');
    return null;
  }
  const { Resend } = await import('resend');
  resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient as { emails: { send: (opts: Record<string, unknown>) => Promise<unknown> } };
}

const FROM = process.env.EMAIL_FROM || 'ColdTrade <noreply@coldtrade.com>';

interface SendOpts {
  to: string;
  subject: string;
  html: string;
}

async function send(opts: SendOpts): Promise<boolean> {
  const client = await getResend();
  if (!client) {
    log.info('[DEV EMAIL]', { to: opts.to, subject: opts.subject });
    return true;
  }
  try {
    await client.emails.send({ from: FROM, ...opts });
    return true;
  } catch (err) {
    log.error('Email send failed', { to: opts.to, error: (err as Error).message });
    return false;
  }
}

/* ── template helpers ── */

export async function sendEmailVerification(to: string, token: string, name: string) {
  const link = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  return send({
    to,
    subject: 'Confirm your ColdTrade account',
    html: `<p>Hi ${name},</p><p>Click the link to verify your email:</p><p><a href="${link}">${link}</a></p><p>This link expires in 24 hours.</p>`,
  });
}

export async function sendPasswordReset(to: string, token: string) {
  const link = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  return send({
    to,
    subject: 'Reset your ColdTrade password',
    html: `<p>We received a request to reset your password.</p><p><a href="${link}">Reset Password</a></p><p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>`,
  });
}

export async function sendPriceAlert(to: string, coinSymbol: string, price: number, condition: string) {
  return send({
    to,
    subject: `Price Alert: ${coinSymbol.toUpperCase()} ${condition} $${price.toLocaleString()}`,
    html: `<p>${coinSymbol.toUpperCase()} has reached <strong>$${price.toLocaleString()}</strong> (${condition} your target).</p>`,
  });
}

export async function send2FABackupCodes(to: string, codes: string[]) {
  return send({
    to,
    subject: 'Your ColdTrade 2FA Backup Codes',
    html: `<p>Keep these backup codes safe. Each code can only be used once:</p><pre>${codes.join('\n')}</pre><p>If you lose access to your authenticator app, use one of these codes to log in.</p>`,
  });
}
