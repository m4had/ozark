#!/usr/bin/env node
// Builds the printable PDFs: #3 UK small-business year planner 2026-27 and #5 AI prompt pack for UK sole traders.
// Usage: node products/printables/build.mjs   (uses Playwright from products/a11y-audit)
import path from 'node:path';
import { chromium } from '../a11y-audit/node_modules/playwright/index.mjs';

const DIST = path.resolve(import.meta.dirname, '../../dist');
const CSS = `body{font:12pt/1.45 system-ui,sans-serif;color:#1a1a1a;margin:0}section{page-break-after:always;padding:4mm}
h1{font-size:26pt;margin:0 0 4mm}h2{font-size:17pt;border-bottom:2px solid #1f4e78;margin:0 0 4mm}
table{border-collapse:collapse;width:100%}td,th{border:1px solid #bbb;padding:3mm;vertical-align:top;font-size:10pt}
.cal td{height:17mm;width:14.28%}.dates li{margin:1.5mm 0}.muted{color:#666;font-size:9pt}
.prompt{border-left:4px solid #1f4e78;background:#f4f7fb;padding:3mm 4mm;margin:3mm 0;font-family:ui-monospace,monospace;font-size:10pt;white-space:pre-wrap}`;

// Key dates, tax year 2026-27 (checked against gov.uk 2026-09-25).
const KEY_DATES = {
  '2026-04': ['6 Apr: tax year 2026-27 starts; MTD for Income Tax applies if qualifying income > £50k'],
  '2026-05': ['31 May: give employees P60s'],
  '2026-07': ['6 Jul: P11D deadline (benefits in kind)', '31 Jul: 2nd payment on account for 2025-26'],
  '2026-08': ['7 Aug: MTD quarterly update 1'],
  '2026-10': ['5 Oct: register for Self Assessment if you started trading in 2025-26'],
  '2026-11': ['7 Nov: MTD quarterly update 2'],
  '2027-01': ['31 Jan: 2025-26 Self Assessment return + balancing payment + 1st payment on account for 2026-27'],
  '2027-02': ['7 Feb: MTD quarterly update 3'],
  '2027-04': ['5 Apr: tax year ends; check pension/ISA contributions', '6 Apr: MTD extends to qualifying income > £30k'],
  '2027-05': ['7 May: MTD quarterly update 4'],
};

