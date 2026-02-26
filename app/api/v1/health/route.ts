import { ok } from '@/lib/api/handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const startTime = Date.now();

export async function GET() {
  return ok({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1_000),
  });
}
