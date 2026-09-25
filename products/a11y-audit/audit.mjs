#!/usr/bin/env node
// Automated accessibility audit: crawls up to N same-site pages, runs axe-core (WCAG 2.0/2.1/2.2 A & AA rules)
// and writes a plain-English HTML + PDF report.
//
// Usage: node audit.mjs <url> [--pages 10] [--out reports/<host>] [--client "Client name"]
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { chromium } from 'playwright';
import { explain } from './explanations.mjs';

const require = createRequire(import.meta.url);
const AXE_SOURCE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const AXE_VERSION = require('axe-core/package.json').version;
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const IMPACT_ORDER = ['critical', 'serious', 'moderate', 'minor'];
const SKIP_EXT = /\.(pdf|jpe?g|png|gif|svg|webp|zip|docx?|xlsx?|pptx?|mp[34]|mov|avi)$/i;

function parseArgs(argv) {
  const args = { pages: 10, out: null, client: '' };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--pages') args.pages = Number(argv[++i]);
    else if (argv[i] === '--out') args.out = argv[++i];
    else if (argv[i] === '--client') args.client = argv[++i];
    else rest.push(argv[i]);
  }
  if (!rest[0]) throw new Error('Usage: node audit.mjs <url> [--pages N] [--out dir] [--client name]');
  args.url = new URL(rest[0]).href;
  args.out ??= path.join('reports', new URL(args.url).host.replace(/[^a-z0-9.-]/gi, '_'));
  return args;
}

function normalise(href, base) {
  try {
    const u = new URL(href, base);
    u.hash = '';
    return u;
  } catch {
    return null;
  }
}

export async function crawlAndAudit(startUrl, maxPages, browser) {
  const origin = new URL(startUrl).origin;
  const queue = [startUrl];
  const seen = new Set(queue);
  const pages = [];
  const context = await browser.newContext({ userAgent: 'a11y-audit (+accessibility report requested by site owner)' });
  while (queue.length && pages.length < maxPages) {
    const url = queue.shift();
    const page = await context.newPage();
    try {
      const resp = await page.goto(url, { waitUntil: 'load', timeout: 30000 });
      if (!resp || !resp.ok() || !(resp.headers()['content-type'] || '').includes('text/html')) continue;
      await page.addScriptTag({ content: AXE_SOURCE });
      const result = await page.evaluate(
        (tags) => window.axe.run(document, { runOnly: { type: 'tag', values: tags }, resultTypes: ['violations'] }),
        WCAG_TAGS,
      );
      pages.push({ url, title: await page.title(), violations: result.violations });
      const links = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')));
      for (const href of links) {
        const u = normalise(href, url);
        if (!u || u.origin !== origin || SKIP_EXT.test(u.pathname) || seen.has(u.href)) continue;
        seen.add(u.href);
        queue.push(u.href);
      }
    } catch (err) {
      pages.push({ url, title: '', error: String(err.message || err).split('\n')[0], violations: [] });
    } finally {
      await page.close();
    }
  }
  await context.close();
  return pages;
}

