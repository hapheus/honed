# Deterministic Detector (`honed detect`)

`honed detect` is a zero-LLM static scanner that catches security hazards, resilience gaps, and AI-generated code slop deterministically.

## Supported Languages & Rules

Run `npx honed detect --list-rules` for the full live registry:

- **Generic:** `hardcoded-secret`, `sql-string-interpolation`, `tautological-comment`, `deep-nesting`, `oversized-file`
- **TypeScript / JavaScript:** `ts-empty-catch`, `ts-fetch-no-timeout`, `ts-eval-usage`, `ts-any-cast`, `ts-ignore-directive`, `ts-console-log`
- **Python:** `py-bare-except`, `py-requests-no-timeout`, `py-unsafe-exec`, `py-mutable-default`, `py-type-ignore-bare`, `py-print-debug`
- **PHP:** `php-empty-catch`, `php-unsafe-exec`, `php-debug-leftover`, `php-error-suppression`, `php-missing-strict-types`
- **Go:** `go-http-no-timeout`, `go-ignored-error`, `go-fmt-print-debug`

## Exit Codes

- `0` — Clean (no findings, no errors)
- `1` — Scan/IO error
- `2` — One or more findings (or unused inline ignores when `--report-unused-ignores` is passed)

## Configuration (`.honed/config.json`)

```json
{
  "ignorePaths": ["tests/fixtures", "legacy"],
  "disableRules": ["php-missing-strict-types"]
}
```

## Inline Waivers

Suppress a single false positive with a mandatory reason:

```ts
// honed-disable-next-line ts-any-cast: third-party untyped SDK callback
const raw = legacyPayload as any;
```

Or in Python / Shell-comment languages:

```python
# honed-disable-next-line py-print-debug: intentional CLI output
print(result)
```

Keep waivers honest in CI with:

```bash
npx honed detect --report-unused-ignores src/
```
