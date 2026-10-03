// @ts-expect-error Node built-ins and process are runtime-only in the browser-focused app tsconfig.
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

// @ts-expect-error Node globals are available to Vitest but excluded from app type declarations.
const docsDirectory = `${process.cwd()}/src/business/docs/`;
const pageNames = ['index.html', 'product.html', 'reference.html', 'topology.html', 'delivery.html', 'procedures.html', 'pre-release.html', 'release.html', 'post-release.html', 'rollback.html'];

describe('standalone documentation sources', () => {
  it('uses independent semantic HTML pages with relative sibling navigation', async () => {
    const pages = await Promise.all(pageNames.map(async (name) => [
      name,
      await readFile(`${docsDirectory}${name}`, 'utf8'),
    ] as const));

    for (const [name, html] of pages) {
      expect(html).toContain('<!doctype html>');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('<main>');
      expect(html).toContain('<nav aria-label="Documentation">');
      expect(html).not.toMatch(/<pre>[^<]*(?:#{1,6} |\*\*|```)/);
      expect(html).not.toContain('/lingua-lab/docs/');
      expect(html).not.toContain('docs/README.md');
      expect(html).not.toMatch(/href="\.\.\/\.\.\//);
      if (name !== 'index.html') expect(html).toMatch(/<(?:section|ol)\b/);
    }
  });

  it('copies each original command block and reports clipboard success and failure', async () => {
    const html = await readFile(`${docsDirectory}product.html`, 'utf8');
    // @ts-expect-error jsdom is available at runtime in Vitest but its typings are not installed.
    const { JSDOM } = await import('jsdom');
    const sourceDom = new JSDOM(html);
    const originalCommands = [...sourceDom.window.document.querySelectorAll('pre code')].map((code) => code.textContent ?? '');
    sourceDom.window.close();
    expect(originalCommands).toHaveLength(4);

    const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'https://example.test/product.html' });
    const { document, navigator } = dom.window;
    let copied = '';
    let writeClipboard = async (text: string) => { copied = text; };
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: (text: string) => writeClipboard(text) } });
    const buttons = [...document.querySelectorAll('.command-block button')];
    expect(buttons).toHaveLength(4);

    await buttons[0].click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(copied).toBe(originalCommands[0]);
    expect(buttons[0].parentElement?.querySelector('[role="status"]')?.textContent).toBe('Copied to clipboard.');

    writeClipboard = async () => { throw new Error('denied'); };
    await buttons[1].click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(buttons[1].textContent).toBe('Copy');
    expect(buttons[1].parentElement?.querySelector('[role="status"]')?.textContent).toBe('Copy failed. Clipboard access is unavailable.');
    dom.window.close();
  });

  it('exports all ten HTML sources, three Archify assets, and captured release screenshots', async () => {
    const script = await readFile(`${docsDirectory}../../../scripts/build-docs.mjs`, 'utf8');
    expect(script).toContain("'reference.html', 'topology.html', 'delivery.html', 'procedures.html'");
    expect(script).toContain("'pre-release.html', 'release.html', 'post-release.html', 'rollback.html'");
    expect(script).toContain("'assets/release-trigger-form.jpg'");
    expect(script).toContain("'assets/release-trigger-success.jpg'");
    expect(script).toContain("'assets/release-candidate-success.jpg'");
    expect(script).toContain("'assets/release-approval-history.jpg'");
    expect(script).not.toMatch(/\.md|markdown|htmlEscape/);
  });

  it('keeps same-origin relative interactive diagrams with dynamic iframe sizing', async () => {
    const topology = await readFile(`${docsDirectory}topology.html`, 'utf8');
    const delivery = await readFile(`${docsDirectory}delivery.html`, 'utf8');

    for (const [html, source, title] of [
      [topology, 'assets/topology-diagram.html', 'Interactive Lingua Lab application topology diagram'],
      [delivery, 'assets/delivery-workflow.html', 'Interactive Lingua Lab delivery workflow diagram'],
      [delivery, 'assets/ci-workflow.html', 'Interactive Lingua Lab pull-request CI diagram'],
    ]) {
      expect(html).toContain(`src="${source}"`);
      expect(html).toContain(`title="${title}"`);
      expect(html).toContain('addEventListener(\'load\'');
      expect(html).toContain('ResizeObserver');
      expect(html).toContain('scrollHeight');
      expect(html).not.toMatch(/<iframe[^>]*(?:scrolling\s*=|height:\s*\d{4,}px)/i);
      expect(html).not.toContain('overflow:hidden');
    }
  });

  it('depicts both configured CI jobs without implying a passing run', async () => {
    const delivery = await readFile(`${docsDirectory}delivery.html`, 'utf8');
    const spec = JSON.parse(await readFile(`${docsDirectory}ci-workflow.json`, 'utf8')) as {
      lanes: { label: string }[]; cards: { items: string[] }[];
    };
    const artifact = await readFile(`${docsDirectory}ci-workflow.html`, 'utf8');
    expect(delivery).toContain('<h2>Pull-request CI</h2>');
    expect(delivery).toContain('not a successful run');
    expect(spec.lanes.map((lane) => lane.label).join(' ')).toContain('Eligible pull request Repository policy job Application validation job');
    expect(spec.cards.flatMap((card) => card.items).join(' ')).toContain('npm ci');
    expect(spec.cards.flatMap((card) => card.items).join(' ')).toContain('not a successful run');
    expect(spec.cards.flatMap((card) => card.items).join(' ')).toContain('a required check pending or skipped');
    expect(artifact).toContain('Configured PR-only Product CI');
  });

  it('keeps operator guides concise, linked, and accurate to workflow approval order', async () => {
    const [pre, release, post, rollback, index, delivery, diagram, releaseWorkflow] = await Promise.all([
      readFile(`${docsDirectory}pre-release.html`, 'utf8'),
      readFile(`${docsDirectory}release.html`, 'utf8'),
      readFile(`${docsDirectory}post-release.html`, 'utf8'),
      readFile(`${docsDirectory}rollback.html`, 'utf8'),
      readFile(`${docsDirectory}index.html`, 'utf8'),
      readFile(`${docsDirectory}delivery.html`, 'utf8'),
      readFile(`${docsDirectory}delivery-workflow.json`, 'utf8'),
      readFile(`${process.cwd()}/.github/workflows/prd-release.yml`, 'utf8'),
    ]);
    expect(pre).toContain('Lingua Lab on GitHub Pages');
    expect(pre).toContain('Check the home page and a lesson route');
    expect(pre).toContain('rollback unavailable');
    expect(pre).toContain('manual recovery plan');
    expect(release).toContain('Create PRD Release Branch');
    expect(release).toContain('candidate_ref');
    expect(release).toContain('release/homelab/YYYYMMDD');
    expect(release).toContain('release/homelab/20261004');
    expect(release).toContain('Branch: master</code> (default; do not change)');
    expect(release).toContain('pinned commit SHA matches the approved commit');
    expect(release).toContain('Dispatch PRD Release');
    expect(release).toContain('Dispatch PRD Release as a separate workflow run');
    expect(release).toContain('click the Actions URL in the log');
    expect(release).toContain('Review deployments');
    expect(release).toContain('Verify deployed release');
    expect(release).toContain('Pages site: app + standalone docs');
    expect(release).toContain('Run → <strong>Deploy release candidate to production</strong>');
    expect(release).toContain('Deployed build identity matches candidate');
    expect(release).toContain('Homepage application marker');
    expect(release).toContain('Grammar refresh: all <strong>Passed</strong>');
    expect(release).toContain('<strong>Not deployed to Pages.</strong>');
    expect(release).toContain('Production verification</strong> summary');
    expect(release).toContain('Deployment protection rules');
    expect(release).toContain('alt="GitHub Actions deployment protection rules showing the two completed prod approvals"');
    const gateOne = release.indexOf('<h2>Approve candidate (prod gate 1)</h2>');
    const deployAndVerify = release.indexOf('<h2>Deploy and verify</h2>');
    const gateTwo = release.indexOf('<h2>Approve stable publication (prod gate 2)</h2>');
    expect(gateOne).toBeGreaterThan(-1);
    expect(gateOne).toBeLessThan(deployAndVerify);
    expect(deployAndVerify).toBeLessThan(gateTwo);
    expect(release).toContain('stable publication succeeds');
    expect(release).toContain('href="rollback.html"');
    expect(rollback).toContain('release_version');
    expect(rollback).toContain('Resolve requested stable GitHub Release');
    expect(rollback).toContain('Rollback verified');
    expect(rollback).toContain('Review deployments');
    expect(post).toContain('representative routes');
    expect(post).toContain('href="rollback.html"');
    expect(index).toContain('href="procedures.html"');
    expect(index).toContain('20261003');
    expect(delivery).toContain('href="procedures.html"');
    expect(delivery).toContain('blob/master/.github/workflows/prd-release.yml');
    expect(delivery).toContain('These branch links are mutable');
    expect(delivery).not.toContain('blob/fdfe48633027e8b298023e7e54d7eb5f12afcdc9/');
    expect(delivery).toContain('requires that SHA to exactly match the protected');
    expect(delivery).toContain('Changes limited to <code>.github/**</code> or <code>scripts/**</code> do not match the allowlist');
    for (const html of [pre, post]) {
      expect(html).toContain('role="img"');
      expect(html).toContain('Screenshot placeholder');
      expect(html).not.toMatch(/<img\b/i);
    }
    expect(release).toContain('assets/release-trigger-form.jpg');
    expect(release).toContain('assets/release-trigger-success.jpg');
    expect(release).toContain('assets/release-candidate-success.jpg');
    expect(release).toContain('assets/release-approval-history.jpg');
    expect(release).not.toMatch(/release-(?:trigger|success)\.svg/);
    expect(release).toContain('37110848365');
    expect(delivery).not.toContain('does not require master-tip equality');
    expect(delivery).toContain('Pull-request CI remains the merge control');
    expect(diagram).toContain('exact equality with the protected master tip');
    const workflowDiagram = JSON.parse(diagram) as { mainPath: string[] };
    expect(workflowDiagram.mainPath).toEqual(['dispatch', 'validate', 'approve', 'build', 'deploy', 'verify', 'publishApproval', 'publish']);
    expect(diagram).toContain('first prod approval happens before candidate code is built');
    expect(diagram).toContain('runs no lint, typecheck, unit tests, or browser smoke checks');
    expect(releaseWorkflow.indexOf('  approve_release_deploy:')).toBeLessThan(releaseWorkflow.indexOf('  build_release_artifact:'));
    expect(releaseWorkflow).toContain('approve_release_deploy:\n    name: 🛡️ Approve release candidate\n    needs: validate_release_ref');
    const buildJob = releaseWorkflow.slice(
      releaseWorkflow.indexOf('  build_release_artifact:'),
      releaseWorkflow.indexOf('  deploy_release_candidate:'),
    );
    expect(buildJob).toContain('needs: [validate_release_ref, approve_release_deploy]');
    expect(buildJob).toContain('run: npx vite build');
    expect(buildJob).toContain('run: node scripts/build-docs.mjs');
    expect(buildJob).not.toMatch(/npm run (?:lint|typecheck|test:unit|test:e2e)|playwright install/i);
    expect(diagram).not.toContain('master tip · CI checks');
    expect(diagram).not.toContain('There is no master-tip equality gate');
  });
});
