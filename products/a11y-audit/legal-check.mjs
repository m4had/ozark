#!/usr/bin/env node
// Shop legal-information check (wave 2): crawls up to N pages of a UK online shop and looks for the information
// UK law expects sellers to show (trader identity, geographic address, email, returns/cancellation, terms,
// privacy notice, cookie information, delivery info, VAT-inclusive consumer prices). Heuristic, not legal advice.
// Usage: node legal-check.mjs <url> [--pages 15] [--out reports/<host>-legal]
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const POSTCODE = /\b(GIR ?0AA|[A-PR-UWYZ][A-HK-Y]?\d[A-Z\d]? ?\d[ABD-HJLNP-UW-Z]{2})\b/i;
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const COMPANY_NO = /\b(company|registration|registered)\s*(number|no\.?)\s*:?\s*(SC|NI|OC)?\d{6,8}\b/i;
const VAT_NO = /\bGB ?\d{3} ?\d{4} ?\d{2}\b/;
const EX_VAT = /(\+|plus|excl\.?|excluding)\s*VAT\b/i;
const PAGES = {
  returns: /return|refund|cancell?ation/i,
  terms: /terms|conditions/i,
  privacy: /privacy/i,
  cookies: /cookie/i,
  delivery: /delivery|shipping|postage/i,
  contact: /contact/i,
};

export function evaluate({ texts, links }) {
  const all = texts.join('\n');
  const find = (re) => links.find((l) => re.test(l.text) || re.test(l.href));
  const r = [];
  const add = (name, ok, found, fix, level = 'fail') => r.push({ name, status: ok ? 'pass' : level, found, fix });
  add('Geographic address (UK postcode)', POSTCODE.test(all), all.match(POSTCODE)?.[0],
    'Show a full postal address (not just a PO box) where customers can see it, e.g. in the footer or contact page.');
  add('Email address', EMAIL.test(all) || links.some((l) => l.href.startsWith('mailto:')), all.match(EMAIL)?.[0],
    'Show an email address customers can use to contact you quickly.');
  add('Company number (if a limited company)', COMPANY_NO.test(all), all.match(COMPANY_NO)?.[0],
    'Limited companies must show their registered name, number and registered office on their website. Ignore this if you are a sole trader.', 'info');
  add('VAT number (if VAT registered)', VAT_NO.test(all), all.match(VAT_NO)?.[0],
    'If you are VAT registered, show your VAT number. Ignore this if you are not.', 'info');
  for (const [key, re] of Object.entries(PAGES)) {
    const l = find(re);
    const label = { returns: 'Returns / cancellation policy', terms: 'Terms and conditions', privacy: 'Privacy notice',
      cookies: 'Cookie information', delivery: 'Delivery information', contact: 'Contact page' }[key];
    const fixes = {
      returns: 'Explain the 14-day cancellation right for online orders, how to return items and who pays return postage.',
      terms: 'Publish terms of sale covering payment, delivery, cancellation and complaints.',
      privacy: 'Publish a privacy notice saying what personal data you collect, why, and how long you keep it (UK GDPR).',
      cookies: 'Explain which cookies you use and get consent before non-essential ones (PECR).',
      delivery: 'Say where you deliver, how long it takes and what it costs, before checkout.',
      contact: 'Add a contact page with your email and address.',
    };
    add(label, Boolean(l), l ? `${l.text || l.href}` : undefined, fixes[key], key === 'delivery' || key === 'contact' ? 'warn' : 'fail');
  }
  const exVat = all.match(EX_VAT);
  r.push({ name: 'Prices include VAT for consumers', status: exVat ? 'warn' : 'pass', found: exVat?.[0],
    fix: exVat ? 'Prices shown to consumers must include VAT. "+VAT" pricing is only acceptable if you sell only to businesses.' : undefined });
  return r;
}

