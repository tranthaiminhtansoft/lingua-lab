import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const workflow = await readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
const match = workflow.match(/^    paths:\n((?:      - .*\n)+)/m);
assert.ok(match, 'pull_request.paths allowlist must exist');
const patterns = [...match[1].matchAll(/^      - '([^']+)'$/gm)].map((entry) => entry[1]);

const matches = (file) => patterns.some((pattern) => {
  if (pattern.endsWith('/**')) return file.startsWith(pattern.slice(0, -2));
  if (pattern.includes('*')) {
    const escaped = pattern.replace(/[|\\{}()[\]^$+?.]/g, '\\$&').replaceAll('*', '.*');
    return new RegExp(`^${escaped}$`).test(file);
  }
  return file === pattern;
});
const hasMatch = (files) => files.some(matches);

assert.equal(hasMatch(['src/app/App.tsx']), true, 'React product source should run CI');
assert.equal(hasMatch(['public/logo.svg']), true, 'public assets should run CI');
assert.equal(hasMatch(['e2e/smoke.spec.ts']), true, 'browser tests should run CI');
assert.equal(hasMatch(['.github/workflows/ci.yml']), true, 'workflow-only changes should run CI');
assert.equal(hasMatch(['scripts/build-docs.mjs']), true, 'docs build script should run CI');
assert.equal(hasMatch(['README.md', 'docs/architecture.md']), false, 'standalone Markdown docs should skip CI');
assert.equal(hasMatch(['src/business/docs/index.html']), true, 'standalone HTML docs should run CI');
assert.equal(hasMatch(['README.md', 'src/shared/styles/global.css']), true, 'mixed docs and product changes should run CI');
console.log('CI path-filter regression cases passed (8 assertions).');
