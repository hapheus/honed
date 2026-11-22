# Getting Started with Honed

## 1. Install into your project

From your repository root:

```bash
npx honed install
```

Honed auto-detects installed AI coding tools (`.claude`, `.cursor`, `.codex`, `.agents`, `.github`, `.gemini`, `.agent`, `.opencode`).

To target specific providers or install globally:

```bash
npx honed install --providers=claude-code,cursor --scope=project
npx honed install --providers=claude-code --scope=global
```

To also configure a post-edit hook that runs `honed detect` automatically when your agent edits files:

```bash
npx honed install --with-hooks
```

## 2. Initialize project context

Reload your coding tool and run:

```text
/honed init
```

Honed inspects your codebase, asks only what it cannot infer (engineering mode, SLOs, deployment model), and creates `ARCHITECTURE.md` and `.honed/config.json`.

## 3. Run your first review or cleanup

Point Honed at a specific module or directory for best results:

```text
/honed audit src/billing/
/honed simplify src/orders/
/honed harden src/webhooks/
/honed deslop src/
```

## 4. Check setup health

```bash
npx honed doctor
```
