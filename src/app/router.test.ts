import { afterEach, expect, test, vi } from 'vitest';

afterEach(() => {
  window.history.replaceState(null, '', '/');
  vi.resetModules();
});

test('restores a GitHub Pages fallback URL to the nested Kana route under the production base path', async () => {
  const { restorePagesPath } = await import('./router');
  window.history.replaceState(null, '', '/lingua-lab/?p=%2Fnihongo-o-benkyuo%2Fkana');

  restorePagesPath('/lingua-lab/');

  expect(window.location.pathname).toBe('/lingua-lab/nihongo-o-benkyuo/kana');
});
