# `simplify` — Remove Unnecessary Complexity

Eliminate accidental complexity while preserving 100% of required behavior and edge-case safety.

## What to Target

1. **Over-engineered abstractions:** Single-implementation interfaces/factories, pass-through service wrappers, unnecessary dependency-injection boilerplate, premature generics.
2. **Deep nesting & tangled control flow:** Replace nested `if/else` pyramids with early returns, guard clauses, and small named helpers.
3. **Speculative features (YAGNI):** Unused config flags, dead feature branches, unreachable fallback paths, commented-out code.
4. **Convoluted data transformations:** Multi-pass array chains or opaque metaprogramming where a clear loop or plain map is faster and easier to read.
5. **Redundant state:** Derived values stored and manually synchronized instead of computed directly.

## Rules

- **Verify behavior parity:** Run existing tests before and after simplifying.
- **Never simplify away real invariants:** Keep boundary validation, error context, timeouts, and security checks intact.
- **Measure the win:** Report lines/layers removed and how readability or cyclomatic complexity improved.
