import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NihongoPage } from './NihongoPage';
test('exposes kana and disabled coming-soon lessons', () => {
  render(<MemoryRouter><NihongoPage /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: /Nihongo O Benkyou/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Kana/i })).toHaveAttribute('href', '/nihongo-o-benkyuo/kana');
  expect(screen.getAllByText(/Coming soon/i)).toHaveLength(2);
});
