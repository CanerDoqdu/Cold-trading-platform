import { ok } from '@/lib/api/handler';

export const runtime = 'nodejs';

export async function GET() {
  return ok({ status: 'healthy', timestamp: new Date().toISOString() });
}
