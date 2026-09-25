#!/usr/bin/env node
// Wave 3 PDFs: (1) First-let landlord pack for England: checklist + room-by-room inventory (W096, W097);
// (2) DMCC Act guide for small online shops: fake reviews, drip pricing, penalties (W113, W114, W115).
// Facts checked 2026-09-25 against gov.uk, legislation.gov.uk and CMA guidance.
// Usage: node products/guides-pdf/build.mjs
import path from 'node:path';
import { chromium } from '../a11y-audit/node_modules/playwright/index.mjs';

const DIST = path.resolve(import.meta.dirname, '../../dist');
const CSS = `body{font:11pt/1.5 system-ui,sans-serif;color:#1a1a1a}section{page-break-after:always}h1{font-size:24pt;margin:0 0 4mm}
h2{font-size:16pt;border-bottom:2px solid #375623;padding-bottom:2mm;margin-top:6mm}ul.check{list-style:none;padding:0}
ul.check li{padding:1.5mm 0 1.5mm 8mm;position:relative;border-bottom:1px solid #eee}ul.check li:before{content:"☐";position:absolute;left:0}
table{border-collapse:collapse;width:100%;margin:2mm 0}td,th{border:1px solid #999;padding:2mm;text-align:left;vertical-align:top;font-size:10pt}
td.blank{height:10mm}.muted{color:#555;font-size:9pt}`;

const check = (items) => `<ul class="check">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;

const landlord = `
<section><h1>First-Let Landlord Pack (England)</h1><p style="font-size:14pt">Checklist and inventory for letting a property, 2026 edition</p>
<p class="muted">Reflects the Renters' Rights Act changes in force from 1 May 2026. A record-keeping aid, not legal advice; rules differ in Wales, Scotland and Northern Ireland. Checked against gov.uk on 25 September 2026. Written with AI assistance and checked by a person.</p>
<h2>1. Before you advertise</h2>${check([
  'Mortgage lender has consented to letting (or you have a buy-to-let mortgage)',
  'Landlord insurance in place (buildings, and contents if furnished)',
  'Council licensing checked: mandatory HMO, additional or selective licence where you are',
  'Energy Performance Certificate valid and rated E or above (or a registered exemption)',
  'Gas Safety Record from a Gas Safe engineer (within the last 12 months)',
  'Electrical Installation Condition Report (EICR) within the last 5 years, with remedial work done',
  'Smoke alarm on every storey; CO alarm in every room with a fixed combustion appliance (not gas cookers)',
  'Legionella risk assessed; furniture meets fire-safety labelling if furnished',
  'Advert states a rent, and you will not invite or accept offers above it (no rental bidding)',
  'You will not refuse tenants because they have children or receive benefits'])}
<h2>2. Choosing a tenant</h2>${check([
  'Right to Rent checks done for all adults before the tenancy starts (keep copies)',
  'Holding deposit no more than 1 week\'s rent (Tenant Fees Act 2019)',
  'No banned fees charged (only rent, capped deposits and permitted payments)',
  'You will not ask for rent in advance beyond what the Renters\' Rights Act allows (check gov.uk before taking any)'])}
</section>
<section><h2>3. Before move-in day</h2>${check([
  'Written statement of tenancy terms given before the tenancy starts (assured periodic tenancy)',
  'Tenancy deposit no more than 5 weeks\' rent (annual rent under £50,000)',
  'Deposit protected in a government-approved scheme within 30 days, and prescribed information given',
  'Copies given to the tenant: Gas Safety Record, EPC, EICR, and any other documents gov.uk currently requires',
  'Inventory completed with dated photos (see next pages) and signed by both of you',
  'Meter readings taken; council tax and utility providers told'])}
<h2>4. Move-in day</h2>${check([
  'Smoke and CO alarms tested and working at the start of the tenancy',
  'Keys handed over and recorded',
  'Tenant shown the stopcock, fuse box, boiler controls and alarm test buttons'])}
<h2>5. After the tenancy starts</h2>${check([
  'Diary: gas safety every 12 months, EICR every 5 years, EPC expiry, licence expiry, insurance renewal',
  'Rent increases: at most once a year using a section 13 notice',
  'Pet requests: consider each one, reply in writing, and do not refuse unreasonably',
  'Repairs logged and dealt with promptly; keep records',
  'HMRC: register for Self Assessment if needed; check whether Making Tax Digital applies (income over £50,000 now, £30,000 from April 2027)',
  'Watch gov.uk for the private rented sector database and landlord ombudsman start dates'])}
