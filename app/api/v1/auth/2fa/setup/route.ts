import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { generateSecret, generateURI } from 'otplib';
import QRCode from 'qrcode';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/userModel';
import { audit, extractRequestMeta } from '@/lib/auditLog';
import { generateSecureToken } from '@/lib/auth/timingSafe';
import bcrypt from 'bcrypt';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || process.env.SECRET || 'fallback');
const TOTP_ISSUER = process.env.TOTP_ISSUER_NAME || 'ColdTrade';
const BACKUP_CODE_COUNT = 10;

async function getUserId(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return (payload.userId || payload._id) as string;
  } catch {
    return null;
  }
}

// ── POST /api/v1/auth/2fa/setup ────────
// Generate TOTP secret + QR code URI
export async function POST(request: Request) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.totpEnabled) {
    return NextResponse.json({ error: '2FA is already enabled' }, { status: 400 });
  }

  // Generate secret
  const secret = generateSecret();
  const otpauth = generateURI({ secret, issuer: TOTP_ISSUER, label: user.email });
  const qrDataUrl = await QRCode.toDataURL(otpauth);

  // Generate backup codes (store hashed)
  const rawBackupCodes: string[] = [];
  const hashedBackupCodes: string[] = [];
  for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
    const code = generateSecureToken(4).toUpperCase().slice(0, 8); // 8-char hex
    rawBackupCodes.push(code);
    hashedBackupCodes.push(await bcrypt.hash(code, 10));
  }

  // Save secret temporarily (not enabled yet — needs verification)
  user.totpSecret = secret;
  user.backupCodes = hashedBackupCodes;
  await user.save();

  return NextResponse.json({
    secret,
    qrCode: qrDataUrl,
    backupCodes: rawBackupCodes,
    message: 'Scan the QR code with your authenticator app, then verify with a code',
  });
}
