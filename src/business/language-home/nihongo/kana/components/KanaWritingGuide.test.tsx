import { render, screen } from '@testing-library/react';
import { KanaWritingGuide } from './KanaWritingGuide';

test('renders an accessible animated guide for the selected Kana', () => {
  render(<KanaWritingGuide glyph="あ" />);

  expect(screen.getByTestId('kana-writing-guide')).toHaveAttribute('aria-label', 'Writing guide for あ');
  const guide = screen.getByRole('img', { name: 'Animated stroke guide for あ' });

  expect(guide).toBeInTheDocument();
  expect(guide.querySelectorAll('.writing-guide-numbers circle').length).toBeGreaterThan(0);
  expect(screen.getByText('Follow the animated strokes, then say the Kana aloud.')).toBeInTheDocument();
});
