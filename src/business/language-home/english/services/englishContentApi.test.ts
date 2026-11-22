import {
  checkEnglishContentApi,
  getTodayEnglishContextApi,
} from './englishContentApi';
import {
  BUNDLED_ENGLISH_CONTENT,
  getActiveEnglishContent,
  setActiveEnglishContent,
} from '../content/englishContentStore';
import type { EnglishContentBank } from '../content/englishContentTypes';

function cloneBundled(): EnglishContentBank {
  return JSON.parse(JSON.stringify(BUNDLED_ENGLISH_CONTENT)) as EnglishContentBank;
}

function jsonResponse(payload: unknown): Response {
  return {
    ok: true,
    text: async () => JSON.stringify(payload),
  } as Response;
}

beforeEach(() => {
  localStorage.clear();
  setActiveEnglishContent(BUNDLED_ENGLISH_CONTENT);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('activates a newer remote bank and serves its topics', async () => {
  const next = cloneBundled();
  next.version = '2026.11.22';
  next.updatedAt = '2026-11-22';
  next.topics[0] = { ...next.topics[0], title: 'Updated topic title' };
  const fetchMock = vi.fn().mockResolvedValue(jsonResponse(next));
  vi.stubGlobal('fetch', fetchMock);

  const result = await checkEnglishContentApi({ force: true });

  expect(result).toEqual({
    status: 'updated',
    version: '2026.11.22',
    updatedAt: '2026-11-22',
  });
  expect(getActiveEnglishContent().version).toBe('2026.11.22');
  const context = await getTodayEnglishContextApi(new Date(2026, 10, 22));
  expect(context.topics.find((topic) => topic.id === next.topics[0].id)?.title)
    .toBe('Updated topic title');
});

test('keeps the current bank when the remote version is unchanged', async () => {
  const fetchMock = vi.fn().mockResolvedValue(jsonResponse(cloneBundled()));
  vi.stubGlobal('fetch', fetchMock);

  const result = await checkEnglishContentApi({ force: true });

  expect(result.status).toBe('current');
  expect(getActiveEnglishContent()).toBe(BUNDLED_ENGLISH_CONTENT);
});

test('falls back to the bundled bank when the network fails', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

  const result = await checkEnglishContentApi({ force: true });

  expect(result.status).toBe('fallback');
  expect(result.version).toBe(BUNDLED_ENGLISH_CONTENT.version);
  expect(getActiveEnglishContent()).toBe(BUNDLED_ENGLISH_CONTENT);
});

test('falls back when the remote payload is invalid', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ version: '2026.11.22' })));

  const result = await checkEnglishContentApi({ force: true });

  expect(result.status).toBe('fallback');
  expect(getActiveEnglishContent()).toBe(BUNDLED_ENGLISH_CONTENT);
});

test('falls back on non-success responses', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 } as Response));

  const result = await checkEnglishContentApi({ force: true });

  expect(result.status).toBe('fallback');
});

test('throttles automatic checks after a recent attempt', async () => {
  const fetchMock = vi.fn().mockResolvedValue(jsonResponse(cloneBundled()));
  vi.stubGlobal('fetch', fetchMock);

  await checkEnglishContentApi({ force: true });
  fetchMock.mockClear();
  const result = await checkEnglishContentApi();

  expect(result.status).toBe('skipped');
  expect(fetchMock).not.toHaveBeenCalled();
});
