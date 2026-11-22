# `deslop` — Remove AI-Generated Code Anti-Patterns

Strip out the telltale patterns AI coding agents leave behind when generating code without discipline.

## AI-Slop Tells to Eliminate

1. **Tautological & Narrator Comments:** Delete comments that restate the code (`// Increment counter by 1`, `// Return the user`, `// Import dependencies`). Keep only comments explaining *why* (invariants, workarounds, non-obvious tradeoffs).
2. **Speculative Wrapper Layers:** Remove 1-line pass-through functions, single-use `BaseService`/`AbstractManager` hierarchies, and redundant DTO mappers that copy fields 1:1 without validation.
3. **Swallowed & Generic Errors:** Replace empty `catch {}` / `except: pass` and `throw new Error("Something went wrong")` with contextual, typed error handling.
4. **Defensive Paranoia on Internal Code:** Remove redundant `if (!x) return null` checks where types already guarantee `x`, or impossible fallback branches that mask bugs instead of failing fast.
5. **Type-Suppression & Debug Leftovers:** Eliminate `: any`, `@ts-ignore`, `# type: ignore`, `console.log`, `print()`, `dd()`, `var_dump()`, and `TODO` placeholders left mid-implementation.
6. **Run the Deterministic Detector:** Run `npx honed detect <target>` (or `{{scripts_path}}/honed detect <target>`) and resolve every finding cleanly.
