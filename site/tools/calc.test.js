const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('./calc.js');

test('MTD start dates', () => {
  assert.equal(C.mtdStart({ '2024-25': { se: 38000, prop: 16000 } }).start, '6 April 2026');
  assert.equal(C.mtdStart({ '2024-25': { se: 40000, prop: 0 }, '2025-26': { se: 31000 } }).start, '6 April 2027');
  assert.equal(C.mtdStart({ '2024-25': { se: 50000 } }), null); // must be OVER £50k
  assert.equal(C.mtdStart({ '2026-27': { se: 15000, prop: 5001 } }).start, '6 April 2028');
});

test('mileage allowance', () => {
  assert.equal(C.mileageAllowance({ miles: 12000 }), 4500 + 500);
  assert.equal(C.mileageAllowance({ miles: 100, vehicle: 'motorcycle' }), 24);
  assert.equal(C.mileageAllowance({ miles: 100, vehicle: 'bicycle', passengerMiles: 100 }), 25);
});

test('late payment interest and compensation', () => {
  const r = C.latePayment({ amount: 2000, dueIso: '2026-08-01', paidIso: '2026-09-30' });
  assert.equal(r.days, 60);
  assert.equal(r.rate, 11.75);
  assert.equal(r.interest, 38.63); // 2000 * 11.75% * 60/365
  assert.equal(r.compensation, 70);
  assert.equal(C.latePayment({ amount: 500, dueIso: '2025-03-01', paidIso: '2025-03-01' }).compensation, 0);
  assert.equal(C.referenceRate('2025-02-10'), 4.75);
  assert.ok(C.latePayment({ amount: 1, dueIso: '2024-01-01', paidIso: '2024-02-01' }).error);
});

test('payments on account', () => {
  assert.deepEqual(C.paymentsOnAccount({ lastBill: 900 }), { required: false, each: 0 });
  assert.deepEqual(C.paymentsOnAccount({ lastBill: 5000, collectedAtSourcePct: 85 }), { required: false, each: 0 });
  assert.deepEqual(C.paymentsOnAccount({ lastBill: 5000, thisYearBill: 6000 }), { required: true, each: 2500, balancing: 1000 });
});

test('VAT flat rate scheme', () => {
  const r = C.vatFlatRate({ turnoverExVat: 60000, sectorRatePct: 14.5, goodsInclVat: 800, inputVatReclaimable: 1500 });
  assert.equal(r.lct, true); assert.equal(r.rate, 16.5); assert.equal(r.frs, 11880); assert.equal(r.standard, 10500); assert.equal(r.saving, -1380);
  const s = C.vatFlatRate({ turnoverExVat: 60000, sectorRatePct: 14.5, goodsInclVat: 5000, inputVatReclaimable: 500, firstYear: true });
  assert.equal(s.lct, false); assert.equal(s.rate, 13.5); assert.equal(s.frs, 9720);
  assert.equal(C.vatFlatRate({ turnoverExVat: 160000, sectorRatePct: 10 }).canJoin, false);
});

test('VAT threshold rolling 12 months', () => {
  const r = C.vatThreshold(Array(14).fill(8000));
  assert.equal(r.rolling[11], 96000); assert.equal(r.overAt, 11); assert.equal(C.vatThreshold(Array(12).fill(7500)).overAt, -1); // exactly 90k is not over
});

test('use of home flat rate', () => {
  assert.deepEqual(C.useOfHome([24, 25, 50, 51, 100, 101]).months, [0, 10, 10, 18, 18, 26]);
  assert.equal(C.useOfHome(Array(12).fill(60)).total, 216);
});
