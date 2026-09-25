// Free UK calculators (wave 2). Figures checked 2026-09-25 against gov.uk, legislation.gov.uk and bankofengland.co.uk.
const round2 = (x) => Math.round(x * 100) / 100;

// Making Tax Digital for Income Tax: first year you must use it, from qualifying income (gross self-employment
// + gross property income, before expenses) on the return for the tax year shown.
const MTD_STEPS = [
  { year: '2024-25', threshold: 50000, start: '6 April 2026' },
  { year: '2025-26', threshold: 30000, start: '6 April 2027' },
  { year: '2026-27', threshold: 20000, start: '6 April 2028' },
];
function mtdStart(incomes) {
  // incomes: { '2024-25': {se, prop}, ... } — missing years are treated as unknown
  for (const s of MTD_STEPS) {
    const y = incomes[s.year];
    if (!y) continue;
    const q = (Number(y.se) || 0) + (Number(y.prop) || 0);
    if (q > s.threshold) return { start: s.start, basedOn: s.year, qualifying: q, threshold: s.threshold };
  }
  return null;
}

// HMRC approved mileage allowance payments (per tax year).
function mileageAllowance({ miles, vehicle = 'car', passengerMiles = 0 }) {
  const m = Math.max(0, Number(miles) || 0);
  let allowance;
  if (vehicle === 'motorcycle') allowance = m * 0.24;
  else if (vehicle === 'bicycle') allowance = m * 0.20;
  else allowance = Math.min(m, 10000) * 0.45 + Math.max(0, m - 10000) * 0.25;
  return round2(allowance + Math.max(0, Number(passengerMiles) || 0) * 0.05);
}

// Late Payment of Commercial Debts (Interest) Act 1998: interest = reference rate + 8%; reference rate is Bank Rate
// on 31 Dec (for debts due 1 Jan–30 Jun) or 30 Jun (for debts due 1 Jul–31 Dec).
const REFERENCE_RATES = { '2025-H1': 4.75, '2025-H2': 4.25, '2026-H1': 3.75, '2026-H2': 3.75 };
function referenceRate(dueIso) {
  const [y, m] = dueIso.split('-').map(Number);
  return REFERENCE_RATES[`${y}-H${m <= 6 ? 1 : 2}`] ?? null;
}
function latePayment({ amount, dueIso, paidIso }) {
  const a = Number(amount) || 0;
  const days = Math.max(0, Math.round((Date.parse(paidIso) - Date.parse(dueIso)) / 86400000));
  const ref = referenceRate(dueIso);
  if (ref === null) return { error: 'We only have reference rates for debts due in 2025 and 2026.' };
  const rate = ref + 8;
  const interest = round2(a * rate / 100 * days / 365);
  const compensation = days > 0 ? (a < 1000 ? 40 : a < 10000 ? 70 : 100) : 0;
  return { days, ref, rate, interest, dailyInterest: round2(a * rate / 100 / 365), compensation, total: round2(interest + compensation) };
}

// Self Assessment payments on account: two payments, each 50% of last year's bill, unless the bill was under £1,000
// or more than 80% of tax was collected at source (e.g. PAYE).
function paymentsOnAccount({ lastBill, collectedAtSourcePct = 0, thisYearBill }) {
  const bill = Math.max(0, Number(lastBill) || 0);
  if (bill < 1000 || Number(collectedAtSourcePct) > 80) return { required: false, each: 0 };
  const each = round2(bill / 2);
  const out = { required: true, each };
  if (thisYearBill !== undefined && thisYearBill !== '') out.balancing = round2(Math.max(0, Number(thisYearBill)) - each * 2);
  return out;
}

// VAT Flat Rate Scheme vs standard accounting (annual). Limited cost trader: goods (VAT-incl.) under 2% of VAT-incl.
// turnover or under £1,000 a year -> 16.5%. 1% discount in the first year of VAT registration.
function vatFlatRate({ turnoverExVat, sectorRatePct, goodsInclVat, inputVatReclaimable, firstYear = false, vatRate = 20 }) {
  const t = Math.max(0, Number(turnoverExVat) || 0);
  const gross = t * (1 + vatRate / 100);
  const goods = Math.max(0, Number(goodsInclVat) || 0);
  const lct = goods < Math.max(gross * 0.02, 1000);
  const rate = (lct ? 16.5 : Number(sectorRatePct) || 0) - (firstYear ? 1 : 0);
  const frs = round2(gross * rate / 100);
  const standard = round2(t * vatRate / 100 - Math.max(0, Number(inputVatReclaimable) || 0));
  return { gross: round2(gross), lct, rate, frs, standard, saving: round2(standard - frs), canJoin: t <= 150000 };
}

// VAT registration: register if taxable turnover in any rolling 12 months goes over £90,000.
function vatThreshold(monthly, threshold = 90000) {
  const vals = monthly.map((v) => Math.max(0, Number(v) || 0));
  const rolling = vals.map((_, i) => vals.slice(Math.max(0, i - 11), i + 1).reduce((a, b) => a + b, 0));
  const first = rolling.findIndex((r) => r > threshold);
  return { rolling, overAt: first, latest: rolling[rolling.length - 1] ?? 0, headroom: threshold - (rolling[rolling.length - 1] ?? 0) };
}

// Simplified expenses: use of home flat rate per month by hours of business use.
function useOfHome(hoursByMonth) {
  const rate = (h) => (h >= 101 ? 26 : h >= 51 ? 18 : h >= 25 ? 10 : 0);
  const months = hoursByMonth.map((h) => rate(Math.max(0, Number(h) || 0)));
  return { months, total: months.reduce((a, b) => a + b, 0) };
}

const api = { vatFlatRate, vatThreshold, useOfHome, mtdStart, mileageAllowance, latePayment, referenceRate, paymentsOnAccount, REFERENCE_RATES };
if (typeof module !== 'undefined') module.exports = api;
else window.Calc = api;
