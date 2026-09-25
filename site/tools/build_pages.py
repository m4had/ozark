#!/usr/bin/env python3
"""Generates the free tool pages, tools index and tax-deadline calendar in site/tools/.
Run: python3 site/tools/build_pages.py  (output is committed; the site build copies it as-is)."""
import zlib
from pathlib import Path

HERE = Path(__file__).resolve().parent
BASE = "https://m4had.github.io/ozark/tools/"
HEAD = '''<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title><meta name="description" content="{desc}"><link rel="canonical" href="{base}{file}"><meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:url" content="{base}{file}"><meta property="og:type" content="website">
<link rel="stylesheet" href="../style.css">
<style>label{{display:block;margin:12px 0 4px;font-weight:600}}input,select{{font:inherit;padding:8px;width:100%;max-width:280px}}
fieldset{{border:0;padding:0;margin:0 0 8px}}legend{{font-weight:700;margin-top:10px}}
table{{border-collapse:collapse;width:100%;margin-top:12px}}td{{padding:8px;border-bottom:1px solid #8884}}td:last-child{{text-align:right}}.big{{font-size:26px;font-weight:700}}</style>
</head><body><header><a href="../index.html">Compliance Kits</a> · <a href="index.html">Free tools</a></header><main>
<h1>{h1}</h1><p class="lede">{lede}</p>
<div class="card">{form}<div id="out" aria-live="polite"></div></div>
<p class="note">{note}</p>
<div class="card">{cta}</div>
</main><footer><p><a href="../terms.html">Terms &amp; returns</a> · <a href="../privacy.html">Privacy &amp; cookies</a> · <a href="../contact.html">Contact</a></p></footer><script src="calc.js"></script><script>
const $=(id)=>document.getElementById(id);const fmt=(n)=>n.toLocaleString('en-GB',{{style:'currency',currency:'GBP'}});
{js}
document.querySelectorAll('input,select').forEach((el)=>el.addEventListener('input',render));render();
</script></body></html>
'''


def mtd_fieldset(i, year):
    se = ' value="38000"' if i == 0 else ''
    pr = ' value="16000"' if i == 0 else ''
    return (f'<fieldset><legend>Tax year {year}</legend>'
            f'<label for="se{i}">Self-employment turnover (£)</label><input id="se{i}" type="number" min="0" step="100" inputmode="decimal"{se}>'
            f'<label for="pr{i}">Property income, your share (£)</label><input id="pr{i}" type="number" min="0" step="100" inputmode="decimal"{pr}></fieldset>')


