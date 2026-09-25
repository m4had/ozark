#!/usr/bin/env node
// Email deliverability check (wave 2): reads a domain's public DNS records (MX, SPF, DMARC, common DKIM selectors,
// MTA-STS, TLS-RPT) and explains in plain English what to fix so invoices and receipts don't land in spam.
// Usage: node email-check.mjs <domain> [--out reports/<domain>-email]
import dns from 'node:dns/promises';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const DKIM_SELECTORS = ['google', 'selector1', 'selector2', 'k1', 'k2', 'default', 's1', 's2', 'mail', 'dkim',
  'zoho', 'protonmail', 'fm1', 'fm2', 'mxvault', 'smtp', 'everlytickey1', 'mandrill', 'sendgrid', 'amazonses'];
const LOOKUP_TERMS = /^(?:[+~?-])?(include:|a(?::|$)|mx(?::|$)|ptr|exists:|redirect=)/i;

const txt = async (name) => {
  try { return (await dns.resolveTxt(name)).map((parts) => parts.join('')); } catch { return []; }
};

export function analyzeSpf(records) {
  const spf = records.filter((r) => /^v=spf1(\s|$)/i.test(r));
  if (!spf.length) return { status: 'fail', summary: 'No SPF record', fix: 'Add a TXT record at your domain starting "v=spf1" listing the services that send your email (your email provider tells you what to include), ending in "~all" or "-all".' };
  if (spf.length > 1) return { status: 'fail', summary: `${spf.length} SPF records (only one is allowed)`, fix: 'Merge them into a single TXT record; two SPF records make receivers treat SPF as broken.', record: spf.join(' | ') };
  const r = spf[0];
  const terms = r.split(/\s+/).slice(1);
  const lookups = terms.filter((t) => LOOKUP_TERMS.test(t)).length;
  const all = terms.find((t) => /^[+~?-]?all$/i.test(t));
  if (!all || /^\+?all$/i.test(all)) return { status: 'fail', summary: all ? 'SPF ends in "+all", so anyone can send as you' : 'SPF has no "all" ending', fix: 'End the record with "~all" (soft fail) or "-all" (hard fail).', record: r };
  if (lookups > 10) return { status: 'fail', summary: `SPF uses ${lookups} DNS lookups (limit is 10)`, fix: 'Remove services you no longer use, or ask your provider for a flattened include.', record: r };
  if (/^\?all$/i.test(all)) return { status: 'warn', summary: 'SPF ends in "?all" (neutral), which gives no protection', fix: 'Change "?all" to "~all" once you have confirmed every sending service is listed.', record: r };
  return { status: 'pass', summary: `SPF found, ends in "${all}", ${lookups} top-level lookup(s)`, record: r };
}

export function analyzeDmarc(records) {
  const d = records.filter((r) => /^v=DMARC1/i.test(r));
  if (!d.length) return { status: 'fail', summary: 'No DMARC record', fix: 'Add a TXT record at _dmarc.<your domain>: "v=DMARC1; p=none; rua=mailto:<you>@<your domain>". Start with p=none to monitor, then move to quarantine.' };
  if (d.length > 1) return { status: 'fail', summary: 'More than one DMARC record', fix: 'Keep exactly one TXT record at _dmarc.', record: d.join(' | ') };
  const tags = Object.fromEntries(d[0].split(';').map((kv) => kv.trim().split('=').map((s) => s.trim())).filter((x) => x[0]));
  const p = (tags.p || '').toLowerCase();
  if (!['none', 'quarantine', 'reject'].includes(p)) return { status: 'fail', summary: 'DMARC policy (p=) missing or invalid', fix: 'Set p=none, p=quarantine or p=reject.', record: d[0] };
  if (p === 'none') return { status: 'warn', summary: `DMARC is monitoring only (p=none)${tags.rua ? '' : ', with no reports address'}`, fix: `${tags.rua ? '' : 'Add rua=mailto:<address> to receive reports. '}After a few weeks of clean reports, move to p=quarantine so spoofed mail is blocked.`, record: d[0] };
  return { status: 'pass', summary: `DMARC enforced (p=${p})${tags.rua ? ', reports on' : ''}`, record: d[0] };
}

// A usable DKIM key: has a non-empty p= (an empty p= means the key is revoked).
export function isDkimKey(record) {
  return /(^|;)\s*p=[A-Za-z0-9+/=]{20,}/.test(record);
}

