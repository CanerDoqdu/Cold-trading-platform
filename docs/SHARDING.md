# Sharding Strategy

> **Status:** Not needed for MVP. Document is a forward-looking plan for when
> ColdTrade scales beyond ~100k active users.

## When to Shard

| Signal | Threshold | Action |
|--------|-----------|--------|
| Working set > RAM | > 50% of cluster RAM | Upgrade tier first |
| Query latency p99 | > 500ms sustained | Optimize indexes first |
| Document count | > 50M in single collection | Consider sharding |
| Write throughput | > 1000 writes/sec sustained | Shard write-heavy collections |

**Rule:** exhaust vertical scaling and index optimization before sharding.

## Shard Key Selection

### Primary candidates

| Collection | Shard Key | Rationale |
|-----------|-----------|-----------|
| `orders` | `{ userId: 'hashed' }` | Even distribution, user's orders co-located |
| `portfolios` | `{ userId: 'hashed' }` | One doc per user, natural partition |
| `auditlogs` | `{ userId: 'hashed' }` | User audit trail stays together |
| `notifications` | `{ userId: 'hashed' }` | User's notifications on same shard |
| `pricehistories` | `{ symbol: 'hashed' }` | Coin time-series data co-located |

### Shard key properties

- **Cardinality:** `userId` (ObjectId) has high cardinality — good distribution
- **Write distribution:** hashed ensures even write spread across shards
- **Query isolation:** `userId`-scoped queries target single shard (scatter-gather avoided)

### Anti-patterns to avoid

- Don't shard on `createdAt` — creates hot shard (all writes to latest range)
- Don't shard on `status` — low cardinality causes jumbo chunks
- Don't change shard key after deployment (requires collection migration)

## Implementation Plan (Future)

1. **Pre-requisite:** MongoDB Atlas M30+ tier (auto-sharding)
2. Enable sharding on database: `sh.enableSharding('coldtrade')`
3. Shard collections one at a time, starting with highest-volume
4. Monitor chunk distribution via Atlas UI
5. Set balancer window to off-peak hours

## Collections That Should NOT Be Sharded

- `users` — Low cardinality (< 1M for a long time), unique email index
- `coins` — Small collection (< 10k documents), frequently scanned
- `sessions` — TTL handles size, low total volume

## Cost Considerations

| Tier | Cost | Sharding Support |
|------|------|------------------|
| M0 (Free) | $0 | No |
| M10 | ~$57/mo | No |
| M30 | ~$220/mo | Yes (auto-sharding) |
| M50+ | ~$500+/mo | Yes (multi-region) |

> Recommendation: Defer sharding until M30 tier is justified by traffic volume.
> Focus on read replicas (M10+) and caching layer (Redis L2) first.
