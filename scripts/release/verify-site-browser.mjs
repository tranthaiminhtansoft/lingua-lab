import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

export function monitorBrowser(browser, evidenceDirectory) {
  const events = [];
  let pages = 0;
  let screenshots = 0;
  const trackedBrowser = {
    async newPage(options) {
      const page = await browser.newPage(options);
      pages += 1;
      page.setDefaultTimeout(10_000);
      const errors = [];
      const record = (event) => { const detail = { page: page.url(), ...event }; events.push(detail); errors.push(detail); };
      const onError = (error) => record({ type: 'javascript', detail: error.message });
      const onFailed = (request) => {
        if (['script', 'stylesheet'].includes(request.resourceType())) record({ type: 'resource', url: request.url(), detail: request.failure()?.errorText ?? 'Request failed' });
      };
      const onResponse = (response) => {
        const type = response.request().resourceType();
        if (!['script', 'stylesheet'].includes(type)) return;
        const mime = response.headers()['content-type'] ?? '';
        if (response.status() >= 400 || type === 'stylesheet' && !mime.includes('text/css') || type === 'script' && !/(?:javascript|ecmascript)/i.test(mime)) {
          record({ type: 'resource', url: response.url(), detail: `HTTP ${response.status()}, Content-Type ${mime || 'missing'}` });
        }
      };
      page.on('pageerror', onError);
      page.on('requestfailed', onFailed);
      page.on('response', onResponse);
      const close = page.close.bind(page);
      page.close = async () => {
        if (errors.length && screenshots < 10) {
          await mkdir(evidenceDirectory, { recursive: true });
          await page.screenshot({ path: resolve(evidenceDirectory, `browser-errors-${++screenshots}.png`), fullPage: true, timeout: 5000 }).catch(() => {});
        }
        page.off('pageerror', onError);
        page.off('requestfailed', onFailed);
        page.off('response', onResponse);
        await close();
      };
      return page;
    },
  };
  return {
    browser: trackedBrowser, events,
    results() {
      return [['Browser JavaScript errors', 'javascript'], ['Browser JS/CSS loading', 'resource']].map(([name, type]) => {
        const errors = events.filter((event) => event.type === type);
        return { name, passed: pages > 0 && errors.length === 0, detail: errors.length ? errors.slice(0, 3).map(({ url, detail }) => `${url ?? ''} ${detail}`).join('; ') : `${pages} browser pages monitored; no ${type} errors` };
      });
    },
  };
}

const documentation = [
  ['index.html', 'Start here'], ['product.html', 'Product guide'], ['reference.html', 'Reference'],
  ['topology.html', 'Application topology'], ['delivery.html', 'CI and delivery system'],
  ['procedures.html', 'Procedures'], ['pre-release.html', 'Pre-release'], ['release.html', 'Release'],
  ['post-release.html', 'Post-release'], ['rollback.html', 'Rollback and recovery'],
];
const diagrams = {
  'topology-diagram.html': 'Lingua Lab: Browser Runtime and GitHub Actions Control Plane',
  'delivery-workflow.html': 'Configured Release Workflow', 'ci-workflow.html': 'Configured PR-only Product CI',
};

