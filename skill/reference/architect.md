# `architect` — Improve System & Module Architecture

Evaluate and reshape structural boundaries, dependency direction, and data ownership so the system stays easy to change as it grows.

## Evaluation Lenses

1. **Module Boundaries & Cohesion:** Do modules group by domain capability/reason to change rather than arbitrary technical layers (`controllers/`, `helpers/`, `utils/`)?
2. **Dependency Direction (DIP):** Does core business logic depend on stable domain ports/interfaces rather than concrete database clients, HTTP frameworks, or third-party SDKs?
3. **Coupling & Circular Dependencies:** Identify cyclic imports, shared mutable globals, and leaky abstractions (e.g., ORM entities exposed directly in API responses).
4. **Pure Core / Imperative Shell:** Separate deterministic domain calculations from side-effecting I/O.
5. **Data Ownership & Contracts:** Ensure clear ownership of tables/state, explicit DTO/schema boundaries, and backwards-compatible internal contracts.

## Guardrails

- **No architecture astronautics:** Only introduce Ports & Adapters or eventing where coupling actually hurts or multiple implementations/tests genuinely need it.
- **Incremental migration:** Propose or execute a safe, step-by-step boundary refactor that keeps tests green at every step.
