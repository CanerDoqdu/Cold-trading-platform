## Summary
- What changed?
- Why was it needed?

## Scope
- [ ] Frontend
- [ ] Backend/API
- [ ] Infra/Config
- [ ] Docs
- [ ] Tests

## Validation
- [ ] npm run lint
- [ ] npm run typecheck
- [ ] npm run build
- [ ] Manual smoke test completed

## RULE 11 — No-Loop / Fast Execution Config (MANDATORY)
- [ ] Max fix attempts per same root cause: 3 attempts
- [ ] After 3 failed attempts: stopped same-path retry and switched strategy
- [ ] Strategy switch order used: config check → minimal repro → fallback → isolate commit delta
- [ ] If blocked: added BLOCKED evidence and waited for required input/decision
- [ ] Kept single-task consistency (no parallel task jumping mid-issue)

### Block Record (MANDATORY when blocked)
- Issue worked on:
- Attempt count (1-3):
- Strategy switch used (if any):
- Blocking dependency (key/decision/access):

## RULE 9 — Docs-First Debug (MANDATORY for bugfixes)
- [ ] Error-output links reviewed (if present)
- [ ] Official docs/changelog checked for version behavior
- Links used:
  - 
  - 

## RULE 12 + Verification — Agent Error-Prevention Checks (MANDATORY)
- [ ] Scope Gate: implemented only requested scope (no unrelated refactor)
- [ ] Confidence Gate: if uncertainty was high, asked 1-3 precise questions before risky edits
- [ ] Evidence Gate: bug fix supported by evidence (error/log/test/docs)
- [ ] Change Gate: smallest patch used (avoided touching >5 files unless required)
- [ ] Safety Gate: for auth/money/security changes, explicit verify + rollback note included
- [ ] Requirement coverage check: all requested items completed (no silent skips)
- [ ] Root-cause check: fix addresses cause, not only symptom

## Risk & Rollback
- Risk level: Low / Medium / High
- Rollback plan:

## Related
- Closes #
- Related issue(s):
