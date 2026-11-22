# `doctor` — Diagnose Honed Setup & Drift

Run `{{scripts_path}}/honed doctor` (or `npx honed doctor`) and report:

1. Whether `ARCHITECTURE.md` and `.honed/config.json` exist and are valid.
2. Which AI harness skill installations and edit hooks are present and up to date.
3. Whether any inline `honed-disable` waivers in the codebase are stale (`--report-unused-ignores`).

Fix only what the user asks to repair.
