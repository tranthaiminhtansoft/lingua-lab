import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TodayEnglishPage } from './TodayEnglishPage';
import { getTodayEnglishContext, isTopicVisible } from './content/todayEnglish';
import { BUNDLED_ENGLISH_CONTENT, setActiveEnglishContent } from './content/englishContentStore';

beforeEach(() => {
  localStorage.clear();
  setActiveEnglishContent(BUNDLED_ENGLISH_CONTENT);
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('renders Today’s English with available topics', async () => {
  render(
    <MemoryRouter>
      <TodayEnglishPage />
    </MemoryRouter>,
  );

  expect(await screen.findByText(/Hôm nay có các chủ đề này/)).toBeInTheDocument();
  for (const topic of getTodayEnglishContext().topics.filter((topic) => isTopicVisible(topic))) {
    expect(screen.getAllByText(topic.title).length).toBeGreaterThan(0);
  }
});

test('refresh applies a newer content version fetched as JSON', async () => {
  const next = structuredClone(BUNDLED_ENGLISH_CONTENT);
  next.version = '2026.11.22';
  next.updatedAt = '2026-11-22';
  const fetchMock = vi.fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(next),
    } as Response);
  vi.stubGlobal('fetch', fetchMock);

  render(
    <MemoryRouter>
      <TodayEnglishPage />
    </MemoryRouter>,
  );

  expect(await screen.findByText(/Không tải được bản mới/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra bản mới' }));

  expect(await screen.findByText(/Đã cập nhật nội dung lên bản 2026.11.22/)).toBeInTheDocument();
  expect(screen.getByText(/Bản đang dùng: 2026.11.22/)).toBeInTheDocument();
});
