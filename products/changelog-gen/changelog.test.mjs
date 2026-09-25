import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCommit, render } from './changelog.mjs';

test('parses types, scopes and breaking changes', () => {
  assert.deepEqual(parseCommit('feat(api): add export', 'abcdef123'),
    { group: 'feat', scope: 'api', subject: 'Add export', hash: 'abcdef123', breaking: false });
  assert.equal(parseCommit('fix!: drop node 16').group, 'breaking');
  assert.equal(parseCommit('refactor: x\n\nBREAKING CHANGE: y').group, 'breaking');
  assert.equal(parseCommit('chore: bump deps'), null);
  assert.equal(parseCommit('Random message').group, 'other');
});

test('renders grouped markdown', () => {
  const md = render([parseCommit('feat: a', '1111111aaa'), parseCommit('fix(ui): b'), null], { version: '1.0.0', date: '2026-09-25' });
  assert.match(md, /^## 1\.0\.0 \(2026-09-25\)/);
  assert.match(md, /### ✨ New features\n\n- A \(1111111\)/);
  assert.match(md, /- \*\*ui:\*\* B/);
  assert.match(render([], { date: 'd' }), /No user-facing changes/);
});
