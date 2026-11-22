import fs from 'node:fs';
import path from 'node:path';

export interface ProviderConfig {
  id: string;
  displayName: string;
  configDir: string;
  globalSkillsDir: string;
  commandPrefix: string;
  hooksManifestRel?: string;
}

export const PROVIDERS: Record<string, ProviderConfig> = {
  'claude-code': {
    id: 'claude-code',
    displayName: 'Claude Code',
    configDir: '.claude',
    globalSkillsDir: '.claude/skills',
    commandPrefix: '/',
    hooksManifestRel: 'settings.json',
  },
  cursor: {
    id: 'cursor',
    displayName: 'Cursor',
    configDir: '.cursor',
    globalSkillsDir: '.cursor/skills',
    commandPrefix: '/',
    hooksManifestRel: 'hooks.json',
  },
  codex: {
    id: 'codex',
    displayName: 'Codex CLI',
    configDir: '.codex',
    globalSkillsDir: '.codex/skills',
    commandPrefix: '$',
    hooksManifestRel: 'hooks.json',
  },
  agents: {
    id: 'agents',
    displayName: 'Agent Skills (.agents)',
    configDir: '.agents',
    globalSkillsDir: '.agents/skills',
    commandPrefix: '$',
  },
  github: {
    id: 'github',
    displayName: 'GitHub Copilot',
    configDir: '.github',
    globalSkillsDir: '.copilot/skills',
    commandPrefix: '/',
    hooksManifestRel: 'hooks/honed.json',
  },
  gemini: {
    id: 'gemini',
    displayName: 'Gemini CLI',
    configDir: '.gemini',
    globalSkillsDir: '.gemini/skills',
    commandPrefix: '/',
  },
  antigravity: {
    id: 'antigravity',
    displayName: 'Antigravity',
    configDir: '.agent',
    globalSkillsDir: '.gemini/skills',
    commandPrefix: '/',
  },
  opencode: {
    id: 'opencode',
    displayName: 'OpenCode',
    configDir: '.opencode',
    globalSkillsDir: '.config/opencode/skills',
    commandPrefix: '/',
  },
};

const COMMAND_HINT =
  'init|audit|simplify|architect|refactor|harden|optimize|test|observe|productionize|deslop|polish|doctor';

export function validateSkillLinks(skillDir: string, skillSrcContent: string): string[] {
  const errors: string[] = [];
  const linkRe = /\[[^\]]+\]\((reference\/[^)#\s]+)(?:#[^)]*)?\)/g;
  for (const match of skillSrcContent.matchAll(linkRe)) {
    const relTarget = match[1];
    if (!relTarget) continue;
    const fullTarget = path.join(skillDir, relTarget);
    if (!fs.existsSync(fullTarget)) {
      errors.push(`Broken reference link in SKILL.src.md: ${relTarget}`);
    }
  }
  return errors;
}

export function transformSkillMarkdown(source: string, provider: ProviderConfig): string {
  return source
    .replaceAll('{{scripts_path}}', 'npx honed')
    .replaceAll('{{command_prefix}}', provider.commandPrefix)
    .replaceAll('{{command_hint}}', COMMAND_HINT);
}
