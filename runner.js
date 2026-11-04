import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const TESTS_DIR = 'tests';
const RESULTS_DIR = 'results';
const filter = process.argv[2]; // optional: run only tests whose file name contains this

mkdirSync(RESULTS_DIR, { recursive: true });

const files = readdirSync(TESTS_DIR)
  .filter(f => f.endsWith('.txt'))
  .filter(f => !filter || f.includes(filter))
  .sort();

if (files.length === 0) {
  console.log('No tests found.');
  process.exit(1);
}

const results = [];

for (const file of files) {
  const description = readFileSync(path.join(TESTS_DIR, file), 'utf8').replace(/\s+/g, ' ').trim();
  console.log(`\n=== Running ${file} ===`);

  const started = Date.now();
  const run = spawnSync(process.execPath, ['agent.js', description], { encoding: 'utf8' });
  const seconds = ((Date.now() - started) / 1000).toFixed(1);

  const log = (run.stdout ?? '') + (run.stderr ?? '');
  writeFileSync(path.join(RESULTS_DIR, file.replace('.txt', '.log')), log);

  const status = run.status === 0 ? 'PASS' : 'FAIL';
  const verdictLine = log.split('\n').reverse().find(l => /^(PASS|FAIL):/.test(l)) ?? '';
  console.log(`${status} in ${seconds}s ${verdictLine}`);
  results.push({ file, status, seconds });
}

console.log('\n=========== SUMMARY ===========');
for (const r of results) console.log(`${r.status}  ${r.file}  (${r.seconds}s)`);
const failed = results.filter(r => r.status === 'FAIL').length;
console.log(`\n${results.length - failed} passed, ${failed} failed`);

process.exit(failed ? 1 : 0);