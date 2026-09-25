#!/usr/bin/env python3
"""Generates the hand-written guides in site/guides/ (HTML + FAQ structured data).
Run: python3 site/guides/build_guides.py   (output is committed; the site build copies it)."""
import html
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
BASE = "https://m4had.github.io/ozark/"
FOOT = ('<footer><p><a href="../terms.html">Terms &amp; returns</a> · <a href="../privacy.html">Privacy &amp; cookies</a> · '
        '<a href="../contact.html">Contact</a></p></footer>')

GUIDES = [
    {
        "slug": "mtd-quarterly-update-november-2026",
        "title": "MTD Update Due 7 November",
        "h1": "Your second MTD quarterly update is due 7 November 2026: what to send",
        "desc": "Plain-English checklist for the Making Tax Digital for Income Tax quarterly update due 7 November 2026: which figures, which period, and what happens if you're late.",
        "updated": "25 September 2026",
        "body": """
<p class="lede">If your qualifying income on your 2024-25 return was over £50,000, you've been in Making Tax Digital for Income Tax since 6 April 2026. Your second quarterly update is due on <strong>7 November 2026</strong>.</p>
<h2>Which period does it cover?</h2>
<p>Updates are <strong>cumulative</strong>. The November update covers the tax year so far:</p>
<ul><li><strong>Standard quarters:</strong> 6 April to 5 October 2026</li><li><strong>Calendar quarters</strong> (if you chose them): 1 April to 30 September 2026</li></ul>
<p>Either way, the deadline is the same: 7 November.</p>
<h2>What figures do you send?</h2>
<p>Totals, not individual receipts, for each category:</p>
<ul><li><strong>Self-employment:</strong> turnover, other business income, and expenses under HMRC's headings (cost of goods, car/van/travel, premises, repairs, office costs, advertising, professional fees, and so on).</li>
<li><strong>Property:</strong> rent and other property income, and property expenses (rent/rates/insurance, repairs, professional fees, services, other). Keep residential mortgage interest separate: it isn't deducted, it gives a 20% tax credit.</li></ul>
<p>You still keep each transaction in your digital records. Your software adds them up.</p>
<h2>A 30-minute checklist</h2>
<ol><li>Enter every business transaction up to the end of the period, and compare against your bank statement.</li>
<li>Check categories, especially anything sitting in "other expenses".</li>
<li>Take out the private-use part of mixed costs such as your phone.</li>
<li>Check the year-to-date totals in your software or spreadsheet.</li>
<li>Submit through HMRC-recognised software (or bridging software if you keep records in a spreadsheet), and save the confirmation.</li></ol>
<h2>Made a mistake in your August update?</h2>
<p>Because the November update is cumulative, sending correct year-to-date figures fixes it. You don't need to resubmit the earlier quarter.</p>
<h2>What if you're late?</h2>
<p>Late quarterly updates earn penalty points. A financial penalty only applies once you reach the points threshold, and points expire after a period of compliance. Check gov.uk for the current details before relying on this.</p>
<h2>You don't pay tax quarterly</h2>
<p>Payment dates don't change: 31 January and 31 July (payments on account), with any balance on 31 January.</p>
""",
        "faq": [
            ("When is the second MTD quarterly update due in 2026?", "7 November 2026, covering 6 April to 5 October 2026 (or 1 April to 30 September if you use calendar quarters)."),
            ("Are MTD quarterly updates cumulative?", "Yes. Each update covers the tax year to date, so correct figures in a later update fix mistakes in an earlier one."),
            ("Do I pay tax every quarter under MTD?", "No. Quarterly updates are for reporting only. Payment dates stay 31 January and 31 July."),
        ],
        "tools": [("../tools/mtd-checker.html", "Check if MTD applies to you"), ("../mtd.html", "MTD Ready workbook"), ("../tools/deadlines-2026-27.ics", "Add all deadlines to your calendar")],
        "sources": ["gov.uk: Making Tax Digital for Income Tax", "gov.uk: Deadline approaches for first Making Tax Digital quarterly update (HMRC news)"],
    },
    {
        "slug": "claim-late-payment-interest-uk",
        "img": "mtd.png",
        "title": "Claim Late Payment Interest",
        "h1": "How to claim interest when a business customer pays late (UK, 2026)",
        "desc": "Step-by-step guide to claiming statutory late payment interest (Bank Rate + 8%, 11.75% in 2026) and fixed compensation on overdue business invoices.",
        "updated": "25 September 2026",
        "body": """
<p class="lede">If another business pays your invoice late, the Late Payment of Commercial Debts (Interest) Act 1998 lets you charge <strong>interest</strong> and a <strong>fixed compensation</strong> amount, unless your contract sets different terms.</p>
<h2>Does it apply to you?</h2>
<ul><li>Yes for <strong>business-to-business</strong> sales, including sole traders selling to businesses.</li><li>No for sales to consumers, or where your contract already sets a substantial late-payment remedy.</li></ul>
<h2>When is a payment late?</h2>
<p>After the date in your contract. If none was agreed, it's 30 days after the customer receives the invoice or the goods/service, whichever is later. Agreed terms longer than 60 days must be fair to the supplier, and public bodies generally have to pay within 30 days.</p>
<h2>How much can you claim?</h2>
<ul><li><strong>Interest:</strong> 8% plus the Bank of England Bank Rate. The rate is fixed for six months: the Bank Rate on 31 December applies to debts due January–June, and the rate on 30 June applies to July–December. For 2026 both are 3.75%, so the rate is <strong>11.75% a year</strong>.</li>
<li><strong>Fixed compensation</strong> per invoice: £40 if it's under £1,000, £70 for £1,000 to £9,999.99, and £100 for £10,000 or more.</li>
<li>Reasonable extra recovery costs, if the fixed amount doesn't cover them.</li></ul>
<p><strong>Example:</strong> a £2,000 invoice due on 1 August 2026 and paid 60 days late: interest of £2,000 × 11.75% × 60 ÷ 365 = <strong>£38.63</strong>, plus <strong>£70</strong> compensation, total £108.63.</p>
<h2>How to claim</h2>
<ol><li>Send a polite reminder first. Many late payers just need a nudge.</li>
<li>If it's still unpaid, send a letter or email stating the amount due, the statutory interest and the compensation, and give a final date.</li>
<li>If it's still unpaid, you can use Money Claim Online for claims up to £100,000.</li></ol>
<p>Charging it is optional. Many businesses mention the right to keep relationships healthy and waive it when the customer pays promptly.</p>
""",
        "faq": [
            ("What is the statutory late payment interest rate in 2026?", "11.75% a year: the Bank of England Bank Rate of 3.75% plus 8%, for debts due in either half of 2026."),
            ("How much fixed compensation can I claim for a late invoice?", "£40 for invoices under £1,000, £70 for £1,000 to £9,999.99, and £100 for £10,000 or more."),
            ("Can I charge late payment interest to consumers?", "No. The Late Payment Act covers business-to-business debts only."),
        ],
        "tools": [("../tools/late-payment.html", "Late-payment interest calculator"), ("../index.html", "Quote & invoice kit with overdue log")],
        "sources": ["gov.uk: Late commercial payments: charging interest and debt recovery", "Bank of England: Bank Rate decisions December 2025 and September 2026"],
    },
    {
        "slug": "renters-rights-act-landlord-checklist",
        "img": "landlord.png",
        "title": "Renters' Rights Act Checklist",
        "h1": "Renters' Rights Act: a landlord's checklist for autumn 2026 (England)",
        "desc": "What private landlords in England need to have done since the Renters' Rights Act changes took effect on 1 May 2026: tenancies, section 21, rent increases, pets and the information sheet.",
        "updated": "25 September 2026",
        "body": """
<p class="lede">The main tenancy changes in the Renters' Rights Act 2025 took effect in England on <strong>1 May 2026</strong>. Here's a checklist of what should now be in place.</p>
<h2>1. Your tenancies are now periodic</h2>
<p>Most existing assured shorthold tenancies became <strong>assured periodic tenancies</strong> on 1 May 2026. Fixed terms ended automatically. Tenants can leave with two months' notice.</p>
<h2>2. Section 21 has gone</h2>
<p>You can no longer use "no-fault" section 21 notices. To get possession you need a <strong>section 8 ground</strong>, for example selling, moving in yourself, or rent arrears, each with its own notice period and evidence.</p>
<h2>3. Did you send the information sheet?</h2>
<p>For tenancies that existed before 1 May 2026 with written terms, landlords had to give every named tenant the government's <em>Renters' Rights Act Information Sheet 2026</em> by <strong>31 May 2026</strong>. It must be the exact PDF from gov.uk. If you missed it, send it now: the fine can be up to £7,000.</p>
<h2>4. New tenancies need a written statement</h2>
<p>For tenancies starting on or after 1 May 2026, give the tenant a written statement of terms before the tenancy starts.</p>
<h2>5. Rent increases: once a year, by section 13</h2>
<p>Increase rent at most once a year using the section 13 notice process. Tenants can challenge an increase at the tribunal. Rent review clauses in agreements no longer work.</p>
<h2>6. Pets, children and benefits</h2>
<ul><li>Consider every pet request, don't refuse unreasonably, and reply in writing.</li><li>You must not refuse tenants because they have children or receive benefits.</li><li>Advertise a rent and don't accept offers above it (no bidding wars).</li></ul>
<h2>7. The usual safety checks still apply</h2>
<p>Annual gas safety check, electrical check (EICR) at least every 5 years, a valid EPC rated E or above, smoke and CO alarms, deposit protection within 30 days, and Right to Rent checks.</p>
<h2>Still to come</h2>
<p>The private rented sector database, the landlord ombudsman and the Decent Homes Standard for private rentals come in later phases. Check gov.uk for dates.</p>
""",
        "faq": [
            ("When did section 21 end in England?", "On 1 May 2026, when the main Renters' Rights Act 2025 tenancy changes came into force. Possession now needs a section 8 ground."),
            ("What was the 31 May 2026 deadline for landlords?", "Landlords with existing written tenancies had to give each named tenant the government's Renters' Rights Act Information Sheet 2026 by 31 May 2026."),
            ("How often can I increase the rent now?", "Once a year, using the section 13 notice procedure. Tenants can challenge it at the tribunal."),
        ],
        "tools": [("../landlord.html", "Landlord compliance tracker"), ("../index.html", "MTD Ready for Landlords workbook")],
        "sources": ["legislation.gov.uk: Renters' Rights Act 2025 (Commencement No. 2) Regulations 2026", "gov.uk: Renters' Rights Act Information Sheet 2026"],
    },
    {
        "slug": "stop-invoices-going-to-spam-spf-dkim-dmarc",
        "img": "a11y.png",
        "title": "Stop Invoices Going to Spam",
        "h1": "Why your invoices land in spam, and how SPF, DKIM and DMARC fix it",
        "desc": "Plain-English guide for small businesses: what SPF, DKIM and DMARC are, why Gmail, Yahoo and Outlook now require them, and how to set them up.",
        "updated": "25 September 2026",
        "body": """
<p class="lede">If customers say your invoices or quotes went to spam, the cause is often three missing DNS records: <strong>SPF</strong>, <strong>DKIM</strong> and <strong>DMARC</strong>. Gmail, Yahoo and Microsoft Outlook now require them from bulk senders and increasingly favour them for everyone.</p>
<h2>The three records, in plain English</h2>
<ul><li><strong>SPF</strong> lists the services allowed to send email as your domain (e.g. Google Workspace, Microsoft 365, your invoicing app). One TXT record starting <code>v=spf1</code>.</li>
<li><strong>DKIM</strong> adds a digital signature to each email so receivers know it wasn't altered. Your email provider gives you the key to publish.</li>
<li><strong>DMARC</strong> tells receivers what to do when an email fails SPF and DKIM, and sends you reports. A TXT record at <code>_dmarc.yourdomain</code>.</li></ul>
<h2>Set them up in this order</h2>
<ol><li><strong>SPF:</strong> in your domain's DNS settings, add one TXT record, e.g. <code>v=spf1 include:_spf.google.com ~all</code> for Google Workspace. Add an <code>include:</code> for each service that sends as you. Have only one SPF record.</li>
<li><strong>DKIM:</strong> turn on DKIM signing in your email provider's admin panel and publish the record it gives you.</li>
<li><strong>DMARC:</strong> start in monitoring mode: <code>v=DMARC1; p=none; rua=mailto:you@yourdomain</code>. After a few weeks of clean reports, change to <code>p=quarantine</code>.</li></ol>
<h2>Common mistakes</h2>
<ul><li>Two SPF records (receivers then treat SPF as broken). Merge them into one.</li><li>Forgetting the invoicing or newsletter tool in SPF.</li><li>Leaving DMARC at <code>p=none</code> forever, which gives no protection against people spoofing your domain.</li></ul>
<h2>Who has to do this?</h2>
<p>Since 2024 Google and Yahoo have required SPF, DKIM and DMARC from anyone sending over 5,000 emails a day to their users, and Microsoft Outlook has done the same since May 2025. Smaller senders aren't formally required to, but authenticated mail is far less likely to be spam-foldered.</p>
""",
        "faq": [
            ("What are SPF, DKIM and DMARC?", "Three DNS records that prove email really comes from your domain: SPF lists allowed senders, DKIM signs messages, and DMARC tells receivers what to do with failures and sends you reports."),
            ("Can I have two SPF records?", "No. A domain must have only one SPF record; two make SPF fail. Merge them into a single TXT record."),
            ("What DMARC policy should a small business start with?", "Start with p=none plus a reports address, then move to p=quarantine once the reports show your legitimate mail passes."),
        ],
        "tools": [("../index.html", "Email deliverability check (£19)"), ("../index.html", "Shop legal-info check")],
        "sources": ["Google, Yahoo and Microsoft published sender requirements (2024–2025)", "RFC 7208 (SPF), RFC 6376 (DKIM), RFC 7489 (DMARC)"],
    },
]


