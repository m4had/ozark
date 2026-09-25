import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { crawlAndAudit, summarise, renderHtml } from '../audit.mjs';

const dir = path.join(import.meta.dirname, 'fixture');

test('crawls same-site pages, finds seeded issues, renders report', async () => {
  const server = http.createServer(async (req, res) => {
    let body;
    try {
      body = await readFile(path.join(dir, path.basename(req.url === '/' ? 'index.html' : req.url)));
    } catch {
      return res.writeHead(404).end();
    }
    res.writeHead(200, { 'content-type': 'text/html' }).end(body);
  }).listen(0);
  const url = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch();
  try {
    const pages = await crawlAndAudit(url, 10, browser);
    const urls = pages.map((p) => p.url);
    assert.ok(urls.some((u) => u.endsWith('/about.html')), 'same-site link followed');
    assert.ok(urls.every((u) => u.startsWith(url)), 'external link must not be followed');
    const ids = summarise(pages).map((i) => i.id);
    for (const id of ['color-contrast', 'image-alt', 'label', 'link-name', 'html-has-lang', 'document-title', 'button-name']) {
      assert.ok(ids.includes(id), `expected ${id} in ${ids}`);
    }
    const html = renderHtml({ url, client: '<b>x</b>', pages, issues: summarise(pages), date: '2026-09-25' });
    assert.match(html, /not<\/strong> a certificate/);
    assert.ok(!html.includes('<b>x</b>'), 'client name must be escaped');
    assert.match(html, /Images are missing a text description/);
  } finally {
    await browser.close();
    server.close();
  }
});
