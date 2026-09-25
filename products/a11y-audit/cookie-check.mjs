#!/usr/bin/env node
// Cookie consent check (idea #13): loads a page as a first-time visitor who has NOT clicked any consent banner,
// and lists the cookies and tracking requests that happen anyway. Under UK PECR, non-essential cookies
// (analytics, advertising) need consent first. This shows the pre-consent state only; it is not legal advice.
//
// Usage: node cookie-check.mjs <url> [--out reports/<host>-cookies]
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

// Well-known non-essential cookies/hosts. Unknown ones are reported as "check purpose".
const KNOWN_COOKIES = [
  [/^_ga($|_)|^_gid$|^_gat/, 'Google Analytics', 'analytics'],
  [/^_fbp$|^fr$/, 'Meta (Facebook) Pixel', 'advertising'],
  [/^_gcl_/, 'Google Ads conversion', 'advertising'],
  [/^_hj/, 'Hotjar', 'analytics'],
  [/^_clck$|^_clsk$|^MUID$/, 'Microsoft Clarity / Ads', 'analytics'],
  [/^_ttp$|^_tt_/, 'TikTok Pixel', 'advertising'],
  [/^_pin_unauth$|^_pinterest/, 'Pinterest tag', 'advertising'],
  [/^li_|^bcookie$|^lidc$/, 'LinkedIn', 'advertising'],
  [/^IDE$|^test_cookie$|^DSID$/, 'Google DoubleClick', 'advertising'],
  [/^PHPSESSID$|^JSESSIONID$|^ASP\.NET_SessionId$|^csrftoken$|^XSRF-TOKEN$|^__cf_bm$|^cart|^_shopify_s$|^secure_customer_sig$/,
    'Session / security / basket', 'likely essential'],
];
const TRACKER_HOSTS = [
  [/google-analytics\.com|googletagmanager\.com/, 'Google Analytics / Tag Manager'],
  [/doubleclick\.net|googleadservices\.com/, 'Google Ads'],
  [/connect\.facebook\.net|facebook\.com\/tr/, 'Meta Pixel'],
  [/hotjar\.com/, 'Hotjar'], [/clarity\.ms|bat\.bing\.com/, 'Microsoft Clarity / Ads'],
  [/analytics\.tiktok\.com/, 'TikTok Pixel'], [/snap\.licdn\.com|px\.ads\.linkedin\.com/, 'LinkedIn Insight'],
];

export function classifyCookie(name) {
  for (const [re, vendor, purpose] of KNOWN_COOKIES) if (re.test(name)) return { vendor, purpose };
  return { vendor: 'Unknown', purpose: 'check purpose' };
}

export async function checkCookies(url, browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const trackers = new Map();
  page.on('request', (req) => {
    for (const [re, name] of TRACKER_HOSTS) if (re.test(req.url())) trackers.set(name, req.url().slice(0, 120));
  });
  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(3000); // let tag managers fire
  const cookies = (await context.cookies()).map((c) => ({ name: c.name, domain: c.domain, ...classifyCookie(c.name),
    expires: c.expires > 0 ? new Date(c.expires * 1000).toISOString().slice(0, 10) : 'session' }));
  await context.close();
  const nonEssential = cookies.filter((c) => c.purpose === 'analytics' || c.purpose === 'advertising');
  return { url, cookies, nonEssential, trackers: [...trackers].map(([name, sample]) => ({ name, sample })) };
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function renderCookieHtml(r, date) {
  const verdict = r.nonEssential.length || r.trackers.length
    ? `<p class="bad"><strong>${r.nonEssential.length} analytics/advertising cookie(s) and ${r.trackers.length} tracking service(s)</strong> were active before any consent was given. Under PECR these normally need the visitor's consent first.</p>`
    : '<p class="good"><strong>No known analytics or advertising cookies or trackers</strong> were set before consent on this page.</p>';
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Cookie check – ${esc(r.url)}</title>
<style>body{font:15px/1.5 system-ui,sans-serif;max-width:900px;margin:32px auto;padding:0 16px}table{border-collapse:collapse;width:100%}
td,th{border-bottom:1px solid #ddd;padding:5px;text-align:left;font-size:13px}.bad{background:#fdecea;padding:10px}.good{background:#e8f5e9;padding:10px}
.note{background:#fff8e1;padding:10px;font-size:13px}</style></head><body>
<h1>Cookie consent check</h1><p>Page: <strong>${esc(r.url)}</strong> · Checked ${esc(date)} as a first-time visitor who has not clicked any cookie banner.</p>
${verdict}
<h2>Cookies present before consent</h2><table><tr><th>Name</th><th>Set by (domain)</th><th>Likely vendor</th><th>Purpose</th><th>Expires</th></tr>
${r.cookies.map((c) => `<tr><td>${esc(c.name)}</td><td>${esc(c.domain)}</td><td>${esc(c.vendor)}</td><td>${esc(c.purpose)}</td><td>${esc(c.expires)}</td></tr>`).join('') || '<tr><td colspan="5">None</td></tr>'}</table>
<h2>Tracking services contacted before consent</h2><ul>${r.trackers.map((t) => `<li>${esc(t.name)}</li>`).join('') || '<li>None detected</li>'}</ul>
<h2>How to fix</h2><p>Configure your cookie banner or tag manager so analytics and advertising tags only load <em>after</em> the visitor accepts (e.g. Google Consent Mode set to "denied" by default, or tag triggers tied to consent). Essential cookies (session, security, basket) do not need consent.</p>
<p class="note">Automated check of one page's state before consent. It classifies cookies by well-known names and may miss custom or renamed trackers. It is not legal advice or a compliance certificate. See ico.org.uk guidance on cookies and similar technologies.</p>
</body></html>`;
}

async function main() {
  const [url, flag, outArg] = process.argv.slice(2);
  if (!url) throw new Error('Usage: node cookie-check.mjs <url> [--out dir]');
  const out = flag === '--out' ? outArg : path.join('reports', `${new URL(url).host}-cookies`);
  const browser = await chromium.launch();
  try {
    const r = await checkCookies(new URL(url).href, browser);
    const html = renderCookieHtml(r, new Date().toISOString().slice(0, 10));
    mkdirSync(out, { recursive: true });
    writeFileSync(path.join(out, 'cookies.json'), JSON.stringify(r, null, 2));
    writeFileSync(path.join(out, 'cookies.html'), html);
    const p = await browser.newPage();
    await p.setContent(html);
    await p.pdf({ path: path.join(out, 'cookies.pdf'), format: 'A4', margin: { top: '15mm', bottom: '15mm' } });
    console.log(`${r.cookies.length} cookie(s), ${r.nonEssential.length} non-essential, ${r.trackers.length} tracker(s) -> ${out}/cookies.pdf`);
  } finally {
    await browser.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e.message); process.exit(1); });