function monthPage(y, m) {
  const first = new Date(Date.UTC(y, m, 1));
  const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7; // Monday first
  const cells = [...Array(lead).fill(''), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push('');
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(`<tr>${cells.slice(i, i + 7).map((d) => `<td>${d}</td>`).join('')}</tr>`);
  const key = `${y}-${String(m + 1).padStart(2, '0')}`;
  const title = first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  return `<section><h2>${title}</h2><table class="cal"><tr>${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => `<th>${d}</th>`).join('')}</tr>${rows.join('')}</table>
<h3>Key dates</h3><ul class="dates">${(KEY_DATES[key] ?? ['No fixed HMRC dates. Good month to catch up on records.']).map((d) => `<li>${d}</li>`).join('')}</ul>
<h3>Goals &amp; notes</h3><table><tr><td style="height:32mm"></td></tr></table></section>`;
}

function planner() {
  const months = [];
  for (let i = 0; i < 14; i++) months.push(monthPage(2026 + Math.floor((3 + i) / 12), (3 + i) % 12));
  return `<section><h1>UK Small Business Year Planner</h1><p>Tax year 2026-27 (April 2026 – May 2027)</p>
<h2>All key dates</h2><ul class="dates">${Object.values(KEY_DATES).flat().map((d) => `<li>${d}</li>`).join('')}</ul>
<p class="muted">VAT returns (if registered) are due 1 month and 7 days after each VAT period ends. Payroll (RTI) payments are due by the 22nd of each month when paid electronically. Dates checked against gov.uk on 25 September 2026. Not tax advice.</p></section>${months.join('')}`;
}

const PROMPTS = [
  ['Getting paid', [
    ['Polite payment chaser', 'Write a friendly but firm email to [customer] about invoice [number] for £[amount], which was due on [date]. Remind them of my [X]-day terms and ask for payment by [date]. Keep it under 120 words and UK English.'],
    ['Final reminder before late-payment interest', 'Draft a final reminder for overdue business invoice [number]. Mention that under the Late Payment of Commercial Debts (Interest) Act I may claim statutory interest and fixed compensation if it is not paid by [date]. Professional tone, no threats.'],
    ['Quote follow-up', 'I sent a quote for [job] to [customer] on [date] and have heard nothing. Write a short follow-up that answers the likely objection "[price/timing]" and offers a quick call.'],
  ]],
  ['Winning work', [
    ['Explain my service simply', 'I am a [trade] in [town]. Rewrite this description of what I do so a customer with no technical knowledge understands it in 3 sentences: [paste description].'],
    ['Google Business Profile post', 'Write a 100-word Google Business Profile update about [recent job / seasonal offer] for my [trade] business in [area]. Include one clear call to action. No hashtags, no exaggerated claims.'],
    ['Reply to a genuine review', 'Draft a reply to this customer review of my business. Thank them, mention the specific job, and keep it under 60 words: [paste review]. If the review is negative, acknowledge it calmly and offer to talk offline.'],
    ['Website "About" page', 'Write an About page for my [business] using these facts only: [years trading, qualifications, areas covered, what customers say]. Do not invent anything. 150 words, warm and plain.'],
  ]],
  ['Admin and records', [
    ['Categorise expenses', 'Here is a list of my business expenses. Put each into one of HMRC\'s self-employment expense categories and flag anything that may be partly personal: [paste list without card numbers].'],
    ['Month-end checklist', 'Create a 10-point month-end admin checklist for a sole trader who [invoices customers / sells online / employs 1 person]. Order it by what takes least time first.'],
    ['Terms and conditions starter', 'List the topics my [service] terms and conditions should cover (payment, cancellations, liability, etc.) with one plain-English sentence for each. I will have them checked before using them.'],
    ['Email templates', 'Write 5 short email templates for my [business]: booking confirmation, reschedule, running late, job complete, and asking for a review.'],
  ]],
  ['Thinking and planning', [
    ['Price check', 'I charge £[rate] per [hour/job] as a [trade] in [area]. My costs are about £[costs] a month and I want to earn £[target] a year working [days] days a week. Show the calculation for the minimum rate I need.'],
    ['Pros and cons', 'I am deciding whether to [hire help / buy a van / raise prices]. Ask me 5 questions first, then give a balanced list of pros, cons and risks based on my answers.'],
    ['Plain-English explainer', 'Explain [Making Tax Digital / VAT Flat Rate Scheme / payments on account] to a sole trader in plain English in under 200 words, then list what I should check on gov.uk.'],
    ['Tricky customer message', 'A customer sent this: [paste]. Help me write a calm reply that [keeps the relationship / sets a boundary / declines the extra work]. Offer two versions: short and detailed.'],
  ]],
];

function promptPack() {
  const sections = PROMPTS.map(([title, items]) => `<section><h2>${title}</h2>${items.map(([name, p]) =>
    `<h3>${name}</h3><div class="prompt">${p.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</div>`).join('')}</section>`);
  return `<section><h1>15 AI Prompts for UK Sole Traders</h1>
<p>Copy-and-paste prompts for ChatGPT, Claude, Gemini and other AI assistants that save time on everyday admin, marketing and getting paid. Replace anything in [square brackets].</p>
<h2>Use AI safely</h2><ul class="dates">
<li>Don't paste customers' personal details, bank details or passwords into AI tools. Use first names or "the customer".</li>
<li>Check every figure and any legal or tax statement against gov.uk before relying on it.</li>
<li>Never use AI to write fake reviews or testimonials. It's illegal in the UK (Digital Markets, Competition and Consumers Act 2024).</li>
<li>Read the output before sending. You're responsible for what goes out under your name.</li></ul>
<p class="muted">Prompts written with AI assistance and tested by a person. September 2026.</p></section>${sections.join('')}`;
}

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [file, body] of [['UK_Small_Business_Year_Planner_2026-27.pdf', planner()], ['AI_Prompts_for_UK_Sole_Traders.pdf', promptPack()]]) {
  await page.setContent(`<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><style>${CSS}</style></head><body>${body}</body></html>`);
  await page.pdf({ path: path.join(DIST, file), format: 'A4', margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' } });
  console.log(path.join(DIST, file));
}
await browser.close();
