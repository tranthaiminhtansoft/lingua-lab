import { test, expect } from '@playwright/test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { monitorBrowser, verifySiteBrowser } from '../scripts/release/verify-site-browser.mjs';
import { routes, checkRoute } from '../scripts/release/verify-deployed-site.mjs';

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
