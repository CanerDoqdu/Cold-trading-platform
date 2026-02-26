# Database Indexes Reference

Complete index catalog for all MongoDB collections in ColdTrade.

## Index Strategy

- **Compound indexes** cover the most common query patterns per collection
- **Sort direction** matters — `{ userId: 1, createdAt: -1 }` supports "newest first" without in-memory sort
- **Sparse indexes** skip documents where the field is null (useful for optional unique fields like `googleId`)
- **TTL indexes** auto-delete expired data (sessions, notifications)
- **Text indexes** enable basic full-text search as Atlas Search fallback

## Users (`users`)

| Index | Type | Notes |
|-------|------|-------|
| `{ email: 1 }` | Unique | Primary lookup for login |
| `{ googleId: 1 }` | Unique, Sparse | OAuth lookup (null for local users) |
| `{ emailVerifyToken: 1 }` | Sparse | Email verification flow |
| `{ resetPasswordToken: 1 }` | Sparse | Password reset flow |
| `{ deletedAt: 1 }` | Standard | Soft-delete filtering |

## Orders (`orders`)

| Index | Type | Notes |
|-------|------|-------|
| `{ userId: 1, createdAt: -1 }` | Compound | "My recent orders" query |
| `{ idempotencyKey: 1 }` | Unique | Prevents duplicate submissions |
| `{ symbol: 1, status: 1 }` | Compound | Pending orders by symbol |

## Portfolios (`portfolios`)

| Index | Type | Notes |
|-------|------|-------|
| `{ userId: 1 }` | Unique | One portfolio per user |
| `{ userId: 1, 'holdings.coinId': 1 }` | Compound | Specific coin in user's portfolio |

## Portfolio Snapshots (`portfoliosnapshots`)

| Index | Type | Notes |
|-------|------|-------|
| `{ userId: 1, date: -1 }` | Unique | One snapshot per user per day |
| `{ date: 1 }` | TTL (365 days) | Auto-delete old snapshots |

## Sessions (`sessions`)

| Index | Type | Notes |
|-------|------|-------|
| `{ sessionId: 1 }` | Unique | Fast session lookup from JWT jti |
| `{ userId: 1, revoked: 1 }` | Compound | Active sessions UI |
| `{ expiresAt: 1 }` | TTL (0s) | Auto-delete expired sessions |

## Audit Logs (`auditlogs`)

| Index | Type | Notes |
|-------|------|-------|
| `{ userId: 1, createdAt: -1 }` | Compound | User's audit timeline |
| `{ action: 1, createdAt: -1 }` | Compound | Security queries (e.g. all LOGIN_FAIL in 24h) |

> ⚠️ No TTL index — audit logs are permanent (financial compliance).

## Price Alerts (`pricealerts`)

| Index | Type | Notes |
|-------|------|-------|
| `{ userId: 1, coinId: 1 }` | Compound | User's alerts for a coin |
| `{ isTriggered: 1, coinId: 1 }` | Compound | Cron: find untriggered alerts |
| `{ isActive: 1, coinId: 1 }` | Compound | Active alert filtering |

## Notifications (`notifications`)

| Index | Type | Notes |
|-------|------|-------|
| `{ userId: 1, createdAt: -1 }` | Compound | User's notification feed |
| `{ userId: 1, isRead: 1 }` | Compound | Unread count badge |
| `{ createdAt: 1 }` | TTL (90 days) | Auto-delete old notifications |

## Coins (`coins`)

| Index | Type | Notes |
|-------|------|-------|
| `{ symbol: 1 }` | Unique | Primary lookup |
| `{ name: 'text', symbol: 'text' }` | Text | Full-text search fallback |
| `{ marketCap: -1 }` | Standard | Market cap ranking |

## Price History (`pricehistories`)

| Index | Type | Notes |
|-------|------|-------|
| `{ symbol: 1, timestamp: -1 }` | Compound | Candle queries by coin + time range |
| Time-series collection | MongoDB 5.0+ | Automatic bucketing by minutes |
| TTL | 90 days | Auto-delete old candle data |

---

## Monitoring

- Use **MongoDB Atlas Performance Advisor** to detect slow queries (> 100ms)
- Check for `COLLSCAN` in `explain()` output — add indexes accordingly
- Review **Atlas index usage stats** weekly — drop unused indexes
- Target: zero `COLLSCAN` on any user-facing query path
