import { appendFileSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { verifySiteAssets } from './site-manifest.mjs';
import { monitorBrowser, verifySiteBrowser } from './verify-site-browser.mjs';
import { pathToFileURL } from 'node:url';

export const routes = [
  { name: 'Homepage application marker', path: '', heading: 'Find your language.', selectors: ['a[aria-label="Explore Nihongo learning path"]'], links: [{ selector: 'a[aria-label="Explore Nihongo learning path"]', path: 'nihongo-o-benkyuo' }] },
  { name: 'Kana production route', path: 'nihongo-o-benkyuo/kana', heading: 'Kana', selectors: ['#basics', '#practice', '[data-testid="practice-glyph"]'] },
  { name: 'Grammar production route', path: 'nihongo-o-benkyuo/grammar', heading: 'Grammar', selectors: ['a[href$="/nihongo-o-benkyuo/grammar/first-introductions"]'] },
  { name: 'Vocabulary production route', path: 'nihongo-o-benkyuo/vocabulary', heading: 'Vocabulary', selectors: ['a[href$="/nihongo-o-benkyuo/vocabulary/first-introductions"]'] },
  { name: 'First introductions Grammar topic', path: 'nihongo-o-benkyuo/grammar/first-introductions', heading: 'First introductions', selectors: ['#opening', '#patterns'] },
  { name: 'First introductions Vocabulary topic', path: 'nihongo-o-benkyuo/vocabulary/first-introductions', heading: 'First introductions', selectors: ['#meeting-phrases', '#usage-notes'] },
  { name: 'Nihongo production route', path: 'nihongo-o-benkyuo', heading: 'Nihongo O Benkyou', selectors: ['.lesson-card a[href$="/nihongo-o-benkyuo/kana"]'] },
  { name: 'Time Vocabulary topic', path: 'nihongo-o-benkyuo/vocabulary/time', heading: 'Time', selectors: ['#time-months', '#time-dates', '#time-clock', '.time-interactive-clock'], releaseOnly: true },
  { name: 'Grammar Question types topic', path: 'nihongo-o-benkyuo/grammar/question-types', heading: 'Question types', selectors: ['#yes-no', '#wh', '.question-reading-guide'], releaseOnly: true },
];

export const routesForVerification = (extended = false) => routes.filter((route) => extended || !route.releaseOnly);

export function verifyIdentity(identity, sourceSha) {
  if (!/^[a-f\d]{40}$/i.test(sourceSha ?? '')) throw new Error(`expected candidate SOURCE_SHA to be a 40-character commit SHA, received ${sourceSha ?? 'missing'}`);
  if (!identity || identity.sourceSha !== sourceSha) throw new Error(`expected ${sourceSha}, received ${identity?.sourceSha ?? 'missing'}`);
  return identity.sourceSha;
}

async function assertRouteContent(page, route, deploymentUrl) {
  await page.getByRole('heading', { level: 1, name: route.heading, exact: false }).waitFor({ state: 'visible' });
  for (const selector of route.selectors) await page.locator(selector).waitFor({ state: 'visible' });
  for (const link of route.links ?? []) {
    const href = await page.locator(link.selector).getAttribute('href');
    if (!href || new URL(href, deploymentUrl).pathname !== new URL(link.path, deploymentUrl).pathname) {
      throw new Error(`unexpected link target for ${link.selector}: ${href ?? 'missing'}`);
    }
  }
}

export async function checkRoute(browser, deploymentUrl, route, { reload = false } = {}) {
  const url = new URL(route.path, deploymentUrl);
  const allowsSpaFallback = route.path !== '';
  const isSuccessfulRouteResponse = (candidate) => candidate?.ok() || (allowsSpaFallback && candidate?.status() === 404);
  const page = await browser.newPage();
  let documentResponse;
  const trackDocument = (response) => {
    if (response.request().resourceType() === 'document' && response.frame() === page.mainFrame()) documentResponse = response;
  };
  page.on?.('response', trackDocument);
  try {
    const response = await page.goto(url.toString(), { waitUntil: 'networkidle' }) ?? documentResponse;
    if (!isSuccessfulRouteResponse(response)) throw new Error(`HTTP ${response?.status() ?? 'no response'}`);
    await assertRouteContent(page, route, deploymentUrl);
    if (new URL(page.url()).pathname !== url.pathname) throw new Error(`unexpected final path ${new URL(page.url()).pathname}`);
    if (reload) {
      documentResponse = undefined;
      const refreshedResponse = await page.reload({ waitUntil: 'networkidle' }) ?? documentResponse;
      if (!isSuccessfulRouteResponse(refreshedResponse)) throw new Error(`refresh HTTP ${refreshedResponse?.status() ?? 'no response'}`);
      await assertRouteContent(page, route, deploymentUrl);
      if (new URL(page.url()).pathname !== url.pathname) throw new Error(`unexpected refreshed path ${new URL(page.url()).pathname}`);
    }
    return `HTTP ${response.status()}, route-specific content verified${reload ? ', refresh verified' : ''}`;
  } finally {
    page.off?.('response', trackDocument);
    await page.close();
  }
}

async function main() {
  const pageUrl = process.env.PAGE_URL;
  const sourceRef = process.env.SOURCE_REF ?? 'unknown';
  const sourceSha = process.env.SOURCE_SHA ?? 'unknown';
  const verifyKana = process.env.VERIFY_KANA_PRACTICE === 'true';
  const extended = process.env.VERIFY_SITE_EXTENDED === 'true';
  const activeRoutes = routesForVerification(extended);
  const evidenceDirectory = process.env.VERIFY_EVIDENCE_DIR ?? 'release-verification-evidence';
  const save = async (name, data) => {
    await mkdir(evidenceDirectory, { recursive: true });
    await writeFile(resolve(evidenceDirectory, name), JSON.stringify(data, null, 2));
  };
  const checks = [];
  const record = (name, passed, detail) => {
    checks.push({ name, passed, detail });
    console.log(`${passed ? 'PASS' : 'FAIL'}: ${name}${detail ? ` — ${detail}` : ''}`);
  };

  if (!pageUrl) {
    record('Deployed build identity matches candidate', false, 'PAGE_URL is required');
    for (const { name } of activeRoutes) record(name, false, 'skipped because PAGE_URL is missing');
  } else {
    const deploymentUrl = new URL(pageUrl);
    if (!deploymentUrl.pathname.endsWith('/')) deploymentUrl.pathname += '/';
    if (extended) {
      try {
        const manifest = JSON.parse(await readFile(process.env.SITE_MANIFEST_PATH ?? 'candidate-manifest/site-manifest.json', 'utf8'));
        const result = await verifySiteAssets(deploymentUrl, manifest, sourceSha);
        record(result.name, result.passed, result.detail);
        await save('asset-results.json', result);
      } catch (error) { record('Deployed files match candidate SHA-256 manifest', false, error.message); }
    }
    try {
      const response = await fetch(new URL('release-identity.json', deploymentUrl));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      record('Deployed build identity matches candidate', true, verifyIdentity(await response.json(), sourceSha));
    } catch (error) {
      record('Deployed build identity matches candidate', false, error.message);
    }

    let browser;
    let monitor;
    try {
      const { chromium } = await import('playwright');
      browser = await chromium.launch({ headless: true });
      monitor = extended ? monitorBrowser(browser, evidenceDirectory) : null;
      const checkedBrowser = monitor?.browser ?? browser;
      for (const route of activeRoutes) {
        try {
          record(route.name, true, await checkRoute(checkedBrowser, deploymentUrl, route, { reload: extended || route.name === 'First introductions Grammar topic' }));
        } catch (error) {
          record(route.name, false, error.message);
        }
      }
      if (extended) {
        try {
          const report = await verifySiteBrowser(checkedBrowser, deploymentUrl, { evidenceDirectory });
          for (const check of report.results) record(check.name, check.passed, check.detail);
          await save('site-results.json', report);
        } catch (error) { record('Extended site browser verification', false, error.message); }
        try {
          const { verifyGrammarPractice } = await import('./verify-grammar-practice.mjs');
          for (const check of await verifyGrammarPractice(checkedBrowser, deploymentUrl, { evidenceDirectory })) record(check.name, check.passed, check.detail);
        } catch (error) { record('Grammar question verification', false, error.message); }
        try {
          const { verifyTimeVocabulary } = await import('./verify-time-vocabulary.mjs');
          for (const check of await verifyTimeVocabulary(checkedBrowser, deploymentUrl, { evidenceDirectory })) record(check.name, check.passed, check.detail);
        } catch (error) { record('Time Vocabulary verification', false, error.message); }
      }
      if (verifyKana) {
        try {
          const { verifyKanaPractice } = await import('./verify-kana-practice.mjs');
          for (const check of await verifyKanaPractice(checkedBrowser, deploymentUrl, {
            evidenceDirectory: process.env.VERIFY_EVIDENCE_DIR ?? 'release-verification-evidence',
          })) record(check.name, check.passed, check.detail);
        } catch (error) {
          record('Kana practice verification', false, error.message);
        }
      }
    } catch (error) {
      for (const { name } of activeRoutes) if (!checks.some(({ name: checked }) => checked === name)) record(name, false, error.message);
      if (verifyKana && !checks.some(({ name }) => name.startsWith('Kana random:') || name === 'Kana practice verification')) record('Kana practice verification', false, error.message);
      if (extended) record('Extended site browser verification', false, error.message);
    } finally {
      if (monitor) {
        for (const check of monitor.results()) record(check.name, check.passed, check.detail);
        await save('browser-errors.json', monitor.events);
      }
      await browser?.close();
    }
  }

  const passed = checks.filter(({ passed: success }) => success).length;
  const failed = checks.length - passed;
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) appendFileSync(summaryPath, [
    '## 🧪 Production verification', '',
    `- Candidate: \`${sourceRef}\``, `- Commit: \`${sourceSha}\``, `- Deployed URL: ${pageUrl ?? 'missing'}`, '',
    '| Check | Result | Details |', '| --- | --- | --- |',
    ...checks.map(({ name, passed: success, detail }) => `| ${name} | ${success ? '✅ Passed' : '❌ Failed'} | ${detail.replaceAll('|', '\\|').replace(/\s+/g, ' ')} |`),
    ...(verifyKana ? ['', 'Evidence: download `production-verification` from this run’s Artifacts.',
      'Speech controls use a simulated voice. Before gate 2, confirm audible Japanese playback on a real browser/device.'] : []),
    '', `Result: ${passed} passed, ${failed} failed.`, '',
  ].join('\n'));
  if (failed > 0) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
