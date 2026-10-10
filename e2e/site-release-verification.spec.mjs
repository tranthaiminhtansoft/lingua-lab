import { test, expect } from '@playwright/test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { monitorBrowser, verifySiteBrowser } from '../scripts/release/verify-site-browser.mjs';
import { routes, checkRoute } from '../scripts/release/verify-deployed-site.mjs';

test('documentation iframe resize remains stable without browser errors', async ({ browser, baseURL }) => {
  test.setTimeout(120_000);
  const directory = await mkdtemp(join(tmpdir(), 'docs-resize-'));
  const monitor = monitorBrowser(browser, directory);
  const page = await monitor.browser.newPage();
  try {
    for (const file of ['topology.html', 'delivery.html']) {
      await page.goto(new URL(`docs/${file}`, baseURL).href, { waitUntil: 'networkidle' });
      for (const iframe of await page.locator('iframe').all()) {
        await iframe.scrollIntoViewIfNeeded();
        await iframe.contentFrame().locator('svg[aria-labelledby~="archify-diagram-title"]').waitFor({ state: 'visible' });
      }
      for (const width of [1280, 620, 360, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        await expect.poll(() => page.locator('iframe').evaluateAll((frames) => frames.every((frame) => {
          const doc = frame.contentDocument;
          if (!doc?.body || !doc.documentElement) return false;
          const contentHeight = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
          return frame.getBoundingClientRect().height + 1 >= contentHeight;
        }))).toBe(true);
        await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
      }
      await page.locator('iframe').evaluateAll((frames) => Promise.all(frames.map((frame) => frame.contentDocument?.fonts?.ready)));
      await page.evaluate(() => new Promise((done) => {
        let previous = '';
        let stableFrames = 0;
        const checkLayout = () => {
          const current = [...document.querySelectorAll('iframe')]
            .map((frame) => frame.getBoundingClientRect().height)
            .join(',');
          stableFrames = current === previous ? stableFrames + 1 : 0;
          previous = current;
          if (stableFrames >= 3) done();
          else requestAnimationFrame(checkLayout);
        };
        requestAnimationFrame(checkLayout);
      }));
      const heightSamples = await page.locator('iframe').evaluateAll(async (frames) => {
        const samples = [];
        for (let index = 0; index < 10; index++) {
          await new Promise((done) => requestAnimationFrame(done));
          samples.push(frames.map((frame) => frame.getBoundingClientRect().height));
        }
        return samples;
      });
      expect(new Set(heightSamples.map((sample) => sample.join(','))).size).toBe(1);
    }
    await page.close();
    expect(monitor.results().filter(({ passed }) => !passed)).toEqual([]);
  } finally { if (!page.isClosed()) await page.close(); await rm(directory, { recursive: true, force: true }); }
});

test('release verifies real navigation, direct routes, refresh, docs and browser resources', async ({ browser, baseURL }) => {
  test.setTimeout(120_000);
  const directory = await mkdtemp(join(tmpdir(), 'site-release-'));
  try {
    const monitor = monitorBrowser(browser, directory);
    const url = new URL(baseURL);
    for (const route of routes) await checkRoute(monitor.browser, url, route, { reload: true });
    const report = await verifySiteBrowser(monitor.browser, url, { evidenceDirectory: directory });
    expect(report.results).toHaveLength(6);
    expect(report.results.filter(({ passed }) => !passed)).toEqual([]);
    expect(monitor.results().filter(({ passed }) => !passed)).toEqual([]);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('release rejects broken docs images and detects runtime and CSS errors', async ({ browser, baseURL }) => {
  test.setTimeout(120_000);
  const directory = await mkdtemp(join(tmpdir(), 'broken-site-release-'));
  const monitor = monitorBrowser(browser, directory);
  const brokenBrowser = {
    async newPage() {
      const page = await monitor.browser.newPage();
      await page.route('**/docs/assets/*.jpg', (route) => route.fulfill({ status: 404, body: 'missing screenshot' }));
      await page.route('**/assets/*.css', (route) => route.abort());
      await page.addInitScript(() => { setTimeout(() => { throw new Error('Injected release runtime failure'); }, 100); });
      return page;
    },
  };
  try {
    const report = await verifySiteBrowser(brokenBrowser, new URL(baseURL), { evidenceDirectory: directory });
    expect(report.results.find(({ name }) => name === 'Documentation images and diagrams').passed).toBe(false);
    expect(monitor.results().every(({ passed }) => !passed)).toBe(true);
    expect((await readFile(join(directory, 'site-failure-1.png'))).length).toBeGreaterThan(0);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
