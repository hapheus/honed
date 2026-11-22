# Honed

> [!NOTE]
> **Work in Progress (WIP):** Honed is currently under active development. APIs, CLI flags, and detector rules may change before the first stable release.

[![CI](https://github.com/hapheus/honed/actions/workflows/ci.yml/badge.svg)](https://github.com/hapheus/honed/actions/workflows/ci.yml)
[![CodeQL](https://github.com/hapheus/honed/actions/workflows/codeql.yml/badge.svg)](https://github.com/hapheus/honed/actions/workflows/codeql.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/hapheus/honed/badge)](https://scorecard.dev/viewer/?uri=github.com/hapheus/honed)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **A quality-first engineering skill for AI coding agents.**
> Build software that is simple, secure, maintainable, reliable, and ready for production.

```bash
npx honed install
```

Reload your AI coding tool, then run `/honed init` (`$honed init` on Codex) to capture your project's architecture and constraints.

Works with **Claude Code**, **Cursor**, **Codex CLI**, **GitHub Copilot**, **Gemini CLI**, **Antigravity**, **OpenCode**, and `.agents`-compatible harnesses.

---

## Why Honed?

Unconstrained AI coding agents produce predictable failure modes: bloated abstractions, swallowed errors, missing timeouts, hardcoded fallbacks, tautological comments, and fragile tests.

- **Precise engineering vocabulary.** Instead of vague prompts like *"clean this up"*, `/honed simplify src/billing/` or `/honed harden src/webhooks/` loads a targeted playbook for that exact engineering move.
- **Pragmatic principles, not dogma.** Enforces **SOLID**, **DRY** (paired with the **Rule of Three** & **AHA**), **YAGNI**, **KISS**, **Law of Demeter**, **Composition over Inheritance**, **Fail Fast**, and **12-Factor** discipline.
- **Deterministic AI-slop & quality detector.** Zero-LLM static scanner (`npx honed detect`) for **TypeScript/JavaScript, Python, PHP, Go**, and cross-language security/slop patterns—ready for agent hooks and GitHub Code Scanning (SARIF 2.1.0).

---

## Commands

| Command | Category | Purpose |
|---|---|---|
| `init` | Setup | Inspect repo, capture `ARCHITECTURE.md` & `.honed/config.json` |
| `audit [target]` | Review | Holistic backend & architecture review with `P0`–`P3` findings |
| `simplify [target]` | Clean | Remove accidental complexity, dead code, and over-engineering |
| `architect [target]` | Design | Improve module boundaries, dependency direction, and coupling |
| `refactor [target]` | Clean | Apply Clean Code, SOLID, DRY (Rule of Three), YAGNI, and KISS |
| `harden [target]` | Security | Strengthen trust boundaries, auth, timeouts, retries, and idempotency |
| `optimize [target]` | Perf | Eliminate N+1 queries, memory/CPU hotspots, and unbounded I/O |
| `test [target]` | Quality | Improve test pyramid, determinism, and failure-mode coverage |
| `observe [target]` | Ops | Add structured logging, RED/USE metrics, tracing, and health probes |
| `productionize [target]` | Ops | Enforce 12-Factor config, graceful shutdown, and deploy readiness |
| `deslop [target]` | Clean | Strip AI-generated code tells, narrator comments, and type escapes |
| `polish [target]` | Finish | Final pre-merge pass on naming, error clarity, and diff hygiene |
| `doctor` | Setup | Diagnose missing context, broken hooks, and unused inline ignores |

Pin any frequent command as a standalone shortcut:

```bash
npx honed pin audit
```

---

## Deterministic Detector (`honed detect`)

Run `honed detect` locally, via post-edit agent hooks (`npx honed install --with-hooks`), or in CI:

```bash
npx honed detect src/                         # Scan directory (exit 2 on findings)
npx honed detect --json src/                  # Machine-readable JSON output
npx honed detect --github src/                # GitHub Actions annotations
npx honed detect --sarif src/ > honed.sarif   # SARIF 2.1.0 for GitHub Code Scanning
npx honed detect --list-rules                 # List all built-in rules
npx honed detect --report-unused-ignores src/ # Flag stale inline waivers
```

### GitHub Actions (SARIF)

```yaml
permissions:
  contents: read
  security-events: write
steps:
  - uses: actions/checkout@v4
  - run: npx honed detect --sarif src/ > honed.sarif || test $? -eq 2
  - uses: github/codeql-action/upload-sarif@v3
    with:
      sarif_file: honed.sarif
      category: honed
```

---

## Documentation

- [Getting Started](docs/getting-started.md)
- [Command Reference](docs/commands.md)
- [Engineering Principles](docs/principles.md)
- [Detector & CI Guide](docs/detector.md)
- [Supported Providers](docs/providers.md)

## Contributing & Security

- Read [CONTRIBUTING.md](CONTRIBUTING.md) for our branch-only, PR-based workflow (minimum 2 reviewers on `main`).
- Report security issues privately via [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © 2026 hapheus
