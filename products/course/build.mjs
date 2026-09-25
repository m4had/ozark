#!/usr/bin/env node
// Builds the written edition of the MTD course (idea #6) as a PDF, so it can sell without recorded videos.
// Usage: node products/course/build.mjs   (uses Playwright from products/a11y-audit)
import path from 'node:path';
import { chromium } from '../a11y-audit/node_modules/playwright/index.mjs';

const OUT = path.resolve(import.meta.dirname, '../../dist/MTD_for_Sole_Traders_Course_Written_Edition.pdf');

const LESSONS = [
  ['Does Making Tax Digital apply to me?', `
<p>Making Tax Digital for Income Tax (MTD) changes <em>how</em> you report self-employment and property income to HMRC. It does not change how much tax you pay.</p>
<h3>The test: qualifying income</h3>
<p>Add up your gross self-employment income and your gross property income. Use turnover before expenses, not profit. HMRC uses the figure from an earlier Self Assessment return:</p>
<table><tr><th>Qualifying income</th><th>MTD applies from</th><th>Based on your return for</th></tr>
<tr><td>Over £50,000</td><td>6 April 2026</td><td>2024-25</td></tr>
<tr><td>Over £30,000</td><td>6 April 2027</td><td>2025-26</td></tr>
<tr><td>Over £20,000</td><td>6 April 2028</td><td>2026-27</td></tr></table>
<p><strong>Example.</strong> Sam earns £38,000 from a cleaning business and £16,000 rent from a flat. Qualifying income is £54,000, so MTD applied from April 2026 even though Sam's profit is much lower.</p>
<h3>Who is outside it (for now)</h3>
<ul><li>People whose only income is employment (PAYE) or pensions</li><li>Income received through a partnership (not yet in scope)</li>
<li>People HMRC accepts as <em>digitally excluded</em>, for example because of age, disability or location. You apply for this exemption.</li></ul>
<p><strong>Action:</strong> use the "Check if you're eligible" tool on gov.uk and keep a note of the result.</p>`],
  ['What MTD actually asks you to do', `
<ol><li><strong>Keep digital records.</strong> Record each income and expense transaction (date, amount, category) in software or a spreadsheet.</li>
<li><strong>Send a quarterly update.</strong> Four times a year, send HMRC your totals by category. Updates are <em>cumulative</em>: each one covers the tax year so far.</li>
<li><strong>Make a final declaration</strong> by 31 January after the tax year ends. This replaces the Self Assessment return for that income.</li></ol>
<h3>2026-27 deadlines</h3>
<table><tr><th>Update</th><th>Covers (standard quarters)</th><th>Due</th></tr>
<tr><td>1</td><td>6 Apr – 5 Jul 2026</td><td>7 Aug 2026</td></tr><tr><td>2</td><td>to 5 Oct 2026</td><td>7 Nov 2026</td></tr>
<tr><td>3</td><td>to 5 Jan 2027</td><td>7 Feb 2027</td></tr><tr><td>4</td><td>to 5 Apr 2027</td><td>7 May 2027</td></tr>
<tr><td>Final declaration</td><td>Whole year</td><td>31 Jan 2028</td></tr></table>
<p>You can instead choose <em>calendar quarters</em> (1 Apr, 1 Jul, 1 Oct, 1 Jan). The deadlines are the same.</p>
<h3>Myths</h3><ul><li><strong>"I pay tax every quarter."</strong> No. Payment dates (31 January, 31 July) are unchanged.</li>
<li><strong>"A mistake in an update means a penalty."</strong> No. Because updates are cumulative, the next one corrects it.</li>
<li><strong>"I must buy expensive software."</strong> No. A spreadsheet plus HMRC-recognised bridging software is allowed.</li></ul>
<p>Late updates earn penalty points, and a fine applies once you reach the threshold. See gov.uk for the current rules.</p>`],
  ['Choosing software', `
<p>You need HMRC-recognised software to <em>send</em> updates. There are two routes:</p>
<table><tr><th></th><th>All-in-one app</th><th>Spreadsheet + bridging software</th></tr>
<tr><td>Cost</td><td>Monthly subscription</td><td>Often lower; some bridging tools are free for simple cases</td></tr>
<tr><td>Bank feeds</td><td>Usually yes</td><td>No; you enter or paste transactions</td></tr>
<tr><td>Learning curve</td><td>New app to learn</td><td>Stays in the spreadsheet you know</td></tr>
<tr><td>Best for</td><td>Many transactions or several businesses</td><td>Simple businesses with modest volumes</td></tr></table>
<p>Find the official list by searching gov.uk for "find software that works with Making Tax Digital for Income Tax". Filter by what you need, e.g. self-employment, property income or bridging. Check that the product supports the <em>final declaration</em> too, not just quarterly updates.</p>`],
  ['Setting up your records', `
<p>Whichever route you choose, set your records up once and properly:</p>
<ul><li><strong>Separate bank account</strong> for the business. It's not legally required for sole traders, but it halves your admin.</li>
<li><strong>Categories.</strong> Use HMRC's expense headings (cost of goods, car/van/travel, premises, repairs, office, advertising, professional fees, and so on) so your totals map straight into the update.</li>
<li><strong>Private use.</strong> For mixed costs such as a phone, record the full amount and the private part. Only the business part is claimed.</li>
<li><strong>Simplified expenses</strong> (optional):
<ul><li>Mileage: 45p per mile for the first 10,000 business miles, then 25p. If you use mileage for a vehicle, you can't also claim that vehicle's actual running costs.</li>
<li>Use of home: a flat rate of £10, £18 or £26 a month for 25–50, 51–100 or 101+ hours of business work at home.</li></ul></li>
<li><strong>Keep evidence</strong> (receipts, invoices, bank statements) for at least 5 years after the 31 January submission deadline.</li></ul>
<p>The MTD Ready workbook (sold separately) has all of this built in.</p>`],
  ['Your first quarterly update, step by step', `
<ol><li>Check every transaction for the period is entered. Compare against your bank statement.</li>
<li>Check categories, especially anything in "other expenses" that belongs elsewhere.</li>
<li>Read the year-to-date totals for each category.</li>
<li>Open your MTD software (or bridging tool), link it to your spreadsheet if you're bridging, and check the figures it has picked up.</li>
<li>Submit, and save the confirmation reference with your records.</li></ol>
<p><strong>Found a mistake after submitting?</strong> Correct your records. The next cumulative update carries the correct year-to-date figures. After the fourth update, fix remaining errors in the final declaration.</p>`],
  ['A 20-minute monthly routine', `
<ol><li><strong>5 min:</strong> download or view last month's business bank transactions.</li>
<li><strong>10 min:</strong> enter or paste them, and categorise. Mark any private-use portions.</li>
<li><strong>3 min:</strong> file receipts in one folder per month (photos are fine).</li>
<li><strong>2 min:</strong> add business mileage and home-working hours, and check the deadline countdown.</li></ol>
<p>Twelve short sessions a year beat four stressful ones.</p>
<h3>Getting help</h3><ul><li>HMRC's Self Assessment helpline and online guidance (search gov.uk for "Making Tax Digital for Income Tax")</li>
<li>An accountant or tax adviser. Check they are supervised for anti-money-laundering purposes (ask which body supervises them).</li></ul>`],
];

