# `audit` — Holistic Backend & Architecture Review

Perform a thorough, evidence-based technical review of the target without editing code yet (unless the user explicitly asks to fix findings afterward).

## Severity Scale

- **P0 (Critical / Blocking):** Security vulnerabilities, data loss/corruption risks, unauthenticated endpoints, SQL/command injection, hardcoded secrets, race conditions in money/state transitions.
- **P1 (High):** Missing timeouts/retries/idempotency, N+1 queries on hot paths, swallowed errors, broken module boundaries, missing input validation, memory leaks.
- **P2 (Medium):** SOLID/DRY violations with real maintenance cost, poor testability, missing structured logging/metrics, inconsistent error contracts.
- **P3 (Polish):** Naming clarity, minor duplication, missing docstrings on public APIs.

## Audit Checklist

1. **Correctness & Data Integrity:** Edge cases, null/undefined handling, transaction boundaries, concurrency/locking, idempotency.
2. **Security & Trust Boundaries:** Authn/authz enforcement, input validation, secret handling, injection vectors, SSRF/CSRF/CORS.
3. **Architecture & Clean Code:** Coupling/cohesion, dependency direction, accidental complexity, adherence to KISS/YAGNI/SOLID/DRY.
4. **Resilience & Performance:** Timeouts, backpressure, connection pooling, bounded queries/pagination, caching pitfalls.
5. **Operability & Tests:** Structured logging (no PII), health/readiness probes, graceful shutdown, test quality and failure-mode coverage.

## Output Format

Group findings by severity (`P0` → `P3`). For every finding include:
- **Location:** `file:line`
- **Issue:** Exact technical flaw and failure scenario
- **Fix:** Concrete remediation
- **Summary:** Top 3 highest-leverage actions to take first.
