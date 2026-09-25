import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LessonLobbyPage } from './LessonLobbyPage';
test('exposes kana and disabled coming-soon lessons', () => {
  render(<MemoryRouter><LessonLobbyPage /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: /Nihongo O Benkyou/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Kana/i })).toHaveAttribute('href', '/lessons/kana');
  expect(screen.getAllByText(/Coming soon/i)).toHaveLength(2);
});
