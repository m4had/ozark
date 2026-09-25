import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, renderLegalHtml } from '../legal-check.mjs';

const byName = (rs) => Object.fromEntries(rs.map((r) => [r.name, r.status]));

test('finds required information', () => {
  const r = byName(evaluate({
    texts: ['Acme Ltd, 1 High St, Leeds LS1 4AP. hello@acme.co.uk. Company number 01234567. VAT GB123456789. £20'],
    links: [{ href: 'https://a/returns', text: 'Returns' }, { href: 'https://a/terms', text: 'Terms & conditions' },
      { href: 'https://a/privacy', text: 'Privacy' }, { href: 'https://a/cookies', text: 'Cookie policy' },
      { href: 'https://a/delivery', text: 'Delivery' }, { href: 'https://a/contact', text: 'Contact us' }],
  }));
  assert.ok(Object.values(r).every((s) => s === 'pass'), JSON.stringify(r));
});

test('flags missing information and ex-VAT pricing', () => {
  const r = byName(evaluate({ texts: ['Great prices from £10 + VAT'], links: [] }));
  assert.equal(r['Geographic address (UK postcode)'], 'fail');
  assert.equal(r['Returns / cancellation policy'], 'fail');
  assert.equal(r['Delivery information'], 'warn');
  assert.equal(r['Company number (if a limited company)'], 'info');
  assert.equal(r['Prices include VAT for consumers'], 'warn');
  assert.match(renderLegalHtml('https://x', evaluate({ texts: [''], links: [] }), 1, 'd'), /item\(s\) look missing/);
});
