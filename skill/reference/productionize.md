# `productionize` — Production & Operational Readiness

Prepare the service, worker, or CLI to survive real traffic, deploys, restarts, and on-call incidents.

## Checklist

1. **12-Factor Configuration:** Load config from environment variables, validate all required config and schemas **fail-fast on startup**, and never bake environment-specific defaults/secrets into images.
2. **Graceful Shutdown:** Handle `SIGTERM`/`SIGINT`: stop accepting new requests/jobs, drain in-flight work within a bounded grace period, close DB/queue/HTTP pools cleanly, and exit with the right code.
3. **Database & Migration Safety:** Ensure migrations are backwards-compatible (expand-and-contract) for zero-downtime rolling deploys; avoid long table locks.
4. **Container & Runtime Hardening:** Multi-stage builds, non-root user, pinned base image digests/versions, `.dockerignore`, explicit resource limits, and minimal runtime footprint.
5. **CI/CD & Runbook Basics:** Ensure reproducible builds, automated checks (`lint`, `typecheck`, `test`, `honed detect`), and clear operational docs (env vars, health endpoints, common failure recovery).
