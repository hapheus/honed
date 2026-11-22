# `polish` — Final Pre-Merge Quality Pass

Perform a focused final sweep before opening a PR or shipping.

## Checklist

1. **Naming & Clarity:** Verify file, function, variable, and error names accurately reflect domain intent.
2. **Error Messages & Public Docs:** Ensure user-facing/API errors are actionable (what failed + how to fix, without leaking internals) and public APIs have concise docstrings.
3. **Diff Hygiene:** Inspect `git diff` for unintended edits, unused imports, dead variables, debug prints, or formatting drift.
4. **Full Verification Gate:** Run the project's linter, typechecker, test suite, and `honed detect` on all touched paths—never claim passing checks without running them after the final edit.
