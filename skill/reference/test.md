# `test` — Test Quality, Determinism & Coverage

Tests exist to give confidence to refactor and ship, not to inflate coverage percentages with tautological assertions.

## Checklist

1. **Test Behavior, Not Implementation:** Assert on public outputs, state transitions, and emitted side effects—not private helper call counts or internal mock choreography.
2. **Pyramid & Boundaries:** Keep pure domain/business logic in fast, deterministic unit tests; cover DB queries, serialization, auth, and HTTP contracts with focused integration tests.
3. **Failure Modes & Edge Cases:** Explicitly test invalid inputs, boundary values (`0`, empty, max), timeouts, partial failures, duplicate/idempotent requests, and concurrency races.
4. **Eliminate Flakiness:** Replace real wall-clock `sleep`s, random unseeded data, shared mutable test state, and live network calls with injected clocks, deterministic fixtures, and local fakes/stubs.
5. **Clean Fixtures:** Keep test setup local and readable; avoid massive shared test harnesses that hide what a test actually sets up.
