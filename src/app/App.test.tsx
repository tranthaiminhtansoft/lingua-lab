import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('uses the language constellation as the default home and links Nihongo to its learning path', () => {
  render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);

  expect(screen.getByRole('heading', { level: 1, name: 'Find your language.' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Explore Nihongo learning path' })).toHaveAttribute('href', '/nihongo-o-benkyuo');
  expect(screen.getByRole('img', { name: 'English learning path coming soon' })).toBeInTheDocument();
  expect(screen.queryByRole('navigation', { name: 'Primary' })).not.toBeInTheDocument();
});

test('moves the current Lessons lobby to /nihongo-o-benkyuo', () => {
  render(<MemoryRouter initialEntries={['/nihongo-o-benkyuo']}><App /></MemoryRouter>);

  expect(screen.getByRole('heading', { level: 1, name: /Nihongo O Benkyou/i })).toBeInTheDocument();
  expect(screen.getByText('Lessons', { selector: '.nav-current' })).toHaveAttribute('aria-current', 'page');
});

test('renders the source-faithful Kana route inside the host shell', () => {
  render(<MemoryRouter initialEntries={['/nihongo-o-benkyuo/kana']}><App /></MemoryRouter>);

  expect(screen.getByRole('heading', { level: 1, name: /Kana/ })).toBeInTheDocument();
  expect(screen.getByText('Learn one sound at a time')).toBeInTheDocument();
  expect(screen.getByText('Kana', { selector: '.nav-current' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('button', { name: /Random practice/i })).toBeInTheDocument();
});

test('redirects the former Kana URL to the nested Nihongo route', () => {
  render(<MemoryRouter initialEntries={['/lessons/kana']}><App /></MemoryRouter>);

  expect(screen.getByRole('heading', { level: 1, name: /Kana/ })).toBeInTheDocument();
  expect(screen.getByText('Kana', { selector: '.nav-current' })).toHaveAttribute('aria-current', 'page');
});

test('real Kana route renders the approved basics guide and advances only for unmodified ArrowRight', () => {
  const random = vi.spyOn(Math, 'random')
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0.99)
    .mockReturnValueOnce(0.99)
    .mockReturnValueOnce(0.5)
    .mockReturnValueOnce(0);

  try {
    render(<MemoryRouter initialEntries={['/nihongo-o-benkyuo/kana']}><App /></MemoryRouter>);

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

    const randomPractice = screen.getByRole('button', { name: /Random practice/i });
    randomPractice.focus();
    fireEvent.keyDown(window, { key: 'ArrowRight', ctrlKey: true });
    expect(glyph).toHaveTextContent(advancedGlyph ?? '');
  } finally {
    random.mockRestore();
  }
});
