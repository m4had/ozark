const test = require('node:test');
const assert = require('node:assert/strict');
const { takeHome } = require('./takehome.js');

test('below personal allowance: no tax or NI', () => {
  assert.deepEqual([takeHome(12000).tax, takeHome(12000).ni], [0, 0]);
});
test('£30,000: basic rate only', () => {
  const r = takeHome(30000);
  assert.equal(r.tax, 3486); // (30000-12570)*20%
  assert.equal(r.ni, 1394.4); // (30000-12570)*8%
});
test('£60,000: higher rate and 2% NI', () => {
  const r = takeHome(60000);
  assert.equal(r.tax, 37700 * 0.2 + (60000 - 12570 - 37700) * 0.4); // 7540 + 3892
  assert.equal(r.ni, 37700 * 0.08 + (60000 - 50270) * 0.02);
});
test('£110,000: allowance tapered by £5,000', () => {
  assert.equal(takeHome(110000).personalAllowance, 7570);
});
test('£150,000: no allowance, additional rate above £125,140', () => {
  const r = takeHome(150000);
  assert.equal(r.personalAllowance, 0);
  assert.equal(r.tax, 37700 * 0.2 + (125140 - 37700) * 0.4 + (150000 - 125140) * 0.45);
});
test('pension salary sacrifice reduces tax', () => {
  assert.ok(takeHome(60000, { pensionPct: 5 }).tax < takeHome(60000).tax);
});
