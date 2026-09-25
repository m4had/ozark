#!/usr/bin/env node
// Exit non-zero when the scan found issues at or above the chosen impact. Usage: node gate.mjs results.json critical
import { readFileSync } from 'node:fs';

const ORDER = ['minor', 'moderate', 'serious', 'critical'];

export function gate(issues, failOn) {
  if (failOn === 'none') return [];
  const min = ORDER.indexOf(failOn);
  if (min < 0) throw new Error(`fail-on must be one of ${ORDER.slice(1).join(', ')} or none`);
  return issues.filter((i) => ORDER.indexOf(i.impact) >= min);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [file, failOn = 'critical'] = process.argv.slice(2);
  const { issues } = JSON.parse(readFileSync(file, 'utf8'));
  const bad = gate(issues, failOn);
  for (const i of bad) console.log(`::error::${i.impact}: ${i.help} (${i.count} instance(s), rule ${i.id})`);
  console.log(`${issues.length} issue type(s) found; ${bad.length} at or above "${failOn}".`);
  process.exit(bad.length ? 1 : 0);
}
