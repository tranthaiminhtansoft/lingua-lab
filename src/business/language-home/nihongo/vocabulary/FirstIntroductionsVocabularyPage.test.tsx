import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test } from 'vitest';
import { FirstIntroductionsVocabularyPage } from './FirstIntroductionsVocabularyPage';

test('places the full listenable conversation before the topic vocabulary lists', () => {
  render(<MemoryRouter><FirstIntroductionsVocabularyPage /></MemoryRouter>);
  const conversation = screen.getByRole('region', { name: 'A first conversation.' });
  expect(conversation.querySelectorAll('.dialogue-line')).toHaveLength(11);
  expect(within(conversation).getByRole('button', { name: 'Play dialogue' })).toBeInTheDocument();
  expect(within(conversation).getAllByRole('list', { name: 'Key vocabulary' })).toHaveLength(11);
  expect(within(conversation).getAllByText('DevOpsチーム', { exact: true })).toHaveLength(2);
  expect(within(conversation).getByText(/I completely forgot I had a meeting scheduled/)).toBeInTheDocument();
  expect(within(conversation).getByText(/Let’s have a proper chat another time/)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'People & names' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Countries & origins' })).toBeInTheDocument();
});