PAGES = {
    "mtd-checker.html": dict(
        title="MTD Eligibility Checker", h1="Does Making Tax Digital apply to me?",
        desc="Free checker: find the date Making Tax Digital for Income Tax applies to you, from your self-employment and property income.",
        lede="Enter your <strong>gross</strong> income, before expenses, from each Self Assessment return. Nothing you type leaves your browser.",
        form="".join(mtd_fieldset(i, y) for i, y in enumerate(["2024-25", "2025-26", "2026-27"])),
        js='''const Y=['2024-25','2025-26','2026-27'];function render(){const inc={};Y.forEach((y,i)=>{const se=$('se'+i).value,pr=$('pr'+i).value;if(se!==''||pr!=='')inc[y]={se,prop:pr};});
const r=Calc.mtdStart(inc);$('out').innerHTML=r?`<p class="big">From ${r.start}</p><p>Your qualifying income for ${r.basedOn} is ${fmt(r.qualifying)}, over the ${fmt(r.threshold)} threshold.</p>`:(Object.keys(inc).length?'<p class="big">Not yet</p><p>Based on what you entered, your qualifying income is not over any threshold. Check again after each return.</p>':'<p>Enter at least one year.</p>');}''',
        note="Qualifying income = gross self-employment + gross property income. Thresholds: over £50,000 (2024-25 return) → from 6 April 2026; over £30,000 (2025-26) → 2027; over £20,000 (2026-27) → 2028. Partnership income and some people (e.g. digitally excluded) are outside it. Checked against gov.uk on 25 September 2026. Not tax advice.",
        cta='<strong>Need to start?</strong> The <a href="../mtd.html">MTD Ready workbook</a> keeps your records in a spreadsheet, and the <a href="../index.html">written course</a> walks you through setup.'),
    "late-payment.html": dict(
        title="Late Payment Calculator", h1="Late-payment interest calculator (UK business invoices)",
        desc="Free calculator for statutory interest (Bank Rate + 8%) and fixed compensation on late UK business-to-business invoices.",
        lede="For invoices to other businesses. The Late Payment of Commercial Debts (Interest) Act lets you claim interest and fixed compensation.",
        form='<label for="amt">Invoice amount (£)</label><input id="amt" type="number" min="0" step="0.01" value="2000"><label for="due">Payment was due on</label><input id="due" type="date" value="2026-08-01"><label for="paid">Paid on (or today)</label><input id="paid" type="date">',
        js='''$('paid').value=new Date().toISOString().slice(0,10);function render(){const r=Calc.latePayment({amount:$('amt').value,dueIso:$('due').value,paidIso:$('paid').value||new Date().toISOString().slice(0,10)});
if(r.error){$('out').innerHTML=`<p>${r.error}</p>`;return;}$('out').innerHTML=`<table><tr><td>Days late</td><td>${r.days}</td></tr><tr><td>Interest rate (Bank Rate ${r.ref}% + 8%)</td><td>${r.rate}%</td></tr><tr><td>Statutory interest</td><td>${fmt(r.interest)}</td></tr><tr><td>Interest per extra day</td><td>${fmt(r.dailyInterest)}</td></tr><tr><td>Fixed compensation</td><td>${fmt(r.compensation)}</td></tr><tr style="font-weight:700"><td>You can claim</td><td>${fmt(r.total)}</td></tr></table>`;}''',
        note="Reference rate is the Bank of England Bank Rate on 31 December (for debts due January–June) or 30 June (July–December): 3.75% for 2026. Compensation: £40 (under £1,000), £70 (£1,000–£9,999.99), £100 (£10,000+). Only for business-to-business debts; your contract may set its own terms. Checked 25 September 2026. Not legal advice.",
        cta='<strong>Chasing payment?</strong> The <a href="../index.html">Quote &amp; invoice kit</a> tracks overdue invoices, and the <a href="../index.html">AI prompt pack</a> includes polite chaser emails.'),
    "mileage.html": dict(
        title="Mileage Allowance Calculator", h1="HMRC mileage allowance calculator",
        desc="Free calculator for HMRC approved mileage rates: 45p/25p cars and vans, 24p motorcycles, 20p bicycles, 5p passengers.",
        lede="Work out the tax-free mileage allowance for business journeys in one tax year.",
        form='<label for="veh">Vehicle</label><select id="veh"><option value="car">Car or van</option><option value="motorcycle">Motorcycle</option><option value="bicycle">Bicycle</option></select><label for="mi">Business miles this tax year</label><input id="mi" type="number" min="0" step="1" value="12000"><label for="pm">Passenger miles (colleagues on business)</label><input id="pm" type="number" min="0" step="1" value="0">',
        js='''function render(){const a=Calc.mileageAllowance({miles:$('mi').value,vehicle:$('veh').value,passengerMiles:$('pm').value});$('out').innerHTML=`<p class="big">${fmt(a)}</p><p>Tax-free allowance for this tax year.</p>`;}''',
        note="Rates: cars and vans 45p per mile for the first 10,000 business miles in a tax year, then 25p; motorcycles 24p; bicycles 20p; 5p per passenger per mile. Self-employed people who use these rates can't also claim the vehicle's actual running costs. Checked against gov.uk on 25 September 2026.",
        cta='<strong>Keeping records?</strong> The <a href="../mtd.html">MTD Ready workbook</a> has a mileage log that works this out as you go.'),
    "payments-on-account.html": dict(
        title="Payments on Account Calculator", h1="Self Assessment payments on account calculator",
        desc="Free calculator: do you have to make payments on account, how much are they, and what balancing payment is due.",
        lede="See what you'll pay HMRC on 31 January and 31 July.",
        form='<label for="lb">Last year\'s Self Assessment bill (income tax + Class 4 NI, £)</label><input id="lb" type="number" min="0" step="1" value="6000"><label for="src">% of your tax collected at source (e.g. PAYE)</label><input id="src" type="number" min="0" max="100" step="1" value="0"><label for="tb">Estimated bill for this year (optional, £)</label><input id="tb" type="number" min="0" step="1" value="7000">',
        js='''function render(){const r=Calc.paymentsOnAccount({lastBill:$('lb').value,collectedAtSourcePct:$('src').value,thisYearBill:$('tb').value});
$('out').innerHTML=r.required?`<table><tr><td>1st payment on account (31 January)</td><td>${fmt(r.each)}</td></tr><tr><td>2nd payment on account (31 July)</td><td>${fmt(r.each)}</td></tr>${r.balancing!==undefined?`<tr style="font-weight:700"><td>Balancing payment (next 31 January)</td><td>${fmt(r.balancing)}</td></tr>`:''}</table>`:'<p class="big">No payments on account</p><p>Your last bill was under £1,000, or more than 80% of your tax was collected at source.</p>';}''',
        note="Each payment on account is half of last year's bill. You don't make them if last year's bill was under £1,000 or over 80% of your tax was deducted at source. A negative balancing payment means you've overpaid. Checked against gov.uk on 25 September 2026. Not tax advice.",
        cta='<strong>Plan ahead.</strong> The <a href="../index.html">Cash-flow &amp; VAT toolkit</a> has rows for your tax set-aside so 31 January isn\'t a shock.'),
}

