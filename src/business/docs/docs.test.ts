// @ts-expect-error Node built-ins and process are runtime-only in the browser-focused app tsconfig.
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

// @ts-expect-error Node globals are available to Vitest but excluded from app type declarations.
const docsDirectory = `${process.cwd()}/src/business/docs/`;
const pageNames = ['index.html', 'product.html', 'topology.html', 'delivery.html', 'pre-release.html', 'release.html', 'post-release.html', 'rollback.html'];

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
      if (name !== 'index.html') expect(html).toMatch(/<(?:section|ol)>/);
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

  it('exports the seven HTML sources and three Archify assets', async () => {
    const script = await readFile(`${docsDirectory}../../../scripts/build-docs.mjs`, 'utf8');
    expect(script).toContain("'pre-release.html', 'release.html', 'post-release.html', 'rollback.html'");
    expect(script).toContain("['topology-diagram.html', 'delivery-workflow.html', 'ci-workflow.html']");
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
    const [pre, release, post, rollback, index, delivery, diagram] = await Promise.all([
      readFile(`${docsDirectory}pre-release.html`, 'utf8'),
      readFile(`${docsDirectory}release.html`, 'utf8'),
      readFile(`${docsDirectory}post-release.html`, 'utf8'),
      readFile(`${docsDirectory}rollback.html`, 'utf8'),
      readFile(`${docsDirectory}index.html`, 'utf8'),
      readFile(`${docsDirectory}delivery.html`, 'utf8'),
      readFile(`${docsDirectory}delivery-workflow.json`, 'utf8'),
    ]);
    expect(pre).toContain('Lingua Lab on GitHub Pages');
    expect(pre).toContain('Check the home page and a lesson route');
    expect(pre).toContain('rollback unavailable');
    expect(pre).toContain('manual recovery plan');
    expect(release).toContain('Create PRD Release Branch');
    expect(release).toContain('candidate_ref');
    expect(release).toContain('manually compare the pinned candidate SHA with the intended commit recorded during pre-release');
    expect(release).toContain('This comparison is a human check, not an automatic gate.');
    expect(release).toContain('Stop</strong> if they differ or either value/evidence is missing');
    expect(release).toContain('Review deployments');
    expect(release).toContain('no rollback is needed');
    expect(release).toContain('verify_release');
    expect(release).toContain('href="rollback.html"');
    expect(rollback).toContain('release_version');
    expect(rollback).toContain('Resolve requested stable GitHub Release');
    expect(rollback).toContain('Rollback verified');
    expect(rollback).toContain('Review deployments');
    expect(post).toContain('representative routes');
    expect(post).toContain('href="rollback.html"');
    expect(index).toContain('href="rollback.html"');
    expect(delivery).toContain('href="rollback.html"');
    expect(delivery).toContain('blob/codex/release-rollback-workflows/.github/workflows/prd-release.yml');
    expect(delivery).toContain('These branch links are mutable');
    expect(delivery).not.toContain('blob/fdfe48633027e8b298023e7e54d7eb5f12afcdc9/');
    expect(delivery).toContain('requires that SHA to exactly match the protected');
    expect(delivery).toContain('GitHub Actions workflows/actions and release scripts do not match the allowlist');
    for (const html of [pre, release, post]) {
      expect(html).toContain('role="img"');
      expect(html).toContain('Screenshot placeholder');
      expect(html).not.toMatch(/<img\b/i);
    }
    expect(delivery).not.toContain('does not require master-tip equality');
    expect(delivery).toContain('Pull-request CI remains a merge control');
    expect(diagram).toContain('exact equality with the protected master tip');
    expect(diagram).toContain('does not require historical PR check runs');
    expect(diagram).not.toContain('master tip · CI checks');
    expect(diagram).not.toContain('There is no master-tip equality gate');
  });
});
