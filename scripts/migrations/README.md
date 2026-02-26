# Database Migrations

Each migration file should export `up()` and `down()` functions for forward/rollback.

## Conventions

- File format: `YYYYMMDD-description.ts` (e.g. `20260226-add-2fa-fields.ts`)
- Migrations are idempotent — safe to run multiple times
- Never delete data directly — use `deletedAt` (soft delete) first
- Hard delete via admin script after 90 days (GDPR compliance)
- Test rollback in staging before production

## Running migrations

```bash
# Run all pending migrations
npx ts-node scripts/migrate-db.ts

# Or via package.json script
npm run db:migrate
```

## Rollback strategy

Each migration should have a corresponding rollback plan documented inline.
If a migration fails mid-way, MongoDB transactions ensure atomicity for
operations that span multiple collections.