TOOLS = [
    ("take-home-pay.html", "Take-home pay 2026-27", "Income tax, National Insurance and pension."),
    ("mtd-checker.html", "Making Tax Digital checker", "When MTD for Income Tax applies to you."),
    ("late-payment.html", "Late-payment interest", "Statutory interest and compensation on late B2B invoices."),
    ("mileage.html", "Mileage allowance", "HMRC approved mileage rates."),
    ("payments-on-account.html", "Payments on account", "What's due on 31 January and 31 July."),
    ("deadlines-2026-27.ics", "Tax deadlines calendar (.ics)", "Add every MTD and Self Assessment date to your calendar, with 7-day reminders."),
]

EVENTS = [
    ("20261107", "MTD quarterly update 2 due"),
    ("20270131", "Self Assessment 2025-26 return + payment; 1st payment on account 2026-27"),
    ("20270207", "MTD quarterly update 3 due"),
    ("20270507", "MTD quarterly update 4 due"),
    ("20270731", "2nd payment on account 2026-27"),
    ("20280131", "MTD final declaration 2026-27 + balancing payment"),
]


def build():
    for f, p in PAGES.items():
        (HERE / f).write_text(HEAD.format(base=BASE, file=f, **p))
    cards = "".join(f'<div class="card"><h2><a href="{h}">{t}</a></h2><p>{d}</p></div>' for h, t, d in TOOLS)
    (HERE / "index.html").write_text(f'''<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Free UK Business Tools</title><meta name="description" content="Free UK calculators for sole traders, landlords and small businesses: take-home pay, MTD, late payment, mileage, payments on account.">
<link rel="canonical" href="{BASE}"><meta property="og:title" content="Free UK Business Tools"><meta property="og:description" content="Free UK calculators for sole traders, landlords and small businesses."><meta property="og:url" content="{BASE}"><meta property="og:type" content="website"><link rel="stylesheet" href="../style.css"></head><body>
<header><a href="../index.html">Compliance Kits</a></header><main><h1>Free UK business tools</h1><p class="lede">Quick, sourced calculators. Nothing you type leaves your browser.</p>
{cards}
</main><footer><p><a href="../terms.html">Terms &amp; returns</a> · <a href="../privacy.html">Privacy &amp; cookies</a> · <a href="../contact.html">Contact</a></p></footer></body></html>
''')
    lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Compliance Kits//UK tax deadlines//EN", "CALSCALE:GREGORIAN",
             "X-WR-CALNAME:UK tax deadlines 2026-27"]
    for d, s in EVENTS:
        lines += ["BEGIN:VEVENT", f"UID:{d}-{zlib.crc32(s.encode())}@m4had.github.io", "DTSTAMP:20260925T200000Z",
                  f"DTSTART;VALUE=DATE:{d}", f"SUMMARY:{s}",
                  "DESCRIPTION:Check gov.uk for your circumstances. From m4had.github.io/ozark",
                  "BEGIN:VALARM", "TRIGGER:-P7D", "ACTION:DISPLAY", f"DESCRIPTION:{s} in 7 days", "END:VALARM", "END:VEVENT"]
    lines.append("END:VCALENDAR")
    (HERE / "deadlines-2026-27.ics").write_text("\r\n".join(lines) + "\r\n")


if __name__ == "__main__":
    build()
    print("built", len(PAGES), "tool pages, index and calendar")
