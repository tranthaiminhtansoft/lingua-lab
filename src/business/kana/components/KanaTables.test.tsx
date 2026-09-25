import { render, screen } from '@testing-library/react';
import { kanaEntries } from '../data/kana';
import { KanaTables } from './KanaTables';
test('renders three semantic tables from canonical data', () => {
  render(<KanaTables entries={kanaEntries} />);
  expect(screen.getAllByRole('table')).toHaveLength(3);
  expect(screen.getByRole('table', { name: /Basic kana/i })).toBeInTheDocument();
  expect(screen.getByRole('table', { name: /^Dakuten/i })).toBeInTheDocument();
  expect(screen.getByRole('table', { name: /^Handakuten/i })).toBeInTheDocument();
  expect(screen.getAllByRole('columnheader', { name: 'Hiragana' })).toHaveLength(3);
  expect(screen.getByText('あ')).toBeInTheDocument();
  expect(screen.getByText('ア')).toBeInTheDocument();
});
