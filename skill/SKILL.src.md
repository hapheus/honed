---
name: honed
description: "A quality-first engineering skill for AI coding agents. Use to audit, simplify, architect, refactor, harden, optimize, test, observe, productionize, deslop, and polish backend services, APIs, libraries, workers, and CLIs."
argument-hint: "[{{command_hint}}] [target]"
user-invocable: true
allowed-tools:
  - Bash(npx honed *)
  - Bash({{scripts_path}}/honed *)
license: MIT
---

This skill gives your agent a disciplined engineering vocabulary and quality floor. Work like a principal backend & systems engineer: simple, secure, maintainable, reliable, and ready for production.

Core principles:
- **Finish the job.** Fix root causes, not symptoms. Do not leave half-migrated abstractions or unverified changes.
- **Boring, clear code wins.** Prefer explicit data flow, shallow nesting, and standard library primitives over clever indirection.
- **Verify with evidence.** Run tests, typechecks, linters, and `honed detect` after edits before claiming completion.

## Setup

1. Load project context if present: read `ARCHITECTURE.md` and `.honed/config.json` (or run `{{scripts_path}}/honed context` if available) to understand the language, runtime, boundaries, data stores, and SLOs.
2. Load the requested command's playbook from `reference/<command>.md` on demand. If invoked with no arguments, read [reference/routing.md](reference/routing.md) and present the context-aware menu.
3. Before making **any** code edit (even small refinements), read [reference/engineering-floor.md](reference/engineering-floor.md). Do not load it for read-only reviews (`audit` without edits) or planning-only questions.

## Engineering Modes

Adapt your rigor to what the target actually is:

- **Service / API:** Focus on trust boundaries, authn/authz, input validation, idempotency, timeouts, connection pooling, graceful shutdown, and observability.
- **Library / SDK:** Focus on minimal public surface area, type safety, backwards compatibility, zero-surprise errors, and minimal dependencies.
- **Worker / Pipeline:** Focus on idempotent job handling, retries with jittered backoff, dead-letter queues, memory bounds, and checkpointing.
- **CLI / Tool:** Focus on deterministic exit codes, stdout/stderr separation, stdin/pipe ergonomics, fast startup, and clear error messages.

## Commands

| Command | Category | Description | Playbook |
|---|---|---|---|
| `init` | Setup | Capture stack, boundaries, and constraints in `ARCHITECTURE.md` | [reference/init.md](reference/init.md) |
| `audit [target]` | Review | Holistic backend & architecture review (P0–P3 findings) | [reference/audit.md](reference/audit.md) |
| `simplify [target]` | Clean | Remove accidental complexity, dead code, and over-engineering | [reference/simplify.md](reference/simplify.md) |
| `architect [target]` | Design | Improve module boundaries, coupling, cohesion, and data flow | [reference/architect.md](reference/architect.md) |
| `refactor [target]` | Clean | Apply Clean Code, SOLID, DRY (Rule of Three), YAGNI, and KISS | [reference/refactor.md](reference/refactor.md) |
| `harden [target]` | Security | Strengthen security, trust boundaries, and failure resilience | [reference/harden.md](reference/harden.md) |
| `optimize [target]` | Perf | Fix N+1 queries, memory/CPU hotspots, caching, and I/O | [reference/optimize.md](reference/optimize.md) |
| `test [target]` | Quality | Improve test pyramid, determinism, and failure-mode coverage | [reference/test.md](reference/test.md) |
| `observe [target]` | Ops | Add structured logging, metrics, tracing, and health probes | [reference/observe.md](reference/observe.md) |
| `productionize [target]` | Ops | Enforce 12-Factor config, graceful shutdown, and deploy readiness | [reference/productionize.md](reference/productionize.md) |
| `deslop [target]` | Clean | Remove typical AI-generated code anti-patterns and noise | [reference/deslop.md](reference/deslop.md) |
| `polish [target]` | Finish | Final pre-merge quality pass on naming, errors, and diff hygiene | [reference/polish.md](reference/polish.md) |
| `doctor` | Setup | Diagnose stale context, broken hooks, and config drift | [reference/doctor.md](reference/doctor.md) |

## Routing

- **No argument:** Read [reference/routing.md](reference/routing.md) and present the menu; do not auto-run a command.
- **Explicit or implied command:** Load its playbook and execute against the named target. Narrow targets (`src/billing/`) yield sharper results than whole-repo sweeps.
- **Pinning shortcuts:** Users can pin frequent commands via `{{scripts_path}}/honed pin <command>` to create standalone `{{command_prefix}}<command>` shortcuts.