def page(g):
    url = f"{BASE}guides/{g['slug']}.html"
    ld = [
        {"@context": "https://schema.org", "@type": "Article", "headline": g["h1"], "description": g["desc"],
         "dateModified": "2026-09-25", "author": {"@type": "Organization", "name": "Compliance Kits"}, "mainEntityOfPage": url},
        {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in g["faq"]]},
    ]
    faq = "".join(f"<h3>{html.escape(q)}</h3><p>{html.escape(a)}</p>" for q, a in g["faq"])
    tools = "".join(f'<li><a href="{h}">{html.escape(t)}</a></li>' for h, t in g["tools"])
    src = "".join(f"<li>{html.escape(s)}</li>" for s in g["sources"])
    return f'''<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(g["title"])}</title><meta name="description" content="{html.escape(g["desc"])}">
<link rel="canonical" href="{url}"><meta property="og:title" content="{html.escape(g["h1"])}"><meta property="og:description" content="{html.escape(g["desc"])}"><meta property="og:url" content="{url}"><meta property="og:image" content="{BASE}img/{g.get('img','mtd.png')}"><meta name="twitter:card" content="summary_large_image"><meta property="og:type" content="article">
<link rel="stylesheet" href="../style.css"><script type="application/ld+json">{json.dumps(ld)}</script></head><body>
<header><a href="../index.html">Compliance Kits</a> · <a href="index.html">Guides</a></header><main>
<h1>{html.escape(g["h1"])}</h1><p class="note">Updated {g["updated"]}. General information, not advice.</p>
{g["body"]}
<div class="card"><h2>Useful tools</h2><ul>{tools}</ul></div>
<h2>Questions people ask</h2>{faq}
<h2>Sources</h2><ul class="note">{src}</ul>
<p class="note">Written with AI assistance and checked by a person against the sources above.</p>
</main>{FOOT}</body></html>
'''


def build():
    for g in GUIDES:
        (HERE / f"{g['slug']}.html").write_text(page(g))
    cards = "".join(f'<div class="card"><h2><a href="{g["slug"]}.html">{html.escape(g["h1"])}</a></h2><p>{html.escape(g["desc"])}</p></div>' for g in GUIDES)
    (HERE / "index.html").write_text(f'''<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Plain-English Guides</title><meta name="description" content="Plain-English guides to UK small-business rules: MTD, late payment, Renters' Rights Act, email deliverability.">
<link rel="canonical" href="{BASE}guides/"><meta property="og:title" content="Plain-English Guides"><meta property="og:url" content="{BASE}guides/"><meta property="og:type" content="website"><link rel="stylesheet" href="../style.css"></head><body>
<header><a href="../index.html">Compliance Kits</a></header><main><h1>Plain-English guides</h1><p class="lede">Short, sourced guides to the UK rules that affect sole traders, landlords and small online shops.</p>
{cards}</main>{FOOT}</body></html>
''')
    return [f"guides/{g['slug']}.html" for g in GUIDES]


if __name__ == "__main__":
    print("\n".join(build()))
