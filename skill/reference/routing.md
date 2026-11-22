# Honed Command Routing

When `/honed` is invoked with no arguments, inspect the current project state (`ARCHITECTURE.md`, `.honed/config.json`, recent files) and present this concise menu without auto-running any command:

- **Setup & Diagnostics:** `init` (capture `ARCHITECTURE.md`) · `doctor` (check hooks & config)
- **Review & Design:** `audit` (holistic review) · `architect` (boundaries & coupling)
- **Clean & Refactor:** `simplify` (cut complexity) · `refactor` (Clean Code, SOLID, DRY, YAGNI) · `deslop` (remove AI slop)
- **Reliability & Ops:** `harden` (security & resilience) · `optimize` (performance) · `test` (test quality) · `observe` (logging, metrics, tracing) · `productionize` (12-Factor & deploy readiness)
- **Finish:** `polish` (final pre-merge pass)

Ask which command and target path/module the user wants to run.
