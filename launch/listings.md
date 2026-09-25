# Store listings (paste-ready)

These are for Gumroad or Lemon Squeezy. For each listing: upload the cover from `launch/covers/`, upload the file, then paste the text below.

---

## A – MTD Ready workbook
- **Name:** MTD Ready – Sole-Trader Record-Keeping Workbook 2026-27
- **Price:** £14 (discount "LAUNCH" from £19 for the first 50 buyers, or just set £14 for now)
- **File:** `dist/MTD_Ready_Workbook_2026-27.xlsx` · **Cover:** `launch/covers/mtd.png`
- **Summary:** Keep Making Tax Digital records in a spreadsheet you understand. Quarterly and year-to-date totals are ready for your bridging software.
- **Description:**

> If your self-employment and property income is over £50,000, Making Tax Digital for Income Tax applies to you from April 2026. It extends to income over £30,000 from April 2027. The next quarterly update is due **7 November 2026**.
>
> This workbook gives you:
> - Income and expense sheets with HMRC's MTD expense categories in drop-downs
> - A private-use column, so only the business part of mixed costs is counted
> - Quarterly and cumulative year-to-date totals, the figures your software asks for
> - Simplified-expense calculators: 45p/25p mileage and the use-of-home flat rate
> - A deadline countdown for every 2026-27 date
> - Works in Excel and Google Sheets. Free updates for 12 months.
>
> **Please note:** this is a record-keeping workbook. It is not HMRC-recognised software and cannot submit to HMRC by itself; use HMRC-recognised bridging software (listed on gov.uk) to send updates from a spreadsheet. Not tax advice. Facts checked against gov.uk on 25 Sept 2026. Listing text drafted with AI assistance and checked by a person.

- **Tags:** making tax digital, MTD, sole trader, self employed, bookkeeping, spreadsheet, UK tax

---

## B – Landlord compliance tracker
- **Name:** Landlord Compliance Tracker (England) – Renters' Rights Act 2026 edition
- **Price:** £15
- **File:** `dist/Landlord_Compliance_Tracker_England.xlsx` · **Cover:** `launch/covers/landlord.png`
- **Summary:** See at a glance what's done, due or missing across up to 10 rental properties in England.
- **Description:**

> Section 21 ended on 1 May 2026, and fines under the Renters' Rights Act go up to £7,000. This tracker keeps every compliance date in one place:
> - Gas safety, EICR, EPC, smoke and CO alarms, deposit protection, Right to Rent, licences, insurance, legionella
> - Next-due dates worked out automatically, with red/amber/green status and a dashboard
> - A Renters' Rights Act checklist, with a gov.uk or legislation.gov.uk source for every line
> - Up to 10 properties; works in Excel and Google Sheets; free updates for 12 months
>
> For properties in England. A record-keeping aid, not legal advice. Listing text drafted with AI assistance and checked by a person.

- **Tags:** landlord, buy to let, renters rights act, compliance, gas safety, EICR, spreadsheet

---

## C – Website accessibility report (Stripe Payment Link or Lemon Squeezy "service")
- **Name:** Website Accessibility Report (WCAG 2.2, plain English)
- **Price:** £49
- **Checkout custom fields:** "Website address to scan" (required); tick box "I own this site or am authorised to have it tested" (required)
- **Cover:** `launch/covers/a11y.png`
- **Description:** use the text on `site/accessibility.html`, including the note that automated tools find only some issues and that this is not a certificate.
- **Fulfilment:** send me the URL, and I run `node products/a11y-audit/audit.mjs <url> --client "<name>"`, review the report and send you the PDF to email to the customer.

---

## Wave 2 listings (same store)
| Product | Price | File | One-line summary |
|---|---|---|---|
| Cash-flow & VAT Toolkit (UK) | £15 | `dist/Cashflow_and_VAT_Toolkit_UK.xlsx` | 12-month cash-flow forecast, £90k VAT threshold watch, and Flat Rate Scheme vs standard VAT comparison (including the 16.5% limited cost trader test). |
| Quote & Invoice Kit (UK) | £9 | `dist/Quote_and_Invoice_Kit_UK.xlsx` | Quote and invoice templates with the details UK law requires, VAT per line, and an overdue-invoice log. |
| UK Small Business Year Planner 2026-27 | £5 | `dist/UK_Small_Business_Year_Planner_2026-27.pdf` | Printable monthly planner with every HMRC and MTD date marked. |
| 15 AI Prompts for UK Sole Traders | £5 | `dist/AI_Prompts_for_UK_Sole_Traders.pdf` | Copy-and-paste prompts for chasing payment, quotes, reviews and admin, plus rules for using AI safely. |
| Cookie Consent Check | £29 | service; I run `products/a11y-audit/cookie-check.mjs` | Shows which analytics and advertising cookies load before visitors consent, and how to fix it. Automated check, not legal advice. |

Every listing must say "Created with AI assistance and checked by a person." The spreadsheets and PDFs must carry the not-tax/legal-advice line, which is already inside each file.
