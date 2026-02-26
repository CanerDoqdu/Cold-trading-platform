# Event Sourcing — Future Architecture Reference

> **Status:** Not implemented — documented for future scale beyond MVP.
> **Relevant from:** PR5 (WebSocket + Real-Time Data Engine)

## Concept

Event sourcing stores every state change as an immutable event. Instead of
storing "current balance = $8,500", we store every transaction that led there:

```
Event 1: USER_CREATED   { balance: 10000 }
Event 2: ORDER_FILLED   { side: buy,  symbol: BTC, amount: 0.01, price: 50000, total: -500 }
Event 3: ORDER_FILLED   { side: buy,  symbol: ETH, amount: 1.0,  price: 3000,  total: -3000 }
Event 4: ORDER_FILLED   { side: sell, symbol: BTC, amount: 0.01, price: 60000, total: +600 }
→ Current balance: 10000 - 500 - 3000 + 600 = 7100
```

## Why This Matters for a Crypto Platform

1. **Audit Trail** — Financial regulators require full transaction history.
2. **Replay & Debug** — Replay all events to reconstruct any historical state.
3. **Price Disputes** — "What price did I buy at?" is answered by the event log.
4. **WebSocket Replays** — Store all WS messages as events; replay missed data
   after disconnection instead of relying on REST backfill.

## Current Approach (MVP)

- `AuditLog` model stores key events (`ORDER_PLACED`, `LOGIN`, `2FA_ENABLED`)
- MongoDB transactions ensure atomicity of balance + portfolio updates
- WebSocket messages are processed in-memory only (not persisted)

## Future Implementation Plan

### Phase 1 — Event Log Collection (Post-MVP)

```
Collection: events
Schema:
  _id:          ObjectId
  aggregateId:  string    (userId or orderId)
  aggregateType: string   ("User" | "Order" | "Portfolio")
  eventType:    string    ("OrderPlaced" | "OrderFilled" | "PriceUpdated")
  payload:      object    (event-specific data)
  metadata:     object    (requestId, ip, userAgent)
  version:      number    (aggregate version for ordering)
  timestamp:    Date
  
Indexes:
  { aggregateId: 1, version: 1 } unique
  { eventType: 1, timestamp: 1 }
  { timestamp: 1 }  TTL optional for non-financial events
```

### Phase 2 — CQRS (Command Query Separation)

- **Write side:** Append events to event log
- **Read side:** Materialized views (current balance, portfolio summary)
- **Projection workers:** Process events → update read models

### Phase 3 — Stream Processing (>100k users)

- Replace MongoDB event log with Apache Kafka / Amazon Kinesis
- Event consumers: portfolio projector, alert checker, analytics
- Dead letter queue for failed processing

## Decision Log

| Date       | Decision                            | Rationale                          |
|------------|-------------------------------------|------------------------------------|
| 2026-02-26 | Skip event sourcing for MVP         | Complexity vs. user base tradeoff  |
| 2026-02-26 | Use AuditLog as lightweight event store | Covers compliance requirements    |
| 2026-02-26 | WebSocket messages not persisted    | No replay need at current scale    |

## References

- Martin Fowler: [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- Greg Young: [CQRS Documents](https://cqrs.files.wordpress.com/2010/11/cqrs_documents.pdf)
- Binance WebSocket Docs: [streams](https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams)
