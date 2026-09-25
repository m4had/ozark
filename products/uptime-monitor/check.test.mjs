import test from 'node:test';
import assert from 'node:assert/strict';
import { checkSite, parseSites } from './check.mjs';

test('parses sites file', () => assert.deepEqual(parseSites('# c\nhttps://a\n\n https://b \n'), ['https://a', 'https://b']));
test('flags HTTP errors and expiring certs', async () => {
  const r = await checkSite('https://x.test', async () => ({ status: 503 }), async () => 5);
  assert.deepEqual(r.problems, ['HTTP 503', 'SSL certificate expires in 5 day(s)']);
  const ok = await checkSite('https://x.test', async () => ({ status: 200 }), async () => 60);
  assert.ok(ok.ok);
  const down = await checkSite('http://x.test', async () => { throw new Error('ECONNREFUSED'); });
  assert.deepEqual(down.problems, ['unreachable (ECONNREFUSED)']);
});
