# Phase 1 – Discovery, week 39 (2026-09-25)

**Status: estimates only.** Nothing has been built, bought or launched. Figures come from desk judgement, not measured data. Treat each one as a hypothesis for the kill criteria to test.

## Scoring method and assumptions
- **Score** = expected monthly profit (mid case) × P(success) ÷ effective setup cost.
- **Expected monthly profit** = mid revenue × (1 − platform/payment fee %) − monthly running cost (AI tokens, hosting, subscriptions).
- **Effective setup cost** = cash setup + *your* hours × £15/h, with a floor of £10. I can write code and content, but only you can open accounts that need KYC (Stripe, Gumroad, Etsy), sign contracts, or take sales calls. Owner time is the real scarce input, so it is priced in.
- **P(success)** = my estimate of the chance the stream reaches its mid-case revenue within 90 days.
- **High platform risk ⇒ score 0.** This covers anything that depends on scraping, ToS-grey tactics, or channels known to demonetise mass AI content (hard rule 1).
- Raw inputs, with a note per idea: `ops/data/ideas.csv`. Re-run with `python3 ops/ops.py score`.

## Ranked ideas
| Rank | # | Idea | Setup £ (cash+owner time) | Profit/mo (mid) | P | Wks to £ | Risk | Comp | Score |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1 | MTD-for-Income-Tax sole-trader record-keeping workbook (Sheets/Excel) | 45 | 160 | 0.35 | 2 | L | M | 1.24 |
| 2 | 2 | UK landlord compliance tracker (gas/EICR/EPC/deposit/Renters' Rights Act dates) | 45 | 124 | 0.30 | 2 | L | M | 0.83 |
| 3 | 12 | Website accessibility (WCAG 2.2) audit report - automated scan + AI plain-English fix list | 100 | 228 | 0.25 | 3 | L | M | 0.57 |
| 4 | 4 | UK small-business cash-flow + VAT forecast spreadsheet | 60 | 79 | 0.25 | 3 | L | H | 0.33 |
| 5 | 7 | Canva template kit for UK tradespeople (quote/invoice/flyer) | 60 | 51 | 0.20 | 3 | M | H | 0.17 |
| 6 | 27 | Fixed-price n8n/Zapier automation packages for small firms | 300 | 232 | 0.15 | 4 | L | M | 0.12 |
| 7 | 8 | Receipt-photo -> categorised CSV micro-SaaS for sole traders | 165 | 118 | 0.15 | 6 | L | H | 0.11 |
| 8 | 30 | Knowledge-base assistant setup for small firms (Claude Projects / custom bot) | 225 | 174 | 0.12 | 4 | L | M | 0.09 |
| 9 | 23 | Accessibility remediation (fix) service for small sites | 375 | 281 | 0.12 | 6 | L | M | 0.09 |
| 10 | 9 | Review-reply drafting assistant for local businesses (owner approves & posts) | 165 | 94 | 0.15 | 6 | M | M | 0.09 |
| 11 | 22 | Bookkeeping catch-up service for sole traders | 450 | 281 | 0.10 | 4 | L | M | 0.06 |
| 12 | 28 | Looker Studio ecommerce dashboard setup | 225 | 140 | 0.10 | 4 | L | M | 0.06 |
| 13 | 16 | Companies House enrichment API (OGL open data -> clean JSON/webhooks) | 130 | 61 | 0.12 | 6 | L | M | 0.06 |
| 14 | 25 | Shopify product-copy rewrite (done-for-you batches) | 180 | 85 | 0.10 | 4 | L | H | 0.05 |
| 15 | 6 | Short video course: MTD ITSA setup for sole traders | 320 | 93 | 0.15 | 8 | L | M | 0.04 |
| 16 | 24 | Podcast transcript + show-notes service (human-reviewed) | 150 | 61 | 0.10 | 4 | M | H | 0.04 |
| 17 | 29 | New-incorporation lead lists from Companies House | 100 | 66 | 0.06 | 6 | M | M | 0.04 |
| 18 | 26 | EU localisation for UK Etsy/Shopify sellers (AI + human review) | 210 | 99 | 0.08 | 6 | L | M | 0.04 |
| 19 | 13 | Privacy policy / cookie compliance checker | 130 | 47 | 0.08 | 6 | L | H | 0.03 |
| 20 | 19 | Newsletter: UK small-business tax & compliance deadlines (sponsor/paid tier) | 120 | 31 | 0.10 | 16 | L | M | 0.03 |
| 21 | 14 | Changelog / release-notes generator from Git commits | 130 | 32 | 0.10 | 6 | L | M | 0.03 |
| 22 | 15 | Invoice/receipt PDF extraction API (pay per call) | 130 | 37 | 0.08 | 8 | L | H | 0.02 |
| 23 | 3 | Generic Etsy printable planners | 60 | 16 | 0.08 | 4 | M | H | 0.02 |
| 24 | 5 | Prompt packs for professionals | 30 | 12 | 0.05 | 3 | M | H | 0.02 |
| 25 | 11 | Uptime + SSL-expiry monitor | 100 | 28 | 0.05 | 6 | L | H | 0.01 |
| 26 | 10 | Listing/product description generator | 100 | 18 | 0.05 | 4 | L | H | 0.01 |
| 27 | 21 | UK tax calculators site (take-home / dividend vs salary) with ads | 100 | 15 | 0.05 | 20 | M | H | 0.01 |
| 28 | 17 | Property-listing data API | 130 | 75 | 0.02 | 8 | H | M | 0.00 |
| 29 | 18 | Affiliate comparison site (UK business bank accounts) | 105 | 35 | 0.07 | 20 | H | H | 0.00 |
| 30 | 20 | Faceless AI YouTube channel | 150 | 5 | 0.03 | 26 | H | H | 0.00 |

## Rejected or deprioritised on rules, not just score
- **#17 Property-listing API**: depends on scraping portals, which breaches their ToS. Rejected.
- **#20 Faceless AI YouTube** and **#18 AI affiliate site**: high platform risk (YouTube's repetitive-content monetisation policy, Google's scaled-content policy).
- **#29 Lead lists**: director data is personal data under UK GDPR, and PECR limits marketing to sole traders. Would need a DPIA first.
- **#22 Bookkeeping service**: UK bookkeeping needs AML supervision. Not viable until you're registered.
