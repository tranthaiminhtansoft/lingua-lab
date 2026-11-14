import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NihongoPage } from './NihongoPage';
test('exposes Kana, Vocabulary, and Grammar in the requested order', () => {
  render(<MemoryRouter><NihongoPage /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: /Nihongo O Benkyou/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Kana/i })).toHaveAttribute('href', '/nihongo-o-benkyuo/kana');
  expect(screen.getByRole('link', { name: /Grammar/i })).toHaveAttribute('href', '/nihongo-o-benkyuo/grammar');
  expect(screen.getByRole('link', { name: /Vocabulary/i })).toHaveAttribute('href', '/nihongo-o-benkyuo/vocabulary');
  expect(screen.queryByRole('link', { name: /Start Numbers/i })).not.toBeInTheDocument();
  const cards = screen.getAllByRole('article').map((card) => card.textContent ?? '');
  expect(cards.findIndex((card) => card.includes('Kana'))).toBeLessThan(cards.findIndex((card) => card.includes('Vocabulary')));
  expect(cards.findIndex((card) => card.includes('Vocabulary'))).toBeLessThan(cards.findIndex((card) => card.includes('Grammar')));
  expect(screen.queryByText(/Coming soon/i)).not.toBeInTheDocument();
});
