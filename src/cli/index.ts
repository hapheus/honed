#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatGithub, formatJson, formatPretty, formatSarif } from '../detect/formatters.js';
import { ALL_RULES } from '../detect/rules/index.js';
import { scanTargets } from '../detect/scanner.js';
import { runDoctor } from './doctor.js';
import { installSkill } from './install.js';
import { managePin } from './pin.js';

function readPackageVersion(): string {
  try {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const pkgPath = path.resolve(here, '..', '..', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as { version?: string };
    return pkg.version ?? '0.1.0';
  } catch {
    return '0.1.0';
  }
}

function getFlagValue(args: string[], prefix: string): string | undefined {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i] ?? '';
    if (arg.startsWith(`${prefix}=`)) {
      return arg.slice(prefix.length + 1);
    }
    if (arg === prefix && args[i + 1] && !args[i + 1]?.startsWith('-')) {
      return args[i + 1];
    }
  }
  return undefined;
}

function printHelp(): void {
  process.stdout.write(
    [
      'honed — Quality-first engineering skill & AI-slop detector',
      '',
      'Usage:',
      '  honed install [--providers=claude-code,cursor] [--scope=project|global] [--with-hooks]',
      '  honed update  [--providers=...] [--scope=project|global]',
      '  honed pin <command> [--providers=...] [--scope=project|global]',
      '  honed unpin <command> [--providers=...] [--scope=project|global]',
      '  honed detect [paths...] [--json | --github | --sarif] [--list-rules] [--report-unused-ignores]',
      '  honed doctor',
      '  honed context',
      '',
      'Options:',
      '  -h, --help      Show this help message',
      '  -v, --version   Show version',
      '',
    ].join('\n'),
  );
}

function handleDetect(args: string[], version: string): number {
  if (args.includes('--list-rules')) {
    for (const rule of ALL_RULES) {
      process.stdout.write(
        `${rule.id.padEnd(26)} [${rule.severity}] (${rule.category}; ${rule.languages.join(',')}) ${rule.description}\n`,
      );
    }
    return 0;
  }

  const jsonOut = args.includes('--json');
  const githubOut = args.includes('--github');
  const sarifOut = args.includes('--sarif');
  const quiet = args.includes('--quiet');
  const reportUnused = args.includes('--report-unused-ignores');

  const targets = args.filter((a) => !a.startsWith('-'));
  const scanPaths = targets.length > 0 ? targets : ['.'];

  const result = scanTargets(scanPaths, {
    cwd: process.cwd(),
    reportUnusedIgnores: reportUnused,
  });

  if (sarifOut) {
    process.stdout.write(`${formatSarif(result, version)}\n`);
  } else if (jsonOut) {
    process.stdout.write(`${formatJson(result)}\n`);
  } else if (githubOut) {
    const out = formatGithub(result);
    if (out) process.stdout.write(`${out}\n`);
  } else if (!quiet || result.findings.length > 0 || result.errors.length > 0) {
    process.stdout.write(`${formatPretty(result, reportUnused)}\n`);
  }

  if (result.errors.length > 0) return 1;
  if (result.findings.length > 0) return 2;
  if (reportUnused && result.unusedIgnores.length > 0) return 2;
  return 0;
}

export function runCli(argv: string[]): number {
  const version = readPackageVersion();
  const cmd = argv[0];

  if (!cmd || cmd === '-h' || cmd === '--help') {
    printHelp();
    return 0;
  }
  if (cmd === '-v' || cmd === '--version') {
    process.stdout.write(`${version}\n`);
    return 0;
  }

  const rest = argv.slice(1);
  const providersRaw = getFlagValue(rest, '--providers');
  const providers = providersRaw ? providersRaw.split(',').filter(Boolean) : undefined;
  const scopeRaw = getFlagValue(rest, '--scope');
  const scope = scopeRaw === 'global' ? 'global' : 'project';

  try {
    if (cmd === 'install' || cmd === 'update') {
      const report = installSkill({
        cwd: process.cwd(),
        ...(providers ? { providers } : {}),
        scope,
        withHooks: rest.includes('--with-hooks'),
      });
      for (const item of report.installed) {
        process.stdout.write(`Installed honed (${item.provider}) -> ${item.path}\n`);
        if (item.hooksWritten) {
          process.stdout.write(`  Hook configured -> ${item.hooksWritten}\n`);
        }
      }
      return 0;
    }

    if (cmd === 'pin' || cmd === 'unpin') {
      const targetCmd = rest.find((a) => !a.startsWith('-'));
      if (!targetCmd) {
        process.stderr.write(`Usage: honed ${cmd} <command>\n`);
        return 1;
      }
      const paths = managePin({
        action: cmd,
        command: targetCmd,
        cwd: process.cwd(),
        ...(providers ? { providers } : {}),
        scope,
      });
      for (const p of paths) {
        process.stdout.write(`${cmd === 'pin' ? 'Pinned' : 'Unpinned'} ${targetCmd} -> ${p}\n`);
      }
      return 0;
    }

    if (cmd === 'detect') {
      return handleDetect(rest, version);
    }

    if (cmd === 'doctor') {
      const report = runDoctor(process.cwd());
      process.stdout.write(
        `ARCHITECTURE.md: ${report.architectureMdPresent ? 'present' : 'missing'}\n`,
      );
      process.stdout.write(
        `.honed/config.json: ${report.configJsonValid ? 'valid' : 'missing/invalid'}\n`,
      );
      process.stdout.write(
        `Installed providers: ${report.installedProviders.map((p) => p.id).join(', ') || 'none'}\n`,
      );
      if (report.issues.length > 0) {
        process.stdout.write('\nNotes:\n');
        for (const issue of report.issues) {
          process.stdout.write(`  - ${issue}\n`);
        }
      }
      return 0;
    }

    if (cmd === 'context') {
      const archPath = path.join(process.cwd(), 'ARCHITECTURE.md');
      if (fs.existsSync(archPath)) {
        process.stdout.write(`${fs.readFileSync(archPath, 'utf8')}\n`);
      } else {
        process.stdout.write('No ARCHITECTURE.md found. Run `/honed init` to create one.\n');
      }
      return 0;
    }

    process.stderr.write(`Unknown command: ${cmd}\nRun "honed --help" for usage.\n`);
    return 1;
  } catch (err) {
    process.stderr.write(`honed error: ${err instanceof Error ? err.message : String(err)}\n`);
    return 1;
  }
}

if (import.meta.main || process.argv[1]?.endsWith('index.js')) {
  process.exitCode = runCli(process.argv.slice(2));
}
