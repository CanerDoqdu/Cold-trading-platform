/**
 * Financial audit logger.
 * Every sensitive action is logged permanently — never deleted.
 */
import dbConnect from '@/lib/dbConnect';
import AuditLog, { AuditAction } from '@/models/auditLogModel';

interface AuditEntry {
  userId: string;
  action: AuditAction;
  ip: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Write an audit log entry. Fire-and-forget — never throw on failure
 * (an audit write error must not block the user action).
 */
export async function audit(entry: AuditEntry): Promise<void> {
  try {
    await dbConnect();
    await AuditLog.create({
      userId: entry.userId,
      action: entry.action,
      ip: entry.ip,
      userAgent: entry.userAgent || '',
      metadata: entry.metadata || {},
    });
  } catch (err) {
    // Log to stdout/stderr so infra monitoring catches it
    console.error('[AuditLog] Failed to write audit entry:', err);
  }
}

/**
 * Helper: extract IP + UA from a Request object.
 */
export function extractRequestMeta(req: Request): { ip: string; userAgent: string } {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded
    ? forwarded.split(',')[0].trim()
    : req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || '';
  return { ip, userAgent };
}
