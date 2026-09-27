import { appendFileSync } from 'node:fs';

const pageUrl = process.env.PAGE_URL;
const sourceRef = process.env.SOURCE_REF ?? 'unknown';
const sourceSha = process.env.SOURCE_SHA ?? 'unknown';
const checks = [];

function record(name, passed, detail) {
  checks.push({ name, passed, detail });
  const status = passed ? 'PASS' : 'FAIL';
  console.log(`${status}: ${name}${detail ? ` — ${detail}` : ''}`);
}

if (!pageUrl) {
  record('Pages homepage responds successfully', false, 'PAGE_URL is required');
  record('Kana page heading is visible', false, 'skipped because PAGE_URL is missing');
  record('Kana deep-link path remains unchanged', false, 'skipped because PAGE_URL is missing');
} else {
  try {
    const response = await fetch(pageUrl);
    if (!response.ok) {
      throw new Error(`expected homepage HTTP success, received ${response.status}`);
    }
    record('Pages homepage responds successfully', true, `HTTP ${response.status}`);
  } catch (error) {
    record('Pages homepage responds successfully', false, error.message);
  }

  let browser;
  try {
    const { chromium } = await import('playwright');
    const deploymentUrl = new URL(pageUrl);
    if (!deploymentUrl.pathname.endsWith('/')) deploymentUrl.pathname += '/';
    const deepLink = new URL('nihongo-o-benkyuo/kana', deploymentUrl);
    const expectedPathname = deepLink.pathname;

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(deepLink.toString(), { waitUntil: 'networkidle' });
    await page.getByRole('heading', { level: 1, name: /Kana/ }).waitFor({ state: 'visible' });
    record('Kana page heading is visible', true, 'level-one heading matched Kana');

    const finalPathname = new URL(page.url()).pathname;
    if (finalPathname !== expectedPathname) {
      throw new Error(`expected final pathname ${expectedPathname}, received ${finalPathname}`);
    }
    record('Kana deep-link path remains unchanged', true, finalPathname);
  } catch (error) {
    if (!checks.some(({ name }) => name === 'Kana page heading is visible')) {
      record('Kana page heading is visible', false, error.message);
    }
    if (!checks.some(({ name }) => name === 'Kana deep-link path remains unchanged')) {
      record('Kana deep-link path remains unchanged', false, error.message);
    }
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        console.error(`Could not close the verification browser cleanly: ${error.message}`);
      }
    }
  }
}

const passed = checks.filter(({ passed: checkPassed }) => checkPassed).length;
const failed = checks.length - passed;
const summaryPath = process.env.GITHUB_STEP_SUMMARY;
if (summaryPath) {
  const summary = [
    '## 🧪 Production verification',
    '',
    `- Candidate: \`${sourceRef}\``,
    `- Commit: \`${sourceSha}\``,
    `- Deployed URL: ${pageUrl ?? 'missing'}`,
    '',
    '| Check | Result | Details |',
    '| --- | --- | --- |',
    ...checks.map(({ name, passed: checkPassed, detail }) =>
      `| ${name} | ${checkPassed ? '✅ Passed' : '❌ Failed'} | ${detail.replaceAll('|', '\\|')} |`,
    ),
    '',
    `Result: ${passed} passed, ${failed} failed.`,
    '',
  ].join('\n');
  appendFileSync(summaryPath, summary);
}

if (failed > 0) process.exitCode = 1;
