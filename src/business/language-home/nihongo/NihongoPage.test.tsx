import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NihongoPage } from './NihongoPage';
test('exposes Numbers before Vocabulary among available lessons', () => {
  render(<MemoryRouter><NihongoPage /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: /Nihongo O Benkyou/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Kana/i })).toHaveAttribute('href', '/nihongo-o-benkyuo/kana');
  expect(screen.getByRole('link', { name: /Grammar/i })).toHaveAttribute('href', '/nihongo-o-benkyuo/grammar');
  expect(screen.getByRole('link', { name: /Start Numbers/i })).toHaveAttribute('href', '/nihongo-o-benkyuo/numbers');
  expect(screen.getByRole('link', { name: /Vocabulary/i })).toHaveAttribute('href', '/nihongo-o-benkyuo/vocabulary');
  const cards = screen.getAllByRole('article').map((card) => card.textContent ?? '');
  expect(cards.findIndex((card) => card.includes('Numbers'))).toBeLessThan(cards.findIndex((card) => card.includes('Vocabulary')));
  expect(screen.queryByText(/Coming soon/i)).not.toBeInTheDocument();
});
