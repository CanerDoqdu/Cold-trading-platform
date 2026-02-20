# Development Roadmap (12-Feature Implementation)

**Status Dates:**
- Created: 2026-02-20
- Last Updated: 2026-02-20

---

## PR-1: Foundation Setup
- [x] Modular folder structure (domain-based)
- [x] Config management (dev/stage/prod)
- [x] Centralized error handling
- [x] Structured logging + correlation ID
- [x] Error classification
- [x] Manual testing before push

## PR-2: Security Layer
- [x] Security headers
- [x] Input validation
- [x] Output sanitization
- [x] CSRF protection
- [x] Rate limiting
- [x] Refresh token + token rotation

## PR-3: Performance & Cache
- [x] Redis-ready cache adapter (MemoryCacheAdapter with async interface)
- [x] Request deduplication (10 concurrent users → 1 API call)
- [x] Response normalization (CoinGecko/OpenSea → typed internal models)
- [x] WebSocket batching + backpressure handling
- [x] Route refactors: markets, coin, ohlc, market_chart, simple_price, nft-rankings
- [x] Cache-first pattern on all CoinGecko routes
- [x] Structured logging integration in all refactored routes

## PR-4: Resilience & Background
- [ ] Circuit breaker
- [ ] Retry with backoff
- [ ] Timeout guards
- [ ] Graceful shutdown
- [ ] Health check endpoint
- [ ] Dependency health monitor
- [ ] BullMQ background queue
- [ ] Scheduled jobs
- [ ] Dead letter logic

## PR-5: Testing & Simulation
- [ ] Integration tests
- [ ] API failure simulation
- [ ] WebSocket disconnect simulation
- [ ] DB latency simulation
- [ ] Rate limit simulation

## PR-6: Delivery & Metrics
- [ ] Dockerization
- [ ] GitHub Actions CI
- [ ] nginx reverse proxy
- [ ] k6 load test + CI gate
- [ ] SLO/SLI: p95 latency tracking
- [ ] SLO/SLI: RPS tracking
- [ ] SLO/SLI: error rate tracking
- [ ] SLO/SLI: MTTR tracking

---

## Metrics to Track
- **p95 latency:** (baseline → target)
- **RPS (throughput):** (baseline → target)
- **Error rate:** (baseline → target)
- **MTTR (recovery time):** (baseline → target)

---

## Notes
- Manual tasks: GitHub repo/secrets, local Docker setup, Node/k6 installs
- All code generation + automation: AI assisted
- **CRITICAL:** Test every PR locally before push (npm run lint, tsc, npm run dev)
