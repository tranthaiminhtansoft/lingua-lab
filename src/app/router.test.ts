import { afterEach, expect, test, vi } from 'vitest';

afterEach(() => {
  window.history.replaceState(null, '', '/');
  vi.resetModules();
});

test('restores a GitHub Pages fallback URL to the Kana route under the production base path', async () => {
  const { restorePagesPath } = await import('./router');
  window.history.replaceState(null, '', '/lingua-lab/?p=%2Flessons%2Fkana');

  restorePagesPath('/lingua-lab/');

  expect(window.location.pathname).toBe('/lingua-lab/lessons/kana');
});
