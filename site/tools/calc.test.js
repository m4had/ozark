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
