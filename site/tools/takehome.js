// UK (England, Wales, NI) take-home pay, tax year 2026-27. Figures checked 2026-09-25 against
// commonslibrary.parliament.uk/research-briefings/cbp-10618 and gov.uk rates pages.
const Y2026 = {
  personalAllowance: 12570, taperStart: 100000, basicBand: 37700, additionalStart: 125140,
  rates: { basic: 0.2, higher: 0.4, additional: 0.45 },
  ni: { primaryThreshold: 12570, upperEarningsLimit: 50270, main: 0.08, upper: 0.02 },
};

function takeHome(gross, { pensionPct = 0, year = Y2026 } = {}) {
  const pension = Math.max(0, gross * pensionPct / 100); // salary sacrifice: reduces taxable pay and NI
  const pay = Math.max(0, gross - pension);
  const pa = Math.max(0, year.personalAllowance - Math.max(0, pay - year.taperStart) / 2);
  const taxable = Math.max(0, pay - pa);
  const basic = Math.min(taxable, year.basicBand);
  const additional = Math.max(0, pay - year.additionalStart);
  const higher = Math.max(0, taxable - basic - additional);
  const tax = basic * year.rates.basic + higher * year.rates.higher + additional * year.rates.additional;
  const { primaryThreshold: pt, upperEarningsLimit: uel, main, upper } = year.ni;
  const ni = Math.max(0, Math.min(pay, uel) - pt) * main + Math.max(0, pay - uel) * upper;
  const net = pay - tax - ni;
  const r2 = (x) => Math.round(x * 100) / 100;
  return { gross, pension: r2(pension), personalAllowance: r2(pa), tax: r2(tax), ni: r2(ni), net: r2(net),
    monthly: r2(net / 12) };
}

if (typeof module !== 'undefined') module.exports = { takeHome };
else window.takeHome = takeHome;