</section>
<section><h1>Inventory and check-in report</h1>
<table><tr><th>Property address</th><td class="blank" colspan="3"></td></tr><tr><th>Tenant(s)</th><td class="blank"></td><th>Check-in date</th><td class="blank"></td></tr></table>
<h2>Meters and keys</h2><table><tr><th>Item</th><th>Reading / number</th><th>Photo ref</th></tr>
${['Electricity meter', 'Gas meter', 'Water meter', 'Front door keys', 'Back door keys', 'Window keys', 'Fobs / cards'].map((x) => `<tr><td>${x}</td><td class="blank"></td><td class="blank"></td></tr>`).join('')}</table>
<h2>Room by room</h2>${['Hallway', 'Living room', 'Kitchen', 'Bedroom 1', 'Bedroom 2', 'Bathroom'].map((room) => `
<h3>${room}</h3><table><tr><th style="width:28%">Item</th><th>Condition</th><th>Cleanliness</th><th style="width:15%">Photo ref</th></tr>
${['Walls and ceiling', 'Floor / carpet', 'Windows, curtains, blinds', 'Doors and handles', 'Lights and sockets', 'Furniture / appliances'].map((i) => `<tr><td>${i}</td><td class="blank"></td><td class="blank"></td><td class="blank"></td></tr>`).join('')}</table>`).join('')}
<h2>Signatures</h2><table><tr><th>Landlord / agent</th><td class="blank"></td><th>Date</th><td class="blank"></td></tr><tr><th>Tenant</th><td class="blank"></td><th>Date</th><td class="blank"></td></tr></table>
<p class="muted">Both parties keep a signed copy. Add dated photos; they are the best evidence in a deposit dispute.</p></section>`;

const dmcc = `
<section><h1>Fake Reviews, Hidden Fees and the DMCC Act</h1><p style="font-size:14pt">A plain-English guide for small UK online shops</p>
<p class="muted">The consumer-protection parts of the Digital Markets, Competition and Consumers Act 2024 came into force on 6 April 2025. General information, not legal advice. Checked on 25 September 2026 against gov.uk and Competition and Markets Authority (CMA) guidance. Written with AI assistance and checked by a person.</p>
<h2>Why it matters now</h2>
<p>The CMA can now decide consumer-law breaches and fine businesses directly, up to <strong>10% of global turnover or £300,000, whichever is higher</strong>, without going to court first. Trading Standards still enforces too.</p>
<h2>1. Fake reviews are banned</h2><p>It is an automatically unfair practice to:</p>${check([
  'Write, commission or buy reviews that don\'t reflect a genuine customer experience (including by friends, family or staff posing as customers)',
  'Offer incentives (discounts, freebies, entry into a draw) for reviews without making that clear in the review',
  'Hide or suppress negative reviews, or show only positive ones as if they were all of them',
  'Present reviews in a misleading way, e.g. star ratings merged from different products'])}
<p><strong>If you publish reviews</strong> on your site you must take reasonable and proportionate steps to prevent and remove fake reviews. Have a short written review policy, check suspicious patterns, and don't edit reviews.</p>
</section>
<section><h2>2. Drip pricing is banned</h2>
<p>You can't show a headline price and add <strong>unavoidable</strong> charges later in checkout. Fixed mandatory fees (booking, admin or service fees) must be included in the first price the customer sees.</p>${check([
  'Headline prices include every fixed fee the customer must pay',
  'Prices shown to consumers include VAT',
  'Delivery charges that vary (e.g. by location or speed) are clearly flagged up front, with how they\'re worked out, before the customer commits',
  'Optional extras are genuinely optional and not pre-ticked'])}
<h2>3. Other things to check while you're at it</h2>${check([
  'Your business name, geographic address and email are on the site (Consumer Contracts Regulations)',
  '14-day cancellation right for online orders explained, with the model cancellation form or an easy way to cancel',
  'Returns and refund policy that matches the Consumer Rights Act 2015',
  'Subscriptions: new rules on subscription contracts are being introduced separately; check gov.uk for the start date before changing your sign-up flow'])}
<h2>4. A 15-minute self-audit</h2><ol>
<li>Open your product page as a new customer. Is the first price the price they'll pay, apart from clearly explained delivery?</li>
<li>Look at your reviews. Would you be comfortable explaining where each one came from?</li>
<li>Check your review request emails. Do any offer a reward only for positive reviews?</li>
<li>Read your footer and contact page. Are your name, address and email there?</li></ol>
<p class="muted">Sources: DMCC Act 2024 Part 4; CMA "Unfair commercial practices" guidance (2025); gov.uk guidance for businesses on consumer law.</p></section>`;

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [file, body] of [['First_Let_Landlord_Pack_England.pdf', landlord], ['DMCC_Act_Guide_for_Online_Shops.pdf', dmcc]]) {
  await page.setContent(`<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><style>${CSS}</style></head><body>${body}</body></html>`);
  await page.pdf({ path: path.join(DIST, file), format: 'A4', margin: { top: '14mm', bottom: '14mm', left: '14mm', right: '14mm' } });
  console.log(path.join(DIST, file));
}
await browser.close();