export async function checkDomain(domain) {
  const mx = await dns.resolveMx(domain).catch(() => []);
  const spf = analyzeSpf(await txt(domain));
  const dmarc = analyzeDmarc(await txt(`_dmarc.${domain}`));
  const dkimFound = [];
  const wildcard = (await txt(`zz${Date.now().toString(36)}._domainkey.${domain}`)).join('|');
  await Promise.all(DKIM_SELECTORS.map(async (s) => {
    const recs = await txt(`${s}._domainkey.${domain}`);
    if (recs.join('|') !== wildcard && recs.some(isDkimKey)) dkimFound.push(s);
  }));
  const dkim = dkimFound.length
    ? { status: 'pass', summary: `DKIM key found (selector: ${dkimFound.sort().join(', ')})` }
    : { status: 'warn', summary: 'No DKIM key found on common selectors', fix: 'Turn on DKIM signing in your email provider and publish the key it gives you. (If you use an unusual selector, DKIM may already be set up; check your provider.)' };
  const mxr = mx.length
    ? { status: 'pass', summary: `Receives mail via ${mx.sort((a, b) => a.priority - b.priority).map((m) => m.exchange).slice(0, 3).join(', ')}` }
    : { status: 'warn', summary: 'No MX records: this domain cannot receive email', fix: 'If you want replies to this domain, add MX records from your email provider.' };
  const mtasts = (await txt(`_mta-sts.${domain}`)).some((r) => /^v=STSv1/i.test(r));
  const tlsrpt = (await txt(`_smtp._tls.${domain}`)).some((r) => /^v=TLSRPTv1/i.test(r));
  const extras = { status: mtasts && tlsrpt ? 'pass' : 'info', summary: `MTA-STS ${mtasts ? 'on' : 'off'}, TLS reporting ${tlsrpt ? 'on' : 'off'}`, fix: mtasts && tlsrpt ? undefined : 'Optional: MTA-STS forces encrypted delivery to you. Worth adding once SPF, DKIM and DMARC pass.' };
  return { domain, checks: [['Receiving (MX)', mxr], ['SPF', spf], ['DKIM', dkim], ['DMARC', dmarc], ['Transport security', extras]] };
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const LABEL = { pass: 'OK', warn: 'Needs attention', fail: 'Fix now', info: 'Optional' };

export function renderEmailHtml(r, date) {
  const fails = r.checks.filter(([, c]) => c.status === 'fail').length;
  const warns = r.checks.filter(([, c]) => c.status === 'warn').length;
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Email deliverability – ${esc(r.domain)}</title>
<style>body{font:15px/1.5 system-ui,sans-serif;max-width:860px;margin:32px auto;padding:0 16px}.c{border-left:6px solid #999;padding:6px 14px;margin:14px 0}
.pass{border-color:#1a7f37}.warn{border-color:#b7791f}.fail{border-color:#b42318}.info{border-color:#6c757d}.b{font-size:12px;font-weight:700;text-transform:uppercase}
code{background:#f4f4f4;padding:2px 4px;word-break:break-all}.note{background:#fff8e1;padding:10px;font-size:13px}</style></head><body>
<h1>Email deliverability check</h1><p>Domain: <strong>${esc(r.domain)}</strong> · Checked ${esc(date)}</p>
<p><strong>${fails} to fix now, ${warns} needing attention.</strong> Gmail, Yahoo and Microsoft increasingly reject or spam-folder mail from domains without SPF, DKIM and DMARC, which can include your invoices and receipts.</p>
${r.checks.map(([name, c]) => `<div class="c ${c.status}"><div class="b">${LABEL[c.status]}</div><h2 style="margin:4px 0">${esc(name)}</h2><p>${esc(c.summary)}</p>${c.fix ? `<p><strong>What to do:</strong> ${esc(c.fix)}</p>` : ''}${c.record ? `<p>Current record: <code>${esc(c.record)}</code></p>` : ''}</div>`).join('')}
<p class="note">Automated check of public DNS records only; it does not send test email. DKIM is checked on ${DKIM_SELECTORS.length} common selectors. Not a guarantee of inbox placement.</p></body></html>`;
}

async function main() {
  const [domainArg, flag, outArg] = process.argv.slice(2);
  if (!domainArg) throw new Error('Usage: node email-check.mjs <domain> [--out dir]');
  const domain = domainArg.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
  const out = flag === '--out' ? outArg : path.join('reports', `${domain}-email`);
  const r = await checkDomain(domain);
  const html = renderEmailHtml(r, new Date().toISOString().slice(0, 10));
  mkdirSync(out, { recursive: true });
  writeFileSync(path.join(out, 'email.json'), JSON.stringify(r, null, 2));
  writeFileSync(path.join(out, 'email.html'), html);
  const { chromium } = await import('playwright');
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setContent(html);
  await p.pdf({ path: path.join(out, 'email.pdf'), format: 'A4', margin: { top: '15mm', bottom: '15mm' } });
  await b.close();
  console.log(r.checks.map(([n, c]) => `${c.status.toUpperCase().padEnd(4)} ${n}: ${c.summary}`).join('\n') + `\n-> ${out}/email.pdf`);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e.message); process.exit(1); });
