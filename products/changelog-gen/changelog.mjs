#!/usr/bin/env node
// Changelog generator (idea #14): turns Conventional Commit messages since the last tag into a
// readable, grouped release-notes section. No AI and no network needed.
// Usage: node changelog.mjs [--from <ref>] [--to HEAD] [--version 1.2.0] [--prepend CHANGELOG.md]
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const GROUPS = [
  ['breaking', '⚠️ Breaking changes'], ['feat', '✨ New features'], ['fix', '🐛 Bug fixes'],
  ['perf', '⚡ Performance'], ['docs', '📝 Documentation'], ['other', '🔧 Other changes'],
];
const HIDDEN = new Set(['chore', 'ci', 'build', 'style', 'test']);
const RE = /^(?<type>\w+)(?:\((?<scope>[^)]+)\))?(?<bang>!)?:\s*(?<subject>.+)$/;

export function parseCommit(message, hash = '') {
  const [header, ...body] = message.split('\n');
  const m = RE.exec(header.trim());
  const breaking = Boolean(m?.groups.bang) || body.some((l) => /^BREAKING[ -]CHANGE:/.test(l));
  if (!m) return { group: 'other', scope: null, subject: header.trim(), hash, breaking };
  const { type, scope, subject } = m.groups;
  if (HIDDEN.has(type) && !breaking) return null;
  const group = breaking ? 'breaking' : GROUPS.some(([g]) => g === type) ? type : 'other';
  return { group, scope: scope ?? null, subject: subject.charAt(0).toUpperCase() + subject.slice(1), hash, breaking };
}

export function render(entries, { version = 'Unreleased', date = new Date().toISOString().slice(0, 10) } = {}) {
  const lines = [`## ${version} (${date})`, ''];
  for (const [g, title] of GROUPS) {
    const items = entries.filter((e) => e && e.group === g);
    if (!items.length) continue;
    lines.push(`### ${title}`, '');
    for (const e of items) lines.push(`- ${e.scope ? `**${e.scope}:** ` : ''}${e.subject}${e.hash ? ` (${e.hash.slice(0, 7)})` : ''}`);
    lines.push('');
  }
  if (lines.length === 2) lines.push('_No user-facing changes._', '');
  return lines.join('\n');
}

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

function main() {
  const a = process.argv.slice(2);
  const opt = (k, d) => (a.includes(k) ? a[a.indexOf(k) + 1] : d);
  let from = opt('--from', null);
  if (!from) { try { from = git('describe', '--tags', '--abbrev=0'); } catch { from = null; } }
  const range = from ? `${from}..${opt('--to', 'HEAD')}` : opt('--to', 'HEAD');
  const raw = git('log', range, '--format=%H%x1f%B%x1e');
  const entries = raw.split('\x1e').map((s) => s.trim()).filter(Boolean)
    .map((s) => { const [hash, msg] = s.split('\x1f'); return parseCommit(msg, hash); });
  const out = render(entries, { version: opt('--version', 'Unreleased') });
  const file = opt('--prepend', null);
  if (file) {
    const old = existsSync(file) ? readFileSync(file, 'utf8').replace(/^# Changelog\n+/, '') : '';
    writeFileSync(file, `# Changelog\n\n${out}\n${old}`);
    console.log(`Updated ${file}`);
  } else {
    console.log(out);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