export async function verifySiteBrowser(browser, deploymentUrl, { evidenceDirectory = 'release-verification-evidence' } = {}) {
  const results = [];
  const details = [];
  let screenshot = 0;
  async function check(name, run) {
    const page = await browser.newPage();
    page.setDefaultTimeout(10_000);
    try { results.push({ name, passed: true, detail: await run(page) }); }
    catch (error) {
      const detail = error.message.replace(/\s+/g, ' ').slice(0, 800);
      results.push({ name, passed: false, detail });
      details.push({ name, url: page.url(), error: error.message });
      await mkdir(evidenceDirectory, { recursive: true });
      await page.screenshot({ path: resolve(evidenceDirectory, `site-failure-${++screenshot}.png`), fullPage: true, timeout: 5000 }).catch(() => {});
    } finally { await page.close(); }
  }
  async function confirmPath(page, path) {
    const expected = new URL(path, deploymentUrl);
    await page.waitForURL((url) => url.origin === expected.origin && url.pathname === expected.pathname);
  }
  for (const lesson of ['Kana', 'Grammar', 'Vocabulary']) {
    await check(`Navigation: Home → Nihongo → ${lesson}${lesson === 'Kana' ? '' : ' → topic'}`, async (page) => {
      await page.goto(deploymentUrl.toString(), { waitUntil: 'networkidle' });
      await page.getByRole('link', { name: 'Explore Nihongo learning path', exact: true }).click();
      await confirmPath(page, 'nihongo-o-benkyuo');
      await page.getByRole('heading', { level: 1, name: 'Nihongo O Benkyou', exact: true }).waitFor({ state: 'visible' });
      await page.getByRole('link', { name: `Start ${lesson}`, exact: true }).click();
      await confirmPath(page, `nihongo-o-benkyuo/${lesson.toLowerCase()}`);
      await page.getByRole('heading', { level: 1, name: lesson }).waitFor({ state: 'visible' });
      if (lesson !== 'Kana') {
        await page.getByRole('link', { name: /Explore this topic/ }).click();
        await confirmPath(page, `nihongo-o-benkyuo/${lesson.toLowerCase()}/first-introductions`);
        await page.getByRole('heading', { level: 1, name: 'First introductions' }).waitFor({ state: 'visible' });
        await page.locator(lesson === 'Grammar' ? '#patterns' : '#meeting-phrases').waitFor({ state: 'visible' });
      } else await page.locator('#practice').waitFor({ state: 'visible' });
      return `Clicked the deployed links; final URL ${page.url()}`;
    });
  }
  await check('Legacy Kana redirect and refresh', async (page) => {
    await page.goto(new URL('lessons/kana', deploymentUrl).toString(), { waitUntil: 'networkidle' });
    await confirmPath(page, 'nihongo-o-benkyuo/kana');
    await page.locator('#practice').waitFor({ state: 'visible' });
    await page.reload({ waitUntil: 'networkidle' });
    await confirmPath(page, 'nihongo-o-benkyuo/kana');
    await page.locator('#practice').waitFor({ state: 'visible' });
    return 'Legacy URL redirects to canonical Kana; refresh retains the route';
  });

  const links = new Set();
  let images = 0;
  const loadedDiagrams = new Set();
  const pageErrors = [];
  const assetErrors = [];
  for (const [file, heading] of documentation) {
    await check(`Docs page: ${file}`, async (page) => {
      const url = new URL(`docs/${file}`, deploymentUrl);
      const response = await page.goto(url.toString(), { waitUntil: 'networkidle' });
      assert.equal(response?.status(), 200, `Documentation ${file} did not return HTTP 200`);
      assert.equal(new URL(page.url()).pathname, url.pathname, 'Documentation redirected unexpectedly');
      await page.getByRole('heading', { level: 1, name: heading, exact: true }).waitFor({ state: 'visible' });
      for (const href of await page.locator('a[href]').evaluateAll((anchors) => anchors.map((anchor) => anchor.href))) {
        const target = new URL(href);
        if (target.origin !== deploymentUrl.origin) continue;
        assert.ok(target.pathname.startsWith(deploymentUrl.pathname), `Link escapes the deployed base path: ${href}`);
        if (target.pathname.includes('/docs/')) { target.hash = ''; links.add(target.toString()); }
      }
      for (const image of await page.locator('img').all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((img) => new Promise((done, reject) => {
          if (img.complete) return img.naturalWidth > 0 ? done() : reject(new Error(`Broken image: ${img.src}`));
          const timer = setTimeout(() => reject(new Error(`Image loading timeout: ${img.src}`)), 10_000);
          img.addEventListener('load', () => { clearTimeout(timer); done(); }, { once: true });
          img.addEventListener('error', () => { clearTimeout(timer); reject(new Error(`Broken image: ${img.src}`)); }, { once: true });
        }));
        images += 1;
      }
      for (const iframe of await page.locator('iframe').all()) {
        const src = new URL(await iframe.getAttribute('src'), url);
        const name = src.pathname.split('/').at(-1);
        assert.equal(src.origin, deploymentUrl.origin);
        assert.ok(src.pathname.startsWith(new URL('docs/assets/', deploymentUrl).pathname) && diagrams[name], `Unexpected diagram URL ${src}`);
        await iframe.scrollIntoViewIfNeeded();
        const frame = await iframe.contentFrame();
        await frame.getByRole('heading', { level: 1, name: diagrams[name], exact: true }).waitFor({ state: 'visible' });
        await frame.locator('svg[aria-labelledby~="archify-diagram-title"]').waitFor({ state: 'visible' });
        loadedDiagrams.add(name);
      }
      return 'HTML, heading, internal links, images and embedded diagrams checked';
    });
    const result = results.pop();
    if (!result.passed) { pageErrors.push(`${file}: ${result.detail}`); assetErrors.push(`${file}: ${result.detail}`); }
  }
  for (const url of links) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      assert.ok(response.ok, `HTTP ${response.status}`);
      assert.ok(response.headers.get('content-type')?.includes('text/html'), 'Link did not return HTML');
    } catch (error) { pageErrors.push(`${url}: ${error.message}`); }
  }
  if (images !== 4) assetErrors.push(`Expected 4 release screenshots; found ${images}`);
  if (loadedDiagrams.size !== 3) assetErrors.push(`Expected 3 diagrams; found ${loadedDiagrams.size}`);
  results.push({ name: 'Standalone documentation and internal links', passed: pageErrors.length === 0, detail: pageErrors.length ? pageErrors.slice(0, 3).join('; ') : `${documentation.length} pages and ${links.size} internal links checked` });
  results.push({ name: 'Documentation images and diagrams', passed: assetErrors.length === 0, detail: assetErrors.length ? assetErrors.slice(0, 3).join('; ') : `${images} screenshots decoded; ${loadedDiagrams.size} diagrams rendered` });
  return { results, details };
}
