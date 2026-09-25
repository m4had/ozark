# Products

| Stream | Product | Build | Deliverable |
|---|---|---|---|
| A | MTD Ready workbook | `python3 products/mtd-workbook/build.py` | `dist/MTD_Ready_Workbook_2026-27.xlsx` |
| B | Landlord compliance tracker (England) | `python3 products/landlord-tracker/build.py` | `dist/Landlord_Compliance_Tracker_England.xlsx` |
| C | Accessibility report | `cd products/a11y-audit && npm install && node audit.mjs https://customer-site.example --client "Name"` | `reports/<host>/report.pdf` |

Python builds need `pip install -r products/requirements.txt`. Tests for C: `cd products/a11y-audit && npm test`.
Facts in A and B were last checked against gov.uk on 2026-09-25. Re-check before each tax year and when legislation changes.
