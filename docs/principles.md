# Engineering Principles

Honed treats principles as engineering tradeoffs, not dogma. Applying one principle blindly (such as premature DRY or over-zealous DIP) creates worse code than the problem it tried to solve.

## 1. KISS (Keep It Simple, Stupid)
- Favor plain functions, explicit data flow, and standard library primitives.
- Keep nesting shallow (<= 3–4 levels) with early returns and guard clauses.

## 2. YAGNI (You Aren't Gonna Need It)
- Do not build speculative extension points, unused config flags, or abstract factories for a single implementation.
- Keep boundaries clean so you *can* extend later without paying the complexity tax today.

## 3. DRY + Rule of Three & AHA (Avoid Hasty Abstractions)
- Duplicate once; tolerate twice; consider abstracting on the third occurrence.
- Only share code when two callers share the **same domain concept and reason to change**, not merely identical syntax.

## 4. SOLID
- **Single Responsibility (SRP):** One module/function has one cohesive reason to change.
- **Open/Closed (OCP):** Extend via small interfaces or composition rather than scattering switch statements.
- **Liskov Substitution (LSP):** Implementations must honor the exact contract, invariants, and error semantics of their interface.
- **Interface Segregation (ISP):** Prefer small, role-specific interfaces over bloated "god" interfaces.
- **Dependency Inversion (DIP):** Business rules depend on narrow domain ports, not concrete DB drivers or HTTP clients.

## 5. Pure Core / Imperative Shell & Law of Demeter
- Keep business logic pure and deterministic; push I/O (DB, HTTP, clock, filesystem) to the edges.
- Tell, don't ask: avoid `a.getB().getC().doThing()` chains.

## 6. Fail Fast & 12-Factor Discipline
- Validate external inputs and environment config at startup and trust boundaries.
- Never swallow errors silently; attach context when wrapping.
- Design for stateless horizontal scaling, structured stdout logs, and clean `SIGTERM` shutdown.
