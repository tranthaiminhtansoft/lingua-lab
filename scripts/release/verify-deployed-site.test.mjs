import { test } from 'vitest';
import assert from 'node:assert/strict';
import { checkRoute, routes, routesForVerification, verifyIdentity } from './verify-deployed-site.mjs';

test('release checks the new Grammar topic without requiring it in older rollback artifacts', () => {
  assert.ok(routesForVerification(true).some(({ path }) => path.endsWith('/question-types')));
  assert.ok(!routesForVerification().some(({ path }) => path.endsWith('/question-types')));
});

function fakePage({ pathname, content, responseStatus = 200, finalPath }) {
  const page = {
    currentPath: pathname,
    async goto(url) { this.currentPath = new URL(url).pathname; return { ok: () => responseStatus < 400, status: () => responseStatus }; },
    reloadCount: 0,
    async reload() { this.reloadCount += 1; return { ok: () => responseStatus < 400, status: () => responseStatus }; },
    url() { return `https://example.test${finalPath ?? this.currentPath}`; },
    async close() {},
    getByRole(role, options) {
      return { async waitFor() {
        if (role !== 'heading' || !content.heading.includes(options.name)) throw new Error('heading mismatch');
      } };
    },
    locator(selector) {
      return {
        async waitFor() {
          if (!content.selectors.includes(selector)) throw new Error(`missing ${selector}`);
        },
        async getAttribute(name) {
          if (name !== 'href') throw new Error(`unexpected attribute ${name}`);
          return content.links?.[selector] ?? null;
        },
      };
    },
    getByText(text, options) {
      return { async waitFor() {
        if (!content.text.includes(text) || options?.exact && content.text !== text) throw new Error(`missing text ${text}`);
      } };
    },
  };
  return page;
}

const contentByRoute = new Map(routes.map((route) => [route.path, {
  heading: route.heading,
  selectors: route.selectors,
  text: route.name,
  links: Object.fromEntries((route.links ?? []).map((link) => [link.selector, new URL(link.path, 'https://example.test/lingua-lab/').pathname])),
}]));
const browserFor = (page) => ({ async newPage() { return page; } });

test('accepts route-specific application content at the expected final path', async () => {
  assert.deepEqual(routes.slice(0, 4).map(({ name }) => name), [
    'Homepage application marker', 'Kana production route', 'Grammar production route', 'Vocabulary production route',
  ]);
  for (const route of routes) {
    const page = fakePage({ pathname: `/lingua-lab/${route.path}`, content: contentByRoute.get(route.path) });
    await assert.doesNotReject(checkRoute(browserFor(page), new URL('https://example.test/lingua-lab/'), route));
  }
});

test('rejects a homepage application marker that links outside the Pages base path', async () => {
  const route = routes.find(({ name }) => name === 'Homepage application marker');
  const page = fakePage({
    pathname: '/lingua-lab/',
    content: { ...contentByRoute.get(route.path), links: { [route.links[0].selector]: '/wrong-route' } },
  });
  await assert.rejects(checkRoute(browserFor(page), new URL('https://example.test/lingua-lab/'), route), /unexpected link target/);
});

test('rejects HTTP-200 generic shell even when its heading matches', async () => {
  const route = routes.find(({ name }) => name === 'Kana production route');
  const page = fakePage({ pathname: `/lingua-lab/${route.path}`, content: { heading: 'Kana', selectors: [], text: '' } });
  await assert.rejects(checkRoute(browserFor(page), new URL('https://example.test/lingua-lab/'), route));
});

test('rejects non-success HTTP responses before accepting matching page content', async () => {
  const route = routes.find(({ name }) => name === 'Vocabulary production route');
  const page = fakePage({ pathname: `/lingua-lab/${route.path}`, responseStatus: 503, content: contentByRoute.get(route.path) });
  await assert.rejects(checkRoute(browserFor(page), new URL('https://example.test/lingua-lab/'), route), /HTTP 503/);
});

