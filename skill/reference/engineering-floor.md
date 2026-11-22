# Engineering Floor

Read this before writing or modifying code. Every rule here is non-negotiable unless the user explicitly overrides it.

## Core Principles Matrix

Balance principles pragmatically — never weaponize one principle to violate another:

1. **KISS (Keep It Simple, Stupid):** Prefer plain functions, explicit control flow, and standard library tools. Shallow nesting (max 3–4 levels) via early returns and guard clauses.
2. **YAGNI (You Aren't Gonna Need It):** Do not build plugin systems, unused config flags, generic factories, or multi-provider interfaces for a single implementation. Build for today's real requirements while keeping boundaries clean.
3. **DRY + Rule of Three / AHA (Avoid Hasty Abstractions):** Duplicate code twice before abstracting on the third occurrence — and only when the concepts actually share the same lifecycle and reason to change. Duplication is far cheaper than the wrong abstraction.
4. **SOLID:**
   - **S (Single Responsibility):** One module/class/function has one clear reason to change.
   - **O (Open/Closed):** Extend behavior via composition or small interfaces rather than modifying core switch-trees everywhere.
   - **L (Liskov Substitution):** Subtypes/implementations must honor the exact contract (including errors and invariants) of their interface.
   - **I (Interface Segregation):** Keep interfaces narrow and role-specific; callers shouldn't depend on methods they don't use.
   - **D (Dependency Inversion):** Domain/business logic depends on abstractions (ports), not concrete DB drivers or HTTP clients.
5. **Separation of Concerns & Pure Core / Imperative Shell:** Keep business rules pure and deterministic; push I/O, network, clock, and DB calls to the edges.
6. **Composition over Inheritance:** Favor small composable functions, structs, and interfaces over deep class hierarchies.
7. **Law of Demeter (Tell, Don't Ask):** Avoid `a.getB().getC().doThing()` chains; ask the owning module to perform the operation.
8. **Fail Fast & Explicit Errors:** Validate inputs at system boundaries, surface errors with context, and never swallow exceptions silently.
9. **12-Factor Discipline:** Configuration via environment (validated at startup), stateless processes, structured logs to stdout, graceful shutdown on `SIGTERM`.

## Absolute Bans

- **Never swallow errors:** No empty `catch {}`, `except: pass`, or ignored Go `err` values.
- **Never hardcode secrets:** No API keys, tokens, passwords, or private keys in source or tests.
- **Never make unbounded I/O calls:** Every outbound HTTP/DB/RPC call needs a timeout (`AbortSignal`, `timeout=`, `CURLOPT_TIMEOUT`, `context.WithTimeout`) and bounded payload/pagination.
- **Never trust external input:** Validate and sanitize at every HTTP, queue, CLI, or webhook boundary before passing data inward.
- **Never interpolate untrusted data into SQL/shell:** Always use parameterized queries and argument arrays.
- **Never suppress types blindly:** No casual `any`, `@ts-ignore`, or bare `# type: ignore` without an explicit, documented invariant.
- **Never leave AI slop behind:** No tautological comments (`// increment i`), dead code, unused imports, or speculative wrapper classes.
