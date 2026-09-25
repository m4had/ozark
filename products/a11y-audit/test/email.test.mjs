import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeSpf, analyzeDmarc, renderEmailHtml, isDkimKey } from '../email-check.mjs';

test('SPF analysis', () => {
  assert.equal(analyzeSpf([]).status, 'fail');
  assert.equal(analyzeSpf(['v=spf1 include:_spf.google.com ~all']).status, 'pass');
  assert.equal(analyzeSpf(['v=spf1 -all', 'v=spf1 ~all']).status, 'fail');
  assert.equal(analyzeSpf(['v=spf1 include:a +all']).status, 'fail');
  assert.equal(analyzeSpf(['v=spf1 include:a ?all']).status, 'warn');
  assert.equal(analyzeSpf(['v=spf1 ' + Array.from({ length: 11 }, (_, i) => `include:s${i}.x`).join(' ') + ' ~all']).status, 'fail');
  assert.equal(analyzeSpf(['google-site-verification=abc']).status, 'fail');
});

test('DMARC analysis', () => {
  assert.equal(analyzeDmarc([]).status, 'fail');
  assert.equal(analyzeDmarc(['v=DMARC1; p=none']).status, 'warn');
  assert.match(analyzeDmarc(['v=DMARC1; p=none']).fix, /rua=/);
  assert.equal(analyzeDmarc(['v=DMARC1; p=reject; rua=mailto:a@b.c']).status, 'pass');
  assert.equal(analyzeDmarc(['v=DMARC1; p=bogus']).status, 'fail');
});

test('renders escaped report', () => {
  const html = renderEmailHtml({ domain: '<x>', checks: [['SPF', { status: 'fail', summary: 'No SPF record', fix: 'Add one' }]] }, '2026-09-25');
  assert.ok(html.includes('&lt;x&gt;') && html.includes('1 to fix now'));
});

test('DKIM key detection ignores revoked keys', () => {
  assert.ok(isDkimKey('v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA'));
  assert.ok(!isDkimKey('v=DKIM1; p='));
  assert.ok(!isDkimKey('v=spf1 -all'));
});
