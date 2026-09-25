import { render, screen } from '@testing-library/react';
import { BasicsGuide } from './BasicsGuide';
test('renders the bilingual five-concept basics guide', () => {
  render(<BasicsGuide />);
  expect(screen.getByRole('heading', { name: /Learn the basics/i })).toHaveTextContent('基本を学ぶ');
  ['Hiragana', 'Katakana', 'Romaji', 'Dakuten', 'Handakuten'].forEach((term) => expect(screen.getByText(term)).toBeInTheDocument());
});