export async function crawl(start, max, browser) {
  const origin = new URL(start).origin;
  const queue = [start];
  const seen = new Set(queue);
  const texts = [];
  const links = [];
  const ctx = await browser.newContext();
  while (queue.length && texts.length < max) {
    const url = queue.shift();
    const page = await ctx.newPage();
    try {
      const resp = await page.goto(url, { waitUntil: 'load', timeout: 30000 });
      if (!resp?.ok()) continue;
      texts.push(await page.evaluate(() => document.body?.innerText || ''));
      const ls = await page.$$eval('a[href]', (as) => as.map((a) => ({ href: a.href, text: (a.innerText || a.getAttribute('aria-label') || '').trim() })));
      for (const l of ls) {
        links.push(l);
        try {
          const u = new URL(l.href);
          u.hash = '';
          if (u.origin === origin && !seen.has(u.href) && !/\.(pdf|jpe?g|png|zip)$/i.test(u.pathname)) { seen.add(u.href); queue.push(u.href); }
        } catch { /* not a URL */ }
      }
    } catch { /* unreachable page */ } finally { await page.close(); }
  }
  await ctx.close();
  return { texts, links, pages: texts.length };
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const LABEL = { pass: 'Found', warn: 'Check', fail: 'Missing', info: 'If it applies' };

export function renderLegalHtml(url, results, pages, date) {
  const missing = results.filter((r) => r.status === 'fail').length;
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Shop legal-info check – ${esc(url)}</title>
<style>body{font:15px/1.5 system-ui,sans-serif;max-width:860px;margin:32px auto;padding:0 16px}table{border-collapse:collapse;width:100%}
td,th{border-bottom:1px solid #ddd;padding:6px;text-align:left;vertical-align:top;font-size:14px}.pass{color:#1a7f37}.fail{color:#b42318}.warn{color:#9a6300}.info{color:#56666b}
.note{background:#fff8e1;padding:10px;font-size:13px}</style></head><body>
<h1>Shop legal-information check</h1><p>Site: <strong>${esc(url)}</strong> · ${pages} page(s) checked · ${esc(date)}</p>
<p><strong>${missing} item(s) look missing.</strong> UK law (Consumer Contracts Regulations 2013, E-Commerce Regulations 2002, UK GDPR, PECR) expects online sellers to give customers this information.</p>
<table><tr><th>Item</th><th>Result</th><th>What we found / what to do</th></tr>
${results.map((r) => `<tr><td>${esc(r.name)}</td><td class="${r.status}"><strong>${LABEL[r.status]}</strong></td><td>${r.found ? `Found: “${esc(r.found)}”` : ''}${r.fix && r.status !== 'pass' ? `<br>${esc(r.fix)}` : ''}</td></tr>`).join('')}</table>
<p class="note">Automated check that looks for common wording and links. It can miss information shown in images or unusual wording, and it doesn't judge whether your policies are legally adequate. Not legal advice.</p></body></html>`;
}

async function main() {
  const a = process.argv.slice(2);
  const url = a[0];
  if (!url) throw new Error('Usage: node legal-check.mjs <url> [--pages N] [--out dir]');
  const max = a.includes('--pages') ? Number(a[a.indexOf('--pages') + 1]) : 15;
  const out = a.includes('--out') ? a[a.indexOf('--out') + 1] : path.join('reports', `${new URL(url).host}-legal`);
  const browser = await chromium.launch();
  try {
    const c = await crawl(new URL(url).href, max, browser);
    const results = evaluate(c);
    const html = renderLegalHtml(url, results, c.pages, new Date().toISOString().slice(0, 10));
    mkdirSync(out, { recursive: true });
    writeFileSync(path.join(out, 'legal.json'), JSON.stringify({ url, pages: c.pages, results }, null, 2));
    writeFileSync(path.join(out, 'legal.html'), html);
    const p = await browser.newPage();
    await p.setContent(html);
    await p.pdf({ path: path.join(out, 'legal.pdf'), format: 'A4', margin: { top: '15mm', bottom: '15mm' } });
    console.log(results.map((r) => `${r.status.padEnd(4)} ${r.name}`).join('\n') + `\n-> ${out}/legal.pdf`);
  } finally { await browser.close(); }
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e.message); process.exit(1); });
