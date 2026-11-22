# Repository Guidelines for AI Coding Agents

## Branch & Merge Policy

- **Never commit or push directly to `main`.** `main` is protected and requires pull requests with at least 2 approving reviews and passing CI checks.
- Always create a feature/fix branch (`feat/...`, `fix/...`, `docs/...`, `chore/...`) from `main` and open a pull request.

## Project Structure

- `skill/` — Single source of truth for the `honed` skill (`SKILL.src.md` and `reference/*.md`).
- `src/cli/` — CLI entrypoint (`install`, `update`, `pin`, `unpin`, `detect`, `doctor`, `hooks`, `context`).
- `src/detect/` — Zero-LLM deterministic code-quality & AI-slop detector (TypeScript/JS, Python, PHP, Go, Generic) with terminal, JSON, GitHub Actions, and SARIF 2.1.0 formatters.
- `scripts/` — Multi-provider build pipeline (`scripts/build.ts`) generating `dist/skills/<provider>/`.
- `docs/` — User and contributor documentation.
- `tests/` — Automated unit, rule, formatter, build, and CLI integration tests.

## Engineering Standards

- Follow Biome formatting and lint rules (`noExplicitAny: error`).
- Keep functions small, cohesive, and shallowly nested; use early returns.
- Do not duplicate logic; validate inputs at boundaries.
- Run `bun run check` (`lint`, `typecheck`, `build`, `test`, `detect:self`) before opening a PR.
