# `init` — Capture Project Architecture & Constraints

Establish durable project context once so every subsequent Honed command understands the codebase without re-guessing.

## Process

1. **Inspect before asking.** Read `package.json` / `pyproject.toml` / `composer.json` / `go.mod`, directory layout, entrypoints, database/ORM configs, CI workflows, and existing docs.
2. **Ask only what code cannot tell you** (max 3–4 concise questions):
   - Primary engineering mode (`Service/API`, `Library/SDK`, `Worker/Pipeline`, or `CLI/Tool`) if ambiguous.
   - Critical reliability/security constraints (SLOs, multi-tenancy, compliance, expected scale).
   - Deployment model (containers, serverless, bare VM, monorepo).
3. **Write `ARCHITECTURE.md`** at the project root covering:
   - System purpose & engineering mode
   - Tech stack & runtime versions
   - Module boundaries & data flow
   - External dependencies & trust boundaries
   - Key constraints & non-goals
4. **Write `.honed/config.json`** (if not present) with project-specific detector settings (languages, ignored paths like `dist/`, `vendor/`).
5. **Confirm** what was written and suggest the next step (typically `/honed audit`).
