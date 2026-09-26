import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NihongoPage } from './NihongoPage';
test('exposes Kana, Grammar, and Vocabulary lessons', () => {
  render(<MemoryRouter><NihongoPage /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: /Nihongo O Benkyou/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Kana/i })).toHaveAttribute('href', '/nihongo-o-benkyuo/kana');
  expect(screen.getByRole('link', { name: /Grammar/i })).toHaveAttribute('href', '/nihongo-o-benkyuo/grammar');
  expect(screen.getByRole('link', { name: /Vocabulary/i })).toHaveAttribute('href', '/nihongo-o-benkyuo/vocabulary');
  expect(screen.queryByText(/Coming soon/i)).not.toBeInTheDocument();
});