test('accepts HTTP 404 for a non-homepage SPA route only after route assertions, including refresh', async () => {
  const route = routes.find(({ name }) => name === 'First introductions Grammar topic');
  const page = fakePage({ pathname: `/lingua-lab/${route.path}`, responseStatus: 404, content: contentByRoute.get(route.path) });
  await assert.doesNotReject(checkRoute(browserFor(page), new URL('https://example.test/lingua-lab/'), route, { reload: true }));
  assert.equal(page.reloadCount, 1);
});

test('rejects HTTP 404 on the homepage and generic 404 content on SPA routes', async () => {
  const homepage = routes[0];
  const homePage = fakePage({ pathname: '/lingua-lab/', responseStatus: 404, content: contentByRoute.get(homepage.path) });
  await assert.rejects(checkRoute(browserFor(homePage), new URL('https://example.test/lingua-lab/'), homepage), /HTTP 404/);

  const route = routes.find(({ name }) => name === 'Kana production route');
  const genericPage = fakePage({ pathname: `/lingua-lab/${route.path}`, responseStatus: 404, content: { heading: 'Not Found', selectors: [], text: '' } });
  await assert.rejects(checkRoute(browserFor(genericPage), new URL('https://example.test/lingua-lab/'), route));
});

test('rejects wrong application content at a requested route', async () => {
  const route = routes.find(({ name }) => name === 'Grammar production route');
  const page = fakePage({ pathname: `/lingua-lab/${route.path}`, content: contentByRoute.get('nihongo-o-benkyuo/vocabulary') });
  await assert.rejects(checkRoute(browserFor(page), new URL('https://example.test/lingua-lab/'), route));
});

test('rejects unexpected final route despite matching page content', async () => {
  const route = routes.find(({ name }) => name === 'Kana production route');
  const page = fakePage({ pathname: `/lingua-lab/${route.path}`, finalPath: '/lingua-lab/not-found', content: contentByRoute.get(route.path) });
  await assert.rejects(checkRoute(browserFor(page), new URL('https://example.test/lingua-lab/'), route));
});

test('accepts only the expected deployed source identity', async () => {
  const expectedSha = 'a'.repeat(40);
  assert.equal(verifyIdentity({ sourceSha: expectedSha }, expectedSha), expectedSha);
  assert.throws(() => verifyIdentity({ sourceSha: 'b'.repeat(40) }, expectedSha), /expected .* received/);
  assert.throws(() => verifyIdentity(null, expectedSha), /received missing/);
  assert.throws(() => verifyIdentity({ sourceSha: 'unknown' }, 'unknown'), /40-character commit SHA/);
  assert.throws(() => verifyIdentity({ sourceSha: expectedSha }, undefined), /40-character commit SHA/);
});

test('rechecks Grammar topic application content after a nested-route refresh', async () => {
  const route = routes.find(({ name }) => name === 'First introductions Grammar topic');
  const page = fakePage({ pathname: `/lingua-lab/${route.path}`, content: contentByRoute.get(route.path) });
  await checkRoute(browserFor(page), new URL('https://example.test/lingua-lab/'), route, { reload: true });
  assert.equal(page.reloadCount, 1);
});

test('requires observed document responses when SPA redirects make browser navigation return null', async () => {
  const route = routes.find(({ name }) => name === 'Kana production route');
  const page = fakePage({ pathname: `/lingua-lab/${route.path}`, content: contentByRoute.get(route.path) });
  let listener;
  const frame = {};
  page.mainFrame = () => frame;
  page.on = (event, handler) => { if (event === 'response') listener = handler; };
  page.off = () => {};
  const observed = { ok: () => false, status: () => 404, request: () => ({ resourceType: () => 'document' }), frame: () => frame };
  page.goto = page.reload = async () => { listener(observed); return null; };
  await assert.doesNotReject(checkRoute(browserFor(page), new URL('https://example.test/lingua-lab/'), route, { reload: true }));
  page.goto = async () => null;
  await assert.rejects(checkRoute(browserFor(page), new URL('https://example.test/lingua-lab/'), route), /HTTP no response/);
});

test('Time route is required for release but not for historical rollback artifacts', () => {
  assert.ok(routesForVerification(true).some(({ path }) => path.endsWith('/vocabulary/time')));
  assert.ok(!routesForVerification().some(({ path }) => path.endsWith('/vocabulary/time')));
});
