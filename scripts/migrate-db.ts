#!/usr/bin/env ts-node
/**
 * Database migration: Add new fields to existing users.
 *
 * Safe to run multiple times — skips documents that already have the fields.
 *
 * Usage:
 *   npx ts-node scripts/migrate-db.ts
 *   # or from package.json script:
 *   npm run db:migrate
 */

import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌  MONGO_URI environment variable is required');
  process.exit(1);
}

async function migrate() {
  console.log('🔄  Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI as string);
  console.log('✅  Connected');

  const db = mongoose.connection.db;
  if (!db) throw new Error('Database connection not established');

  const usersCol = db.collection('users');

  /* ── Migration 1: Add paper balance & 2FA defaults ──────── */
  console.log('\n📋  Migration 1: Add paperBalanceMinor, emailVerified, twoFactorEnabled defaults...');

  const m1 = await usersCol.updateMany(
    { paperBalanceMinor: { $exists: false } },
    {
      $set: {
        paperBalanceMinor: '1000000', // $10,000.00 in cents
        emailVerified: false,
        totpEnabled: false,
        deletedAt: null,
      },
    },
  );
  console.log(`   Updated ${m1.modifiedCount} users (${m1.matchedCount} matched)`);

  /* ── Migration 2: Ensure failedLoginAttempts exists ─────── */
  console.log('\n📋  Migration 2: Ensure failedLoginAttempts field...');

  const m2 = await usersCol.updateMany(
    { failedLoginAttempts: { $exists: false } },
    { $set: { failedLoginAttempts: 0 } },
  );
  console.log(`   Updated ${m2.modifiedCount} users (${m2.matchedCount} matched)`);

  /* ── Migration 3: Ensure backupCodes array exists ───────── */
  console.log('\n📋  Migration 3: Ensure backupCodes array...');

  const m3 = await usersCol.updateMany(
    { backupCodes: { $exists: false } },
    { $set: { backupCodes: [] } },
  );
  console.log(`   Updated ${m3.modifiedCount} users (${m3.matchedCount} matched)`);

  /* ── Migration 4: Create indexes ────────────────────────── */
  console.log('\n📋  Migration 4: Ensure indexes...');

  // User indexes
  await usersCol.createIndex({ email: 1 }, { unique: true });
  await usersCol.createIndex({ googleId: 1 }, { unique: true, sparse: true });
  await usersCol.createIndex({ emailVerifyToken: 1 }, { sparse: true });
  await usersCol.createIndex({ resetPasswordToken: 1 }, { sparse: true });
  await usersCol.createIndex({ deletedAt: 1 });
  console.log('   Users indexes created');

  // Orders indexes
  const ordersCol = db.collection('orders');
  await ordersCol.createIndex({ userId: 1, createdAt: -1 });
  await ordersCol.createIndex({ idempotencyKey: 1 }, { unique: true });
  await ordersCol.createIndex({ symbol: 1, status: 1 });
  console.log('   Orders indexes created');

  // Portfolio indexes
  const portfolioCol = db.collection('portfolios');
  await portfolioCol.createIndex({ userId: 1 }, { unique: true });
  await portfolioCol.createIndex({ userId: 1, 'holdings.coinId': 1 });
  console.log('   Portfolios indexes created');

  // PortfolioSnapshot indexes
  const snapshotCol = db.collection('portfoliosnapshots');
  await snapshotCol.createIndex({ userId: 1, date: -1 }, { unique: true });
  await snapshotCol.createIndex({ date: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });
  console.log('   PortfolioSnapshots indexes created');

  // Session indexes
  const sessionCol = db.collection('sessions');
  await sessionCol.createIndex({ sessionId: 1 }, { unique: true });
  await sessionCol.createIndex({ userId: 1, revoked: 1 });
  await sessionCol.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  console.log('   Sessions indexes created');

  // AuditLog indexes
  const auditCol = db.collection('auditlogs');
  await auditCol.createIndex({ userId: 1, createdAt: -1 });
  await auditCol.createIndex({ action: 1, createdAt: -1 });
  console.log('   AuditLogs indexes created');

  // PriceAlert indexes
  const alertsCol = db.collection('pricealerts');
  await alertsCol.createIndex({ userId: 1, coinId: 1 });
  await alertsCol.createIndex({ isTriggered: 1, coinId: 1 });
  await alertsCol.createIndex({ isActive: 1, coinId: 1 });
  console.log('   PriceAlerts indexes created');

  // Notification indexes
  const notifCol = db.collection('notifications');
  await notifCol.createIndex({ userId: 1, createdAt: -1 });
  await notifCol.createIndex({ userId: 1, isRead: 1 });
  await notifCol.createIndex({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
  console.log('   Notifications indexes created');

  // Coin indexes
  const coinsCol = db.collection('coins');
  await coinsCol.createIndex({ symbol: 1 }, { unique: true });
  await coinsCol.createIndex({ name: 'text', symbol: 'text' });
  await coinsCol.createIndex({ marketCap: -1 });
  console.log('   Coins indexes created');

  console.log('\n✅  All migrations completed successfully');
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error('❌  Migration failed:', err);
  process.exit(1);
});
