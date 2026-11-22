# Command Reference

Every command loads its own focused playbook from `skill/reference/` so your agent stays sharp without bloating context.

## Setup & Diagnostics

- **`init`** — Inspects stack, boundaries, and data stores; writes `ARCHITECTURE.md` and `.honed/config.json`.
- **`doctor`** — Verifies `ARCHITECTURE.md`, `.honed/config.json`, installed provider skills, and stale inline ignores.

## Review & Architecture

- **`audit [target]`** — Holistic backend & architecture review. Reports findings ranked `P0` (blocking) to `P3` (polish) with `file:line`, failure scenario, and concrete fix.
- **`architect [target]`** — Evaluates module boundaries, dependency direction (DIP), coupling/cohesion, cyclic imports, and Pure Core / Imperative Shell separation.

## Clean Code & Complexity

- **`simplify [target]`** — Strips accidental complexity: over-engineered abstractions, deep nesting, speculative flags (YAGNI), and dead code.
- **`refactor [target]`** — Applies Clean Code, SOLID, DRY (Rule of Three / AHA), KISS, Law of Demeter, and Composition over Inheritance.
- **`deslop [target]`** — Removes AI-generated code tells: tautological comments, pass-through wrappers, swallowed errors, `: any` / `@ts-ignore` sprawl, and debug leftovers.

## Reliability, Performance & Ops

- **`harden [target]`** — Secures trust boundaries (validation, authn/authz, SQL/exec safety) and adds timeouts, jittered retries, idempotency, and bounded concurrency.
- **`optimize [target]`** — Fixes N+1 queries, missing indexes, $O(n^2)$ hotspots, unpooled clients, and memory/streaming issues.
- **`test [target]`** — Improves test pyramid balance, determinism, and failure-mode coverage while removing brittle mock-heavy tests.
- **`observe [target]`** — Adds structured logging (without secrets/PII), RED/USE metrics, trace propagation, and `/healthz` + `/readyz` probes.
- **`productionize [target]`** — Enforces 12-Factor fail-fast env validation, `SIGTERM` graceful shutdown, safe DB migrations, and container hardening.

## Final Pass

- **`polish [target]`** — Final pre-merge sweep on naming precision, actionable error messages, public docstrings, and diff hygiene.
