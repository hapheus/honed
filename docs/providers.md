# Supported Providers

| Provider | ID (`--providers`) | Project Directory | Global Directory |
|---|---|---|---|
| Claude Code | `claude-code` | `.claude/skills/honed` | `~/.claude/skills/honed` |
| Cursor | `cursor` | `.cursor/skills/honed` | `~/.cursor/skills/honed` |
| Codex CLI | `codex` | `.codex/skills/honed` | `~/.codex/skills/honed` |
| Agent Skills | `agents` | `.agents/skills/honed` | `~/.agents/skills/honed` |
| GitHub Copilot | `github` | `.github/skills/honed` | `~/.copilot/skills/honed` |
| Gemini CLI | `gemini` | `.gemini/skills/honed` | `~/.gemini/skills/honed` |
| Antigravity | `antigravity` | `.agent/skills/honed` | `~/.gemini/skills/honed` |
| OpenCode | `opencode` | `.opencode/skills/honed` | `~/.config/opencode/skills/honed` |

## Updating

```bash
npx honed update
```

## Pinning Shortcuts

Create standalone slash-command shortcuts for commands you run frequently:

```bash
npx honed pin audit
npx honed unpin audit
```
