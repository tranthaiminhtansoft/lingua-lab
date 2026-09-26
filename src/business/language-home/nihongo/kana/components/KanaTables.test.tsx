import { render, screen } from '@testing-library/react';
import { kanaEntries } from '../data/kana';
import { KanaTables } from './KanaTables';
test('renders the three five-column kana layouts from canonical data', () => {
  render(<KanaTables entries={kanaEntries} />);
  expect(screen.getAllByRole('table')).toHaveLength(3);
  expect(screen.getByRole('table', { name: /Basic kana/i })).toBeInTheDocument();
  expect(screen.getByRole('table', { name: /^Dakuten/i })).toBeInTheDocument();
  expect(screen.getByRole('table', { name: /^Handakuten/i })).toBeInTheDocument();
  expect(screen.getAllByRole('row')).toHaveLength(16);
  expect(document.querySelector('.kana-pair')).toHaveTextContent('あ/ア');
  expect(screen.getByText('a')).toBeInTheDocument();
  expect(screen.getByText(/Adds two small strokes/)).toBeInTheDocument();
  expect(screen.getByText(/Adds a small circle/)).toBeInTheDocument();
});
