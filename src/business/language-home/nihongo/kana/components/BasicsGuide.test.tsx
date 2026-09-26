import { render, screen } from '@testing-library/react';
import { BasicsGuide } from './BasicsGuide';
test('renders the bilingual eight-concept basics guide', () => {
  render(<BasicsGuide />);
  expect(screen.getByRole('heading', { name: /Learn the basics/i })).toHaveTextContent('基本を学ぶ');
  ['Hiragana', 'Katakana', 'Romaji', 'Dakuten', 'Handakuten', 'Yōon', 'Sokuon', 'Chōon'].forEach((term) => expect(screen.getByText(term)).toBeInTheDocument());
  expect(screen.getByText(/Adds two small strokes/)).toBeInTheDocument();
  expect(screen.getByText(/Adds a small circle/)).toBeInTheDocument();
});
