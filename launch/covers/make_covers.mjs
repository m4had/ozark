// Renders 1280x720 cover images for the store listings: node launch/covers/make_covers.mjs
import { chromium } from '../../products/a11y-audit/node_modules/playwright/index.mjs';
import path from 'node:path';

const covers = [
  ['mtd', '#1f4e78', 'MTD Ready', 'Sole-trader record-keeping workbook 2026-27',
   ['HMRC MTD expense categories', 'Quarterly + year-to-date totals', 'Mileage & use-of-home calculators', 'Excel & Google Sheets']],
  ['landlord', '#375623', 'Landlord Compliance Tracker', "England · updated for the Renters' Rights Act",
   ['Gas, EICR, EPC, deposits, Right to Rent', 'Automatic next-due dates', 'Red / amber / green dashboard', 'Up to 10 properties']],
  ['a11y', '#6b2d5c', 'Website Accessibility Report', 'Automated WCAG 2.2 scan, plain-English fixes',
   ['Up to 10 pages scanned', 'Issues ranked by severity', 'Why it matters + how to fix', 'PDF in 2 working days']],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
for (const [id, colour, title, sub, bullets] of covers) {
  await page.setContent(`<body style="margin:0;width:1280px;height:720px;background:${colour};color:#fff;
    font-family:system-ui,sans-serif;display:flex;flex-direction:column;justify-content:center;padding:0 90px;box-sizing:border-box">
    <div style="font-size:78px;font-weight:800;line-height:1.05">${title}</div>
    <div style="font-size:34px;opacity:.9;margin:18px 0 40px">${sub}</div>
    ${bullets.map((b) => `<div style="font-size:32px;margin:6px 0">✓ ${b}</div>`).join('')}</body>`);
  await page.screenshot({ path: path.join(import.meta.dirname, `${id}.png`) });
}
await browser.close();
