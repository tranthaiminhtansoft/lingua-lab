import { test, expect } from '@playwright/test';
import { readFile, readdir } from 'node:fs/promises';
import { verifyGrammarPractice, grammarCases } from '../scripts/release/verify-grammar-practice.mjs';
import { monitorBrowser } from '../scripts/release/verify-site-browser.mjs';

test('production Grammar verifier exercises every question type, links, refresh and mobile layout', async ({ browser, baseURL }, testInfo) => {
  test.setTimeout(180_000);
  expect(grammarCases).toHaveLength(17);
  const directory = testInfo.outputPath('verification');
  const monitor = monitorBrowser(browser, directory);
  const results = await verifyGrammarPractice(monitor.browser, new URL(baseURL), { evidenceDirectory: directory });
  expect(results).toHaveLength(4);
  expect(results.filter(({ passed }) => !passed)).toEqual([]);
  expect(monitor.results().filter(({ passed }) => !passed)).toEqual([]);
  const report = JSON.parse(await readFile(`${directory}/grammar-results.json`, 'utf8'));
  expect(report.cases).toHaveLength(17);
  expect(report.cases.every(({ content, accordion }) => content && accordion)).toBe(true);
});

test('production Grammar verifier rejects corrupted deployed question answers and saves evidence', async ({ browser, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Negative content regression runs once; positive suite covers all engines');
  test.setTimeout(180_000);
  const damagedBrowser = {
    async newPage(options) {
      const page = await browser.newPage(options);
      await page.addInitScript(() => {
        const observer = new MutationObserver(() => {
          const answer = document.querySelector('#yes-no-nouns .question-reply .grammar-example-translation');
          if (answer && answer.textContent !== 'WRONG DEPLOYED ANSWER') answer.textContent = 'WRONG DEPLOYED ANSWER';
        });
        observer.observe(document, { childList: true, subtree: true });
      });
      return page;
    },
  };
  const directory = testInfo.outputPath('verification');
  const results = await verifyGrammarPractice(damagedBrowser, new URL(baseURL), { evidenceDirectory: directory });
  const content = results.find(({ name }) => name.startsWith('Grammar question content'));
  expect(content.passed).toBe(false);
  expect(content.detail).toContain('question/answer translations');
  expect((await readdir(directory)).some((path) => path.endsWith('.png'))).toBe(true);
  expect(JSON.parse(await readFile(`${directory}/grammar-results.json`, 'utf8')).results.some(({ passed }) => !passed)).toBe(true);
});