export function summarise(pages) {
  const byRule = new Map();
  for (const p of pages) {
    for (const v of p.violations) {
      const r = byRule.get(v.id) ?? { id: v.id, impact: v.impact, help: v.help, helpUrl: v.helpUrl,
        tags: v.tags.filter((t) => /^wcag\d/.test(t)), pages: [], count: 0, examples: [] };
      r.pages.push(p.url);
      r.count += v.nodes.length;
      for (const n of v.nodes) {
        if (r.examples.length < 3) r.examples.push({ page: p.url, target: n.target.join(' '), html: n.html.slice(0, 200) });
      }
      byRule.set(v.id, r);
    }
  }
  return [...byRule.values()].sort((a, b) =>
    IMPACT_ORDER.indexOf(a.impact) - IMPACT_ORDER.indexOf(b.impact) || b.count - a.count);
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function wcagRefs(tags) {
  // axe tags like "wcag143" -> success criterion 1.4.3
  return tags.filter((t) => /^wcag\d{3,4}$/.test(t)).map((t) => {
    const d = t.slice(4);
    return `${d[0]}.${d[1]}.${d.slice(2)}`;
  });
}

export function renderHtml({ url, client, pages, issues, date }) {
  const counts = Object.fromEntries(IMPACT_ORDER.map((i) => [i, issues.filter((x) => x.impact === i).length]));
  const totalNodes = issues.reduce((n, i) => n + i.count, 0);
  const issueHtml = issues.map((i, n) => {
    const e = explain(i.id, i.help);
    return `<section class="issue ${esc(i.impact)}">
  <h3>${n + 1}. ${esc(e.title)} <span class="badge">${esc(i.impact)}</span></h3>
  <p class="meta">${i.count} instance(s) on ${i.pages.length} page(s) · WCAG ${esc(wcagRefs(i.tags).join(', ') || 'n/a')} · rule <code>${esc(i.id)}</code></p>
  <p><strong>Why it matters:</strong> ${esc(e.why)}</p>
  <p><strong>How to fix:</strong> ${esc(e.fix)}</p>
  <details open><summary>Examples</summary><ul>${i.examples.map((x) =>
    `<li><code>${esc(x.target)}</code> on ${esc(x.page)}<pre>${esc(x.html)}</pre></li>`).join('')}</ul></details>
  <p class="more">Technical reference: ${esc(i.helpUrl)}</p>
</section>`;
  }).join('\n');
  const pageRows = pages.map((p) => `<tr><td>${esc(p.url)}</td><td>${p.error ? 'Could not load: ' + esc(p.error)
    : p.violations.length}</td></tr>`).join('');
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Accessibility report – ${esc(url)}</title>
<style>
body{font:15px/1.5 system-ui,sans-serif;color:#1a1a1a;max-width:900px;margin:32px auto;padding:0 16px}
h1{font-size:26px;margin-bottom:4px}h2{margin-top:32px;border-bottom:2px solid #1f4e78}
.summary{display:flex;gap:12px;flex-wrap:wrap}.tile{border:1px solid #ccc;border-radius:6px;padding:8px 14px;min-width:110px}
.tile b{display:block;font-size:24px}.issue{border-left:6px solid #999;padding:4px 14px;margin:18px 0;page-break-inside:avoid}
.critical{border-color:#a50e0e}.serious{border-color:#d9480f}.moderate{border-color:#e0a800}.minor{border-color:#6c757d}
.badge{font-size:12px;text-transform:uppercase;background:#eee;padding:2px 6px;border-radius:4px}
.meta,.more{color:#555;font-size:13px}pre{white-space:pre-wrap;background:#f6f6f6;padding:6px;font-size:12px}
.note{background:#fff8e1;border:1px solid #e0c060;padding:10px 14px}table{border-collapse:collapse;width:100%}
td{border-bottom:1px solid #ddd;padding:4px 6px;font-size:13px;word-break:break-all}
</style></head><body>
<h1>Accessibility report</h1>
<p>${client ? `Prepared for <strong>${esc(client)}</strong> · ` : ''}Site: <strong>${esc(url)}</strong> · Scanned ${esc(date)} · ${pages.length} page(s)</p>
<div class="note"><strong>Please read:</strong> This is an automated scan against WCAG 2.2 level A and AA rules using
axe-core ${esc(AXE_VERSION)}. Automated tools reliably detect only part of the accessibility barriers on a site
(commonly estimated at 30–40%). Issues such as keyboard traps, meaningful alt text, and whether content makes sense to
screen-reader users need manual testing. This report is <strong>not</strong> a certificate of WCAG or European
Accessibility Act conformance.</div>
<h2>Summary</h2>
<div class="summary">
${IMPACT_ORDER.map((i) => `<div class="tile ${i}"><b>${counts[i]}</b>${i} issue types</div>`).join('')}
<div class="tile"><b>${totalNodes}</b>total instances</div></div>
<p>Issues are listed most severe first. Fixing the <em>critical</em> and <em>serious</em> items removes the biggest barriers for disabled visitors.</p>
<h2>Issues and how to fix them</h2>
${issueHtml || '<p>No automatically detectable WCAG A/AA failures were found on the scanned pages. Manual testing is still recommended.</p>'}
<h2>Pages scanned</h2><table><tr><th>Page</th><th>Issue types</th></tr>${pageRows}</table>
</body></html>`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const browser = await chromium.launch();
  try {
    const pages = await crawlAndAudit(args.url, args.pages, browser);
    const issues = summarise(pages);
    const date = new Date().toISOString().slice(0, 10);
    const html = renderHtml({ url: args.url, client: args.client, pages, issues, date });
    mkdirSync(args.out, { recursive: true });
    writeFileSync(path.join(args.out, 'results.json'), JSON.stringify({ url: args.url, date, pages, issues }, null, 2));
    writeFileSync(path.join(args.out, 'report.html'), html);
    const pdfPage = await browser.newPage();
    await pdfPage.setContent(html, { waitUntil: 'load' });
    await pdfPage.pdf({ path: path.join(args.out, 'report.pdf'), format: 'A4', margin: { top: '15mm', bottom: '15mm' } });
    console.log(`${pages.length} page(s), ${issues.length} issue type(s) -> ${args.out}/report.pdf`);
  } finally {
    await browser.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
