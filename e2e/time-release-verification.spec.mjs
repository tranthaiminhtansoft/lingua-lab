import { test, expect } from '@playwright/test';
import { readFile, readdir } from 'node:fs/promises';
import { verifyTimeVocabulary } from '../scripts/release/verify-time-vocabulary.mjs';
import { monitorBrowser } from '../scripts/release/verify-site-browser.mjs';

test('production Time verifier checks navigation, calendar, interactive clock and mobile UI', async ({ browser, baseURL }, testInfo) => {
  test.setTimeout(120_000);
  const directory = testInfo.outputPath('verification');
  const monitor = monitorBrowser(browser, directory);
  const results = await verifyTimeVocabulary(monitor.browser, new URL(baseURL), { evidenceDirectory: directory });
  expect(results).toHaveLength(4);
  expect(results.filter(({ passed }) => !passed)).toEqual([]);
  expect(monitor.results().filter(({ passed }) => !passed)).toEqual([]);
  expect(JSON.parse(await readFile(`${directory}/time-results.json`, 'utf8')).results).toEqual(results);
});

test('production Time verifier rejects corrupted clock readings and saves failure evidence', async ({ browser, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Run the negative regression once');
  test.setTimeout(120_000);
  const damagedBrowser = {
    async newPage() {
      const page = await browser.newPage();
      await page.addInitScript(() => {
        const observer = new MutationObserver(() => {
          const reading = document.querySelector('.time-combined-reading [lang="ja-Latn"]');
          if (reading) reading.setAttribute('aria-label', 'wrong deployed reading');
        });
        observer.observe(document, { childList: true, subtree: true });
      });
      return page;
    },
  };
  const directory = testInfo.outputPath('verification');
  const results = await verifyTimeVocabulary(damagedBrowser, new URL(baseURL), { evidenceDirectory: directory });
  expect(results.find(({ name }) => name.startsWith('Time interactive clock')).passed).toBe(false);
  expect((await readdir(directory)).some((file) => file.startsWith('time-failure-') && file.endsWith('.png'))).toBe(true);
  expect(JSON.parse(await readFile(`${directory}/time-results.json`, 'utf8')).results.some(({ passed }) => !passed)).toBe(true);
});
