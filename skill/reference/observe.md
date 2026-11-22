# `observe` — Logging, Metrics, Tracing & Health

Make failures diagnosable in production without attaching a debugger or guessing from vague error logs.

## Observability Standards

1. **Structured Logging:** Emit JSON/structured logs to `stdout` with consistent fields (`timestamp`, `level`, `msg`, `service`, `traceId`, `requestId`, `durationMs`). Never log secrets, tokens, passwords, or raw PII.
2. **Log Levels with Discipline:** `error` for actionable failures needing attention, `warn` for degraded/retried conditions, `info` for lifecycle & key business transitions, `debug` for diagnostics. Remove `console.log`/`print`/`var_dump` debug noise.
3. **Metrics (RED / USE):** Track **R**ate, **E**rrors, and **D**uration (histograms, not just averages) for endpoints/jobs, plus **U**tilization, **S**aturation, and **E**rrors for pools/queues. Keep label cardinality bounded (never put `userId` or raw URLs with IDs in metric labels).
4. **Distributed Tracing:** Propagate trace/correlation IDs (`traceparent` / `X-Request-Id`) across HTTP, queue, and worker boundaries; wrap external I/O in spans.
5. **Health & Readiness Probes:** Separate `/healthz` (liveness: process is alive, no external calls) from `/readyz` (readiness: DB/broker connections are healthy).
