/**
 * lib/api/handler.ts — Base v1 API response helpers
 *
 * Enforces the versioned error envelope on every response:
 *   Success: { version: "v1", ok: true,  data: T,      requestId: string }
 *   Error:   { version: "v1", ok: false, error: {...},  requestId: string }
 *
 * Usage:
 *   import { ok, err } from '@/lib/api/handler';
 *   return ok(data);
 *   return err('RATE_LIMIT_EXCEEDED', 'Too many requests', 429);
 */

import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

// ── Types ──────────────────────────────────────────────────────────────────

export type ApiSuccess<T> = {
  version: 'v1';
  ok: true;
  data: T;
  requestId: string;
};

export type ApiError = {
  version: 'v1';
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ── Semantic error codes ───────────────────────────────────────────────────

export const ErrorCode = {
  INVALID_INPUT:            'INVALID_INPUT',
  UNAUTHORIZED:             'UNAUTHORIZED',
  FORBIDDEN:                'FORBIDDEN',
  NOT_FOUND:                'NOT_FOUND',
  DUPLICATE_ORDER:          'DUPLICATE_ORDER',
  INSUFFICIENT_BALANCE:     'INSUFFICIENT_BALANCE',
  PRICE_SLIPPAGE_TOO_HIGH:  'PRICE_SLIPPAGE_TOO_HIGH',
  EMAIL_NOT_VERIFIED:       'EMAIL_NOT_VERIFIED',
  RATE_LIMIT_EXCEEDED:      'RATE_LIMIT_EXCEEDED',
  COINGECKO_UNAVAILABLE:    'COINGECKO_UNAVAILABLE',
  INTERNAL_ERROR:           'INTERNAL_ERROR',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

// ── Response helpers ───────────────────────────────────────────────────────

export function ok<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    { version: 'v1', ok: true, data, requestId: randomUUID() } satisfies ApiSuccess<T>,
    { status }
  );
}

export function err(
  code: string,
  message: string,
  status = 400,
  details?: unknown
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      version: 'v1',
      ok: false,
      error: { code, message, ...(details !== undefined && { details }) },
      requestId: randomUUID(),
    } satisfies ApiError,
    { status }
  );
}
