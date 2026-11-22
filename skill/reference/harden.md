# `harden` — Security & Failure Resilience

Assume inputs are hostile, networks fail, and dependencies stall. Make the target safe and resilient under real-world failure.

## Security Hardening

1. **Trust Boundaries & Validation:** Validate and coerce all external input (HTTP params/body/headers, webhooks, queue payloads, env vars, file uploads) with strict schemas.
2. **Authn & Authz:** Verify authentication and object-level authorization (prevent IDOR/BOLA) on every protected path—never rely on client-supplied user IDs or hidden fields.
3. **Injection & Execution Safety:** Parameterize all SQL/NoSQL queries; eliminate `eval`, `exec`, unsafe `unserialize`, and shell string interpolation.
4. **Secrets & Data Exposure:** Remove hardcoded secrets; scrub tokens, passwords, and PII from logs and error responses.
5. **HTTP & Transport:** Enforce strict CORS allowlists, security headers, upload size limits, and rate limiting on sensitive endpoints.

## Resilience Hardening

1. **Timeouts Everywhere:** Set explicit connect + read timeouts on every HTTP client, DB query, cache call, and subprocess.
2. **Safe Retries & Idempotency:** Retry only transient failures on idempotent operations using exponential backoff + jitter; enforce idempotency keys on mutating/payment/webhook handlers.
3. **Concurrency & Bounds:** Bound queue concurrency, pagination limits, and in-memory buffers to prevent OOM and cascading failures.
4. **Graceful Degradation:** Fail closed on auth/security; degrade gracefully with clear errors on non-critical dependencies.
