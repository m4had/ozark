#!/usr/bin/env node
// Uptime + SSL-expiry monitor (idea #11). Runs free on GitHub Actions every 15 minutes; opens a GitHub issue
// (which emails you) when a site is down or its certificate expires within SSL_WARN_DAYS.
import { readFileSync } from 'node:fs';
import tls from 'node:tls';

const WARN_DAYS = Number(process.env.SSL_WARN_DAYS ?? 14);

export function parseSites(text) {
  return text.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
}

export function certDaysLeft(host, port = 443) {
  return new Promise((resolve, reject) => {
    const s = tls.connect({ host, port, servername: host, timeout: 10000 }, () => {
      const cert = s.getPeerCertificate();
      s.end();
      resolve(Math.floor((new Date(cert.valid_to) - Date.now()) / 86400000));
    });
    s.on('error', reject);
    s.on('timeout', () => { s.destroy(); reject(new Error('TLS timeout')); });
  });
}

export async function checkSite(url, fetchImpl = fetch, certImpl = certDaysLeft) {
  const problems = [];
  const started = Date.now();
  try {
    const res = await fetchImpl(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
    if (res.status >= 400) problems.push(`HTTP ${res.status}`);
  } catch (e) {
    problems.push(`unreachable (${e.message})`);
  }
  const ms = Date.now() - started;
  const u = new URL(url);
  if (u.protocol === 'https:') {
    try {
      const days = await certImpl(u.hostname, Number(u.port) || 443);
      if (days < WARN_DAYS) problems.push(days < 0 ? 'SSL certificate EXPIRED' : `SSL certificate expires in ${days} day(s)`);
    } catch (e) {
      problems.push(`SSL check failed (${e.message})`);
    }
  }
  return { url, ok: problems.length === 0, problems, ms };
}

async function main() {
  const sites = parseSites(readFileSync(process.argv[2] ?? 'sites.txt', 'utf8'));
  const results = await Promise.all(sites.map((s) => checkSite(s)));
  for (const r of results) console.log(`${r.ok ? 'OK  ' : 'FAIL'} ${r.url} ${r.ms}ms ${r.problems.join('; ')}`);
  const failed = results.filter((r) => !r.ok);
  if (failed.length && process.env.GITHUB_OUTPUT) {
    const body = failed.map((r) => `- ${r.url}: ${r.problems.join('; ')}`).join('\n');
    const { appendFileSync } = await import('node:fs');
    appendFileSync(process.env.GITHUB_OUTPUT, `failed=true\nbody<<EOF\n${body}\nEOF\n`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
