import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

export async function createSiteManifest(directory, sourceSha) {
  assert.match(sourceSha ?? '', /^[a-f\d]{40}$/i, 'Candidate SHA is required');
  const files = [];
  async function walk(relative = '') {
    for (const entry of await readdir(resolve(directory, relative), { withFileTypes: true })) {
      const path = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory()) await walk(path);
      else {
        assert.ok(entry.isFile(), `Unsupported artifact entry: ${path}`);
        const bytes = await readFile(resolve(directory, path));
        files.push({ path, size: bytes.length, sha256: sha256(bytes) });
      }
    }
  }
  await walk();
  assert.ok(files.length, 'Candidate artifact is empty');
  return { version: 1, sourceSha, files: files.sort((a, b) => a.path.localeCompare(b.path)) };
}

export function validateManifest(manifest, sourceSha) {
  assert.equal(manifest?.version, 1, 'Unsupported candidate manifest');
  assert.match(sourceSha ?? '', /^[a-f\d]{40}$/i, 'Candidate SHA is required');
  assert.equal(manifest.sourceSha, sourceSha, 'Candidate manifest SHA mismatch');
  assert.ok(Array.isArray(manifest.files) && manifest.files.length, 'Candidate manifest is empty');
  const paths = new Set();
  for (const file of manifest.files) {
    assert.equal(typeof file.path, 'string');
    assert.ok(!/[\\?#\x00-\x1f]/.test(file.path) && file.path.split('/').every((segment) => segment && segment !== '.' && segment !== '..'), `Unsafe manifest path: ${file.path}`);
    assert.ok(!paths.has(file.path), `Duplicate manifest path: ${file.path}`);
    assert.ok(Number.isSafeInteger(file.size) && file.size >= 0, `Invalid file size: ${file.path}`);
    assert.match(file.sha256, /^[a-f\d]{64}$/i, `Invalid digest: ${file.path}`);
    paths.add(file.path);
  }
  for (const required of ['index.html', '404.html', 'release-identity.json', 'docs/index.html']) assert.ok(paths.has(required), `Candidate artifact is missing ${required}`);
  assert.ok(manifest.files.some(({ path }) => path.startsWith('assets/') && path.endsWith('.js')), 'Candidate JavaScript assets are missing');
  assert.ok(manifest.files.some(({ path }) => path.startsWith('assets/') && path.endsWith('.css')), 'Candidate CSS assets are missing');
}

export async function verifySiteAssets(deploymentUrl, manifest, sourceSha, { fetchFile = fetch } = {}) {
  validateManifest(manifest, sourceSha);
  const files = [];
  let next = 0;
  async function worker() {
    while (next < manifest.files.length) {
      const expected = manifest.files[next++];
      try {
        const url = new URL(expected.path.split('/').map(encodeURIComponent).join('/'), deploymentUrl);
        const response = await fetchFile(url, { cache: 'no-store', signal: AbortSignal.timeout(15_000) });
        assert.ok(response.ok, `HTTP ${response.status}`);
        assert.equal(response.url ? new URL(response.url).origin : url.origin, url.origin, 'Unexpected file origin');
        assert.equal(response.url ? new URL(response.url).pathname : url.pathname, url.pathname, 'Unexpected file redirect');
        const bytes = Buffer.from(await response.arrayBuffer());
        assert.equal(bytes.length, expected.size, 'File size differs from candidate');
        assert.equal(sha256(bytes), expected.sha256, 'SHA-256 differs from candidate');
        files.push({ path: expected.path, passed: true });
      } catch (error) { files.push({ path: expected.path, passed: false, detail: error.message }); }
    }
  }
  await Promise.all(Array.from({ length: Math.min(6, manifest.files.length) }, worker));
  const failures = files.filter(({ passed }) => !passed);
  return {
    name: 'Deployed files match candidate SHA-256 manifest', passed: failures.length === 0,
    detail: failures.length ? failures.slice(0, 3).map(({ path, detail }) => `${path}: ${detail}`).join('; ') : `${files.length}/${manifest.files.length} files match the separately retained candidate manifest`,
    files: files.sort((a, b) => a.path.localeCompare(b.path)),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const manifest = await createSiteManifest(process.env.SITE_DIST_DIR ?? 'dist', process.env.SOURCE_SHA);
  const output = process.env.SITE_MANIFEST_PATH ?? 'release-assets/site-manifest.json';
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(manifest, null, 2));
  console.log(`Recorded ${manifest.files.length} candidate file digests in ${output}`);
}
