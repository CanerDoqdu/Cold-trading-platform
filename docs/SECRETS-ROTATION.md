# Secrets Rotation Policy

## Rotation Schedule

| Secret | Rotation Period | Method |
|--------|----------------|--------|
| JWT_SECRET | 90 days | Dual-key transition |
| SESSION_SECRET | 90 days | Dual-key transition |
| COINGECKO_API_KEY | On compromise | Regenerate in dashboard |
| GOOGLE_CLIENT_SECRET | On compromise | Regenerate in Google Console |
| OPENSEA_API_KEY | On compromise | Regenerate in OpenSea dashboard |
| GROQ_API_KEY | On compromise | Regenerate in Groq dashboard |
| GEMINI_API_KEY | On compromise | Regenerate in Google AI Studio |

## Dual-Key Rotation Procedure

For JWT_SECRET and SESSION_SECRET, use a dual-key strategy to avoid invalidating all active sessions:

1. **Generate new secret** — `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
2. **Deploy with both keys** — set `JWT_SECRET_NEW` alongside `JWT_SECRET`
3. **Update signing** — new tokens use `JWT_SECRET_NEW`
4. **Maintain verification** — verify against both `JWT_SECRET` and `JWT_SECRET_NEW`
5. **Wait 7 days** — allow old tokens (3d expiry) to naturally expire + buffer
6. **Remove old key** — rename `JWT_SECRET_NEW` → `JWT_SECRET`, remove old value
7. **Verify** — confirm all sessions still working

## On Compromise Procedure

1. **Immediately rotate** the compromised secret
2. **If JWT_SECRET compromised** — force logout all users (clear all sessions in DB)
3. **Log incident** — create entry in `docs/security/INCIDENTS.md`
4. **Notify team** — Slack #security channel
5. **Review audit logs** — check for unauthorized access during exposure window

## Monitoring

- Set calendar reminders for 90-day rotations
- Review rotation status in monthly security hygiene check
- Dependabot alerts cover dependency-level compromises
