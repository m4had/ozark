import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { chromium } from 'playwright';
import { checkCookies, classifyCookie, renderCookieHtml } from '../cookie-check.mjs';

test('classifies well-known cookies', () => {
  assert.equal(classifyCookie('_ga_ABC123').purpose, 'analytics');
  assert.equal(classifyCookie('_fbp').purpose, 'advertising');
  assert.equal(classifyCookie('PHPSESSID').purpose, 'likely essential');
  assert.equal(classifyCookie('mystery').purpose, 'check purpose');
});

test('reports cookies set before consent', async () => {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/html', 'set-cookie': 'PHPSESSID=abc; Path=/' })
      .end('<script>document.cookie="_ga=GA1.1.1; path=/"</script><p>hi</p>');
  }).listen(0);
  const browser = await chromium.launch();
  try {
    const r = await checkCookies(`http://127.0.0.1:${server.address().port}/`, browser);
    assert.deepEqual(r.cookies.map((c) => c.name).sort(), ['PHPSESSID', '_ga']);
    assert.deepEqual(r.nonEssential.map((c) => c.name), ['_ga']);
    assert.match(renderCookieHtml(r, '2026-09-25'), /1 analytics\/advertising cookie/);
  } finally {
    await browser.close();
    server.close();
  }
});