const CSS = `body{font:11.5pt/1.55 system-ui,sans-serif;color:#1a1a1a}section{page-break-after:always}h1{font-size:26pt;margin:0 0 6mm}
h2{font-size:18pt;border-bottom:2px solid #1f4e78;padding-bottom:2mm}h3{margin-top:5mm}table{border-collapse:collapse;width:100%;margin:3mm 0}
td,th{border:1px solid #bbb;padding:2mm 3mm;text-align:left;vertical-align:top}.muted{color:#666;font-size:9.5pt}`;

const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><style>${CSS}</style></head><body>
<section><h1>Making Tax Digital for Sole Traders</h1><p style="font-size:15pt">Set up in an afternoon – written course, 2026-27 edition</p>
<h2>Contents</h2><ol>${LESSONS.map(([t]) => `<li>${t}</li>`).join('')}</ol>
<p class="muted">General information for sole traders and landlords in the UK. It is not tax advice; check gov.uk or an accountant for your situation. Facts checked against gov.uk on 25 September 2026. Written with AI assistance and reviewed by a person.</p></section>
${LESSONS.map(([t, body], i) => `<section><h2>Lesson ${i + 1}: ${t}</h2>${body}</section>`).join('')}
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html);
await page.pdf({ path: OUT, format: 'A4', margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' } });
await browser.close();
console.log(OUT);
