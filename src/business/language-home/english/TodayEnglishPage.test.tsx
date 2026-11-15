import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TodayEnglishPage } from './TodayEnglishPage';

test('renders Today’s English with available topics', async () => {
  render(
    <MemoryRouter>
      <TodayEnglishPage />
    </MemoryRouter>,
  );

  expect(await screen.findByText(/Hôm nay có các chủ đề này/)).toBeInTheDocument();
  expect(screen.getAllByText('Autumn routine & energy').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Work update in English').length).toBeGreaterThan(0);
});
