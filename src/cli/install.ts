import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type CliProvider, resolveProviderList } from './providers.js';

export interface InstallOptions {
  cwd: string;
  homeDir?: string;
  providers?: string[];
  scope?: 'project' | 'global';
  withHooks?: boolean;
  packageRoot?: string;
}

export interface InstallReport {
  installed: Array<{ provider: string; path: string; hooksWritten?: string }>;
}

function defaultPackageRoot(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidateDist = path.resolve(here, '..', '..');
  if (fs.existsSync(path.join(candidateDist, 'dist', 'skills'))) {
    return candidateDist;
  }
  const candidateParent = path.resolve(here, '..');
  if (fs.existsSync(path.join(candidateParent, 'skills'))) {
    return path.resolve(candidateParent, '..');
  }
  return candidateDist;
}

function copyDirRecursive(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function writeHookManifest(provider: CliProvider, cwd: string): string | undefined {
  if (!provider.hooksManifestRel) return undefined;
  const manifestPath = path.join(cwd, provider.configDir, provider.hooksManifestRel);
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });

  let existing: Record<string, unknown> = {};
  if (fs.existsSync(manifestPath)) {
    try {
      existing = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Record<string, unknown>;
    } catch {
      existing = {};
    }
  }

  if (provider.id === 'claude-code') {
    const hooks = (existing.hooks as Record<string, unknown> | undefined) ?? {};
    existing.hooks = {
      ...hooks,
      PostToolUse: [
        {
          matcher: 'Edit|Write',
          hooks: [{ type: 'command', command: 'npx honed detect --quiet' }],
        },
      ],
    };
  } else {
    existing.honed = {
      postEdit: 'npx honed detect --quiet',
    };
  }

  fs.writeFileSync(manifestPath, `${JSON.stringify(existing, null, 2)}\n`, 'utf8');
  return manifestPath;
}

export function installSkill(options: InstallOptions): InstallReport {
  const homeDir = options.homeDir ?? os.homedir();
  const scope = options.scope ?? 'project';
  const pkgRoot = options.packageRoot ?? defaultPackageRoot();
  const providers = resolveProviderList(options.providers, options.cwd, homeDir);

  const installed: InstallReport['installed'] = [];

  for (const provider of providers) {
    const sourceDir = path.join(pkgRoot, 'dist', 'skills', provider.id, 'honed');
    if (!fs.existsSync(sourceDir)) {
      throw new Error(
        `Built skill bundle not found at ${sourceDir}. Run "bun run build:skills" first.`,
      );
    }

    const targetDir =
      scope === 'global'
        ? path.join(homeDir, provider.globalSkillsDir, 'honed')
        : path.join(options.cwd, provider.configDir, 'skills', 'honed');

    fs.rmSync(targetDir, { recursive: true, force: true });
    copyDirRecursive(sourceDir, targetDir);

    let hooksWritten: string | undefined;
    if (options.withHooks && scope === 'project') {
      hooksWritten = writeHookManifest(provider, options.cwd);
    }

    installed.push({
      provider: provider.id,
      path: targetDir,
      ...(hooksWritten ? { hooksWritten } : {}),
    });
  }

  return { installed };
}
