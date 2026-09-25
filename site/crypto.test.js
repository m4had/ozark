const test = require('node:test');
const assert = require('node:assert/strict');
const { encodeTransfer, verifyReceipt, toUnits, NETWORKS, TRANSFER_TOPIC } = require('./crypto.js');

const SHOP = '0xE52739159fB0762bcBeD4bAe9f97644b4A348a25';
const USDC = NETWORKS.base.usdc;
const topicAddr = (a) => '0x' + a.slice(2).toLowerCase().padStart(64, '0');
const log = (to, units, token = USDC) => ({ address: token, topics: [TRANSFER_TOPIC, topicAddr('0x' + '1'.repeat(40)), topicAddr(to)],
  data: '0x' + units.toString(16).padStart(64, '0') });

test('amounts convert without float error', () => {
  assert.equal(toUnits('19'), 19000000n);
  assert.equal(toUnits('0.1'), 100000n);
  assert.equal(toUnits('12.345678'), 12345678n);
});

test('encodes an ERC-20 transfer call', () => {
  const data = encodeTransfer(SHOP, '19');
  assert.equal(data.slice(0, 10), '0xa9059cbb');
  assert.equal(data.length, 10 + 128);
  assert.ok(data.includes(SHOP.slice(2).toLowerCase()));
  assert.ok(data.endsWith((19000000).toString(16).padStart(64, '0')));
});

test('accepts a correct payment', () => {
  assert.equal(verifyReceipt({ status: '0x1', logs: [log(SHOP, 19000000n)] }, { token: USDC, to: SHOP, minAmount: '19' }), 19000000n);
});

test('rejects failed, underpaid, wrong-token and wrong-recipient payments', () => {
  const o = { token: USDC, to: SHOP, minAmount: '19' };
  assert.throws(() => verifyReceipt(null, o), /not found/);
  assert.throws(() => verifyReceipt({ status: '0x0', logs: [log(SHOP, 19000000n)] }, o), /failed/);
  assert.throws(() => verifyReceipt({ status: '0x1', logs: [log(SHOP, 18999999n)] }, o), /too small/);
  assert.throws(() => verifyReceipt({ status: '0x1', logs: [log(SHOP, 19000000n, '0x' + '2'.repeat(40))] }, o), /No USDC/);
  assert.throws(() => verifyReceipt({ status: '0x1', logs: [log('0x' + '3'.repeat(40), 19000000n)] }, o), /No USDC/);
});
