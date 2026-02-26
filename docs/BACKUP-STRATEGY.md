# Backup Strategy

ColdTrade database backup and disaster recovery plan.

## MongoDB Atlas Backup (Primary)

### Configuration

| Setting | Free Tier (M0) | Paid Tier (M10+) |
|---------|----------------|-------------------|
| Backup type | Daily snapshots | Continuous (PITR) |
| Retention | 2 days | 7–30 days |
| RPO (recovery point) | 24 hours | ~1 second |
| RTO (recovery time) | ~30 minutes | ~10 minutes |

### Enabling Backups

1. Atlas → Clusters → Select cluster → **Backup** tab
2. Enable **Continuous Backup** (M10+) or **Daily Snapshots** (M0)
3. Set retention policy based on tier

## Restore Procedure

### From Atlas UI

1. Atlas → Clusters → **Backup** → **Restore**
2. Select snapshot or point-in-time
3. Choose target: **same cluster** (overwrite) or **new cluster** (safer)
4. Wait for restore to complete
5. Verify data integrity with spot checks

### Verification Checklist

After restore, verify:
- [ ] User count matches expected
- [ ] Recent orders are present
- [ ] Portfolio data is consistent
- [ ] Audit logs are intact (never deleted)
- [ ] Sessions collection exists

## Testing Schedule

| Action | Frequency | Owner |
|--------|-----------|-------|
| Verify backup is running | Weekly | On-call |
| Test restore to staging | Quarterly | Engineering lead |
| Full DR drill | Annually | Team |

## Data Export (Additional Safety)

For critical data beyond Atlas backup:

```bash
# Export audit logs (permanent records)
mongodump --uri="$MONGO_URI" --collection=auditlogs --out=./backup/

# Export user data
mongodump --uri="$MONGO_URI" --collection=users --out=./backup/
```

Store exports in encrypted S3 bucket with 90-day lifecycle policy.

## Incident Response

If data loss is detected:

1. **Stop writes** — put app in maintenance mode
2. **Assess scope** — determine which collections/time ranges affected
3. **Restore** — use most recent backup before incident
4. **Verify** — run integrity checks against known state
5. **Post-mortem** — document root cause and prevention measures
