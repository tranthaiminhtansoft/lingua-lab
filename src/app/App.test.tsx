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

test('renders Grammar topics and the complete first-introductions lesson', () => {
  const { unmount } = render(<MemoryRouter initialEntries={['/nihongo-o-benkyuo/grammar']}><App /></MemoryRouter>);

  expect(screen.getByRole('heading', { level: 1, name: /Grammar 文法/ })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Explore this topic/ })).toHaveAttribute('href', '/nihongo-o-benkyuo/grammar/first-introductions');

  unmount();
  render(<MemoryRouter initialEntries={['/nihongo-o-benkyuo/grammar/first-introductions']}><App /></MemoryRouter>);
  expect(screen.getByRole('heading', { level: 1, name: /First introductions/ })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Build the patterns.' })).toBeInTheDocument();
  expect(screen.queryByText('Countries & origins')).not.toBeInTheDocument();
  expect(screen.queryByText('First-meeting phrases')).not.toBeInTheDocument();
  expect(screen.getByText('Say that you are also a student at a school.')).toBeInTheDocument();
  expect(document.querySelectorAll('#patterns .grammar-formula-pairs')).toHaveLength(6);
  const alignedWord = document.querySelector('#patterns .grammar-formula-pairs .japanese-romaji-pair');
  expect(alignedWord?.querySelector('[lang="ja"]')).toHaveTextContent('N1');
  expect(alignedWord?.querySelector('[lang="ja-Latn"]')).toHaveTextContent('N1');
  const questionPattern = document.querySelectorAll('#patterns .grammar-formula-pairs')[5];
  const dareWord = Array.from(questionPattern.querySelectorAll('.japanese-romaji-pair')).find((part) => part.querySelector('[lang="ja"]')?.textContent === 'だれ');
  expect(dareWord?.querySelector('[lang="ja-Latn"]')).toHaveTextContent('dare');
  const negativePattern = document.querySelectorAll('.grammar-pattern-card')[1];
  const negativeFormulaAlternative = negativePattern.querySelector('.grammar-formula .japanese-romaji-alternative');
  expect(negativeFormulaAlternative?.querySelector('[lang="ja"]')).toHaveTextContent('では');
  expect(negativeFormulaAlternative?.querySelector('[lang="ja-Latn"]')).toHaveTextContent('de wa');
  const negativeExampleAlternative = negativePattern.querySelector('.grammar-example .japanese-romaji-alternative');
  expect(negativeExampleAlternative?.querySelector('[lang="ja"]')).toHaveTextContent('では');
  expect(negativeExampleAlternative?.querySelector('[lang="ja-Latn"]')).toHaveTextContent('de wa');
  expect(screen.getAllByText('Hajimemashite.')).toHaveLength(3);
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
