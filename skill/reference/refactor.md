# `refactor` — Clean Code, SOLID, DRY, YAGNI & KISS

Transform messy, brittle, or coupled code into clean, idiomatic, maintainable code without changing observable behavior.

## Checklist

1. **Single Responsibility (SRP):** Split functions/classes doing 3+ unrelated things (e.g. parsing + validation + DB write + email send) into focused units.
2. **DRY with Judgment (Rule of Three / AHA):** Consolidate genuinely duplicated business logic; leave coincidental or divergent similarities separate.
3. **YAGNI & KISS:** Delete unused parameters, dead branches, and speculative extensibility hooks.
4. **Composition & Narrow Interfaces (ISP / DIP):** Break up "god" interfaces and prefer composition over inheritance hierarchies.
5. **Law of Demeter & Naming:** Replace `a.b.c.d` chains with purposeful methods; rename vague identifiers (`data`, `item`, `handle`, `process`, `manager`) to domain-accurate names.
6. **Control Flow:** Flatten nesting with early returns; replace magic numbers/strings with named constants or enums.

## Process

1. Ensure test coverage exists around the target before refactoring (add characterization tests first if missing).
2. Refactor in small, behavior-preserving steps.
3. Run tests, typecheck, and `honed detect` after completion.
