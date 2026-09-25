import test from 'node:test';
import assert from 'node:assert/strict';
import { gate } from '../gate.mjs';

const issues = [{ id: 'a', impact: 'critical' }, { id: 'b', impact: 'serious' }, { id: 'c', impact: 'minor' }];
test('gate thresholds', () => {
  assert.deepEqual(gate(issues, 'critical').map((i) => i.id), ['a']);
  assert.deepEqual(gate(issues, 'serious').map((i) => i.id), ['a', 'b']);
  assert.deepEqual(gate(issues, 'none'), []);
  assert.throws(() => gate(issues, 'bogus'));
});
