# Contributing to Honed

Thank you for your interest in contributing to **Honed**!

## Branch & Pull Request Workflow

Direct pushes to `main` are disabled. All changes must go through a pull request:

1. Fork or create a descriptive branch from `main` (`feat/<topic>`, `fix/<topic>`, `docs/<topic>`, `chore/<topic>`).
2. Make focused, well-tested changes.
3. Run the full verification gate locally before pushing:
   ```bash
   bun run check
   ```
4. Open a pull request against `main` using the PR template.
5. At least **2 approving reviews** (including Code Owners) and all required CI checks (`CI`, `CodeQL`, `OSV-Scanner`) must pass before merging.

## Development Setup

Requirements:
- [Bun](https://bun.sh) `>= 1.2` (or Node.js `>= 20`)

```bash
git clone https://github.com/hapheus/honed.git
cd honed
bun install
bun run check
```

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat(detect): add php strict_types rule`
- `fix(cli): handle missing global skills directory`
- `docs(principles): clarify Rule of Three vs DRY`
- `ci(deps): update github-actions`

## Adding a Detector Rule

1. Add the rule in `src/detect/rules/<language>.ts` (or `generic.ts`) with a unique `id`, `category` (`slop` | `quality`), `severity` (`P0` | `P1` | `P2` | `P3`), `description`, and `remediation`.
2. Add both **should-flag** and **should-pass** (false-positive) test cases in `tests/detect/rules.test.ts`.
3. Document the rule if needed and run `bun run check`.

## Adding or Updating a Skill Playbook

1. Edit the source file under `skill/SKILL.src.md` or `skill/reference/*.md`.
2. Keep playbooks concise, actionable, and free of redundant fluff.
3. Run `bun run build:skills` and `bun test` to verify links, frontmatter, and token budgets.
