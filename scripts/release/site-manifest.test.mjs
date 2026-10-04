import { test } from 'vitest';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { createSiteManifest, validateManifest, verifySiteAssets, sha256 } from './site-manifest.mjs';

const sourceSha = 'a'.repeat(40);
const contents = { 'index.html': '<html>candidate</html>', '404.html': 'fallback', 'release-identity.json': JSON.stringify({ sourceSha }), 'docs/index.html': 'docs', 'assets/app.js': 'console.log(1)', 'assets/app.css': 'body{}' };
const manifest = () => ({ version: 1, sourceSha, files: Object.entries(contents).map(([path, body]) => ({ path, size: Buffer.byteLength(body), sha256: sha256(body) })) });
const deployment = new URL('https://example.test/lingua-lab/');
const serve = async (url) => new Response(contents[url.pathname.replace('/lingua-lab/', '')], { status: 200 });

test('creates digests from exact candidate bytes, including nested docs', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'manifest-test-'));
  try {
    for (const [path, body] of Object.entries(contents)) {
      await mkdir(dirname(join(directory, path)), { recursive: true });
      await writeFile(join(directory, path), body);
    }
    const result = await createSiteManifest(directory, sourceSha);
    validateManifest(result, sourceSha);
    assert.deepEqual(result.files, manifest().files.sort((a, b) => a.path.localeCompare(b.path)));
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('accepts only deployed bytes matching the trusted candidate manifest', async () => {
  assert.equal((await verifySiteAssets(deployment, manifest(), sourceSha, { fetchFile: serve })).passed, true);
  const result = await verifySiteAssets(deployment, manifest(), sourceSha, {
    fetchFile: async (url) => url.pathname.endsWith('.js') ? new Response('console.log(2)') : serve(url),
  });
  assert.equal(result.passed, false);
  assert.match(result.detail, /SHA-256 differs/);
});

test('rejects missing files and HTTP-200 generic fallback pages', async () => {
  for (const response of [new Response('missing', { status: 404 }), new Response('<html>generic fallback</html>')]) {
    const result = await verifySiteAssets(deployment, manifest(), sourceSha, {
      fetchFile: async (url) => url.pathname.endsWith('.css') ? response : serve(url),
    });
    assert.equal(result.passed, false);
    assert.equal(result.files.filter(({ passed }) => !passed).length, 1);
  }
});

test('rejects wrong candidate, duplicate/traversal paths and incomplete manifests', () => {
  assert.throws(() => validateManifest(manifest(), 'b'.repeat(40)), /SHA mismatch/);
  for (const path of ['../index.html', '/index.html', 'assets/../app.js', 'index.html?fake']) {
    const bad = manifest(); bad.files[0].path = path;
    assert.throws(() => validateManifest(bad, sourceSha), /Unsafe/);
  }
  const duplicate = manifest(); duplicate.files.push(duplicate.files[0]);
  assert.throws(() => validateManifest(duplicate, sourceSha), /Duplicate/);
  const missing = manifest(); missing.files = missing.files.filter(({ path }) => !path.endsWith('.css'));
  assert.throws(() => validateManifest(missing, sourceSha), /CSS assets are missing/);
});
