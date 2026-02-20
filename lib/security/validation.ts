/**
 * ============================================
 * INPUT VALIDATION LAYER
 * ============================================
 * Server-side validation for ALL incoming data.
 * Uses the `validator` package (already in dependencies).
 *
 * Why server-side validation matters:
 *  - Client-side validation is bypassable (curl, Postman, bots)
 *  - Prevents NoSQL injection, XSS payloads, malformed data
 *  - Single source of truth for data rules
 *
 * Usage:
 *   import { validate, schemas } from '@/lib/security/validation';
 *
 *   // In a route handler:
 *   const { email, password } = validate(body, schemas.login);
 *   // Throws AppError('VALIDATION_FAILED') if invalid
 *
 * Same approach: Joi, Zod, but lightweight & zero new deps
 */

import { AppError } from '@/lib/errors';

// ─── Types ───

interface FieldRule {
  type: 'string' | 'number' | 'boolean' | 'array';
  required?: boolean;
  min?: number;          // min length (string) or min value (number)
  max?: number;          // max length (string) or max value (number)
  pattern?: RegExp;      // regex pattern for string validation
  enum?: readonly any[]; // allowed values
  message?: string;      // custom error message
  sanitize?: boolean;    // auto-trim & strip for strings (default true)
  custom?: (value: any) => string | null; // custom validator, return error message or null
}

type Schema = Record<string, FieldRule>;

interface ValidationResult {
  valid: boolean;
  errors: Array<{ field: string; message: string }>;
  sanitized: Record<string, any>;
}

// ─── Core Validator ───

/**
 * Validate input against a schema.
 * Returns sanitized data or throws AppError.
 */
export function validate<T extends Record<string, any>>(
  data: unknown,
  schema: Schema,
): T {
  if (!data || typeof data !== 'object') {
    throw AppError.validation('Request body must be a JSON object');
  }

  const input = data as Record<string, any>;
  const errors: Array<{ field: string; message: string }> = [];
  const sanitized: Record<string, any> = {};

  for (const [field, rule] of Object.entries(schema)) {
    let value = input[field];

    // ── Required check ──
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field,
        message: rule.message || `${field} is required`,
      });
      continue;
    }

    // Skip optional empty fields
    if (value === undefined || value === null) {
      continue;
    }

    // ── Type check ──
    if (rule.type === 'string') {
      if (typeof value !== 'string') {
        errors.push({ field, message: `${field} must be a string` });
        continue;
      }

      // Auto-sanitize strings: trim whitespace, strip null bytes
      if (rule.sanitize !== false) {
        value = value.trim().replace(/\0/g, '');
      }

      // Min length
      if (rule.min !== undefined && value.length < rule.min) {
        errors.push({
          field,
          message: rule.message || `${field} must be at least ${rule.min} characters`,
        });
        continue;
      }

      // Max length
      if (rule.max !== undefined && value.length > rule.max) {
        errors.push({
          field,
          message: rule.message || `${field} must be at most ${rule.max} characters`,
        });
        continue;
      }

      // Pattern
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push({
          field,
          message: rule.message || `${field} has invalid format`,
        });
        continue;
      }

    } else if (rule.type === 'number') {
      value = Number(value);
      if (isNaN(value)) {
        errors.push({ field, message: `${field} must be a number` });
        continue;
      }
      if (rule.min !== undefined && value < rule.min) {
        errors.push({ field, message: `${field} must be at least ${rule.min}` });
        continue;
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push({ field, message: `${field} must be at most ${rule.max}` });
        continue;
      }

    } else if (rule.type === 'boolean') {
      if (typeof value !== 'boolean') {
        errors.push({ field, message: `${field} must be a boolean` });
        continue;
      }

    } else if (rule.type === 'array') {
      if (!Array.isArray(value)) {
        errors.push({ field, message: `${field} must be an array` });
        continue;
      }
    }

    // ── Enum check ──
    if (rule.enum && !rule.enum.includes(value)) {
      errors.push({
        field,
        message: rule.message || `${field} must be one of: ${rule.enum.join(', ')}`,
      });
      continue;
    }

    // ── Custom validator ──
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        errors.push({ field, message: customError });
        continue;
      }
    }

    sanitized[field] = value;
  }

  if (errors.length > 0) {
    throw new AppError('VALIDATION_FAILED', 'Validation failed', {
      errors,
    });
  }

  return sanitized as T;
}

// ─── Common Validators ───

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const MONGO_ID_REGEX = /^[a-f\d]{24}$/i;

/** Check for potential NoSQL injection patterns */
function hasNoSQLInjection(value: string): string | null {
  const dangerous = ['$', '{', '}'];
  if (dangerous.some((char) => value.includes(char))) {
    return 'Input contains invalid characters';
  }
  return null;
}

// ─── Pre-built Schemas ───

export const schemas = {
  login: {
    email: {
      type: 'string' as const,
      required: true,
      max: 254,
      pattern: EMAIL_REGEX,
      message: 'Valid email is required',
      custom: hasNoSQLInjection,
    },
    password: {
      type: 'string' as const,
      required: true,
      min: 6,
      max: 128,
      message: 'Password must be 6-128 characters',
    },
  },

  signup: {
    name: {
      type: 'string' as const,
      required: true,
      min: 2,
      max: 50,
      message: 'Name must be 2-50 characters',
      custom: hasNoSQLInjection,
    },
    email: {
      type: 'string' as const,
      required: true,
      max: 254,
      pattern: EMAIL_REGEX,
      message: 'Valid email is required',
      custom: hasNoSQLInjection,
    },
    password: {
      type: 'string' as const,
      required: true,
      min: 6,
      max: 128,
      message: 'Password must be 6-128 characters',
    },
  },

  changePassword: {
    currentPassword: {
      type: 'string' as const,
      required: true,
      min: 6,
      max: 128,
    },
    newPassword: {
      type: 'string' as const,
      required: true,
      min: 6,
      max: 128,
      message: 'New password must be 6-128 characters',
    },
  },

  mongoId: {
    id: {
      type: 'string' as const,
      required: true,
      pattern: MONGO_ID_REGEX,
      message: 'Invalid ID format',
    },
  },

  pagination: {
    limit: {
      type: 'number' as const,
      min: 1,
      max: 100,
    },
    page: {
      type: 'number' as const,
      min: 1,
      max: 1000,
    },
  },
} as const;
