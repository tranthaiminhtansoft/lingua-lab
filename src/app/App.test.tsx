import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders the source-faithful Kana route inside the host shell', () => {
  render(<MemoryRouter initialEntries={['/lessons/kana']}><App /></MemoryRouter>);

  expect(screen.getByRole('heading', { level: 1, name: /Kana/ })).toBeInTheDocument();
  expect(screen.getByText('Learn one sound at a time')).toBeInTheDocument();
  expect(screen.getByText('Kana', { selector: '.nav-current' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('button', { name: /Random practice/i })).toBeInTheDocument();
});

test('real Kana route renders the approved basics guide and advances only for unmodified ArrowRight', () => {
  const random = vi.spyOn(Math, 'random')
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0.99)
    .mockReturnValueOnce(0.99);

  try {
    render(<MemoryRouter initialEntries={['/lessons/kana']}><App /></MemoryRouter>);

    const guide = screen.getByRole('heading', { name: /Learn the basics/i }).closest('section');
    expect(guide).toHaveTextContent('基本を学ぶ');
    ['Hiragana', 'Katakana', 'Romaji', 'Dakuten', 'Handakuten'].forEach((term) => expect(guide).toHaveTextContent(term));

    const glyph = screen.getByTestId('practice-glyph');
    const initialGlyph = glyph.textContent;
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(glyph).not.toHaveTextContent(initialGlyph ?? '');

    const advancedGlyph = glyph.textContent;
    const rate = screen.getByRole('slider', { name: 'Speech rate' });
    rate.focus();
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    fireEvent.keyDown(window, { key: 'ArrowRight', ctrlKey: true });
    expect(glyph).toHaveTextContent(advancedGlyph ?? '');
  } finally {
    random.mockRestore();
  }
});
