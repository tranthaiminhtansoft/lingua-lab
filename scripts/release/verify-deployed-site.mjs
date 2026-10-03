import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const routes = [
  { name: 'Homepage application marker', path: '', heading: 'Find your language.', selectors: ['a[aria-label="Explore Nihongo learning path"]'], links: [{ selector: 'a[aria-label="Explore Nihongo learning path"]', path: 'nihongo-o-benkyuo' }] },
  { name: 'Kana production route', path: 'nihongo-o-benkyuo/kana', heading: 'Kana', selectors: ['#basics', '#practice', '[data-testid="practice-glyph"]'] },
  { name: 'Grammar production route', path: 'nihongo-o-benkyuo/grammar', heading: 'Grammar', selectors: ['a[href$="/nihongo-o-benkyuo/grammar/first-introductions"]'] },
  { name: 'Vocabulary production route', path: 'nihongo-o-benkyuo/vocabulary', heading: 'Vocabulary', selectors: ['a[href$="/nihongo-o-benkyuo/vocabulary/first-introductions"]'] },
  { name: 'First introductions Grammar topic', path: 'nihongo-o-benkyuo/grammar/first-introductions', heading: 'First introductions', selectors: ['#opening', '#patterns'] },
  { name: 'First introductions Vocabulary topic', path: 'nihongo-o-benkyuo/vocabulary/first-introductions', heading: 'First introductions', selectors: ['#meeting-phrases', '#usage-notes'] },
];

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
  try {
    const response = await page.goto(url.toString(), { waitUntil: 'networkidle' });
    if (!isSuccessfulRouteResponse(response)) throw new Error(`HTTP ${response?.status() ?? 'no response'}`);
    await assertRouteContent(page, route, deploymentUrl);
    if (new URL(page.url()).pathname !== url.pathname) throw new Error(`unexpected final path ${new URL(page.url()).pathname}`);
    if (reload) {
      const refreshedResponse = await page.reload({ waitUntil: 'networkidle' });
      if (!isSuccessfulRouteResponse(refreshedResponse)) throw new Error(`refresh HTTP ${refreshedResponse?.status() ?? 'no response'}`);
      await assertRouteContent(page, route, deploymentUrl);
      if (new URL(page.url()).pathname !== url.pathname) throw new Error(`unexpected refreshed path ${new URL(page.url()).pathname}`);
    }
    return `HTTP ${response.status()}, route-specific content verified${reload ? ', refresh verified' : ''}`;
  } finally {
    await page.close();
  }
}

async function main() {
  const pageUrl = process.env.PAGE_URL;
  const sourceRef = process.env.SOURCE_REF ?? 'unknown';
  const sourceSha = process.env.SOURCE_SHA ?? 'unknown';
  const checks = [];
  const record = (name, passed, detail) => {
    checks.push({ name, passed, detail });
    console.log(`${passed ? 'PASS' : 'FAIL'}: ${name}${detail ? ` — ${detail}` : ''}`);
  };

  if (!pageUrl) {
    record('Deployed build identity matches candidate', false, 'PAGE_URL is required');
    for (const { name } of routes) record(name, false, 'skipped because PAGE_URL is missing');
  } else {
    const deploymentUrl = new URL(pageUrl);
    if (!deploymentUrl.pathname.endsWith('/')) deploymentUrl.pathname += '/';
    try {
      const response = await fetch(new URL('release-identity.json', deploymentUrl));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      record('Deployed build identity matches candidate', true, verifyIdentity(await response.json(), sourceSha));
    } catch (error) {
      record('Deployed build identity matches candidate', false, error.message);
    }

    let browser;
    try {
      const { chromium } = await import('playwright');
      browser = await chromium.launch({ headless: true });
      for (const route of routes) {
        try {
          record(route.name, true, await checkRoute(browser, deploymentUrl, route, { reload: route.name === 'First introductions Grammar topic' }));
        } catch (error) {
          record(route.name, false, error.message);
        }
      }
    } catch (error) {
      for (const { name } of routes) if (!checks.some(({ name: checked }) => checked === name)) record(name, false, error.message);
    } finally {
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
    ...checks.map(({ name, passed: success, detail }) => `| ${name} | ${success ? '✅ Passed' : '❌ Failed'} | ${detail.replaceAll('|', '\\|')} |`),
    '', `Result: ${passed} passed, ${failed} failed.`, '',
  ].join('\n'));
  if (failed > 0) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
