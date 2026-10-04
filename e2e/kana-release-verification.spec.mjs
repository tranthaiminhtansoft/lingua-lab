import { expect, test } from '@playwright/test';
import { readFile, readdir } from 'node:fs/promises';
import { verifyKanaPractice, practiceCases } from '../scripts/release/verify-kana-practice.mjs';

test('production verifier exercises every Kana glyph, stroke guide, and speech control', async ({ browser, baseURL }, testInfo) => {
  test.setTimeout(180_000);
  expect(practiceCases).toHaveLength(142);
  const checks = await verifyKanaPractice(browser, new URL(baseURL), { evidenceDirectory: testInfo.outputPath('verification') });
  expect(checks.filter(({ passed }) => !passed)).toEqual([]);
  expect(checks).toHaveLength(4);
  const evidence = JSON.parse(await readFile(testInfo.outputPath('verification/kana-results.json'), 'utf8'));
  expect(evidence.glyphResults).toHaveLength(142);
  expect(new Set(evidence.glyphResults.map(({ glyph }) => glyph)).size).toBe(142);
  expect(evidence.glyphResults.every(({ random, strokes, speech }) => random && strokes && speech)).toBe(true);
});

test('production verifier rejects an incomplete deployed Kana pool and saves evidence', async ({ browser, baseURL }, testInfo) => {
  const damagedBrowser = {
    async newPage(options) {
      const page = await browser.newPage(options);
      await page.addInitScript(() => {
        const observer = new MutationObserver(() => {
          const pair = document.querySelector('#tables .kana-pair');
          if (pair) { pair.textContent = 'missing Kana'; observer.disconnect(); }
        });
        observer.observe(document, { childList: true, subtree: true });
      });
      return page;
    },
  };
  const evidenceDirectory = testInfo.outputPath('verification');
  const checks = await verifyKanaPractice(damagedBrowser, new URL(baseURL), { evidenceDirectory });
  expect(checks[0].passed).toBe(false);
  expect(checks[0].detail).toContain('Deployed Kana pool differs from the trusted source');
  const evidence = JSON.parse(await readFile(`${evidenceDirectory}/kana-results.json`, 'utf8'));
  expect(evidence.checked).toBe(0);
  expect(evidence.evidence.length).toBeGreaterThan(0);
  expect((await readdir(evidenceDirectory)).some((name) => name.endsWith('.png'))).toBe(true);
});
