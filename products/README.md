# Products

| Stream | Product | Build / run | Deliverable |
|---|---|---|---|
| A | MTD Ready workbook | `python3 products/mtd-workbook/build.py` | `dist/MTD_Ready_Workbook_2026-27.xlsx` |
| B | Landlord tracker (England) | `python3 products/landlord-tracker/build.py` | `dist/Landlord_Compliance_Tracker_England.xlsx` |
| C | Accessibility report | `cd products/a11y-audit && npm install && node audit.mjs <url> --client "Name"` | `reports/<host>/report.pdf` |
| D | Cash-flow & VAT toolkit | `python3 products/cashflow-vat/build.py` | `dist/Cashflow_and_VAT_Toolkit_UK.xlsx` |
| E | Quote & invoice kit | `python3 products/invoice-kit/build.py` | `dist/Quote_and_Invoice_Kit_UK.xlsx` |
| F, G | Planner, prompt pack | `node products/printables/build.mjs` | `dist/*.pdf` |
| H | Cookie consent check | `cd products/a11y-audit && node cookie-check.mjs <url>` | `reports/<host>-cookies/cookies.pdf` |
| J | Course scripts | – | `products/course/` |
| K | Newsletter | – | `products/newsletter/` |
| L | Take-home calculator | static page | `site/tools/` (tests: `node --test site/tools/takehome.test.js`) |
| M | Uptime monitor, changelog tool | GitHub template / CLI | `products/uptime-monitor/`, `products/changelog-gen/` |

Python builds need `pip install -r products/requirements.txt`. Node tests: `npm test` in `products/a11y-audit`, `node --test` in `changelog-gen` and `uptime-monitor`.
Facts were last checked against gov.uk on 2026-09-25.
