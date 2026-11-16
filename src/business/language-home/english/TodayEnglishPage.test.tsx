import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TodayEnglishPage } from './TodayEnglishPage';
import { getTodayEnglishContext, isTopicVisible } from './content/todayEnglish';

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
