import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { KanaPage } from './KanaPage';

test('ports the source lesson markers, inventory, and sound-mark sections', () => {
  render(<KanaPage />);

  expect(screen.getByText('Learn one sound at a time')).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 1, name: /Kana/ })).toBeInTheDocument();
  expect(document.querySelector('#basics')).toBeInTheDocument();
  expect(document.querySelector('#practice')).toBeInTheDocument();
  expect(screen.getByTestId('kana-writing-guide')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: /Animated stroke guide for/ })).toBeInTheDocument();
  expect(screen.getByText('Practice tips')).toBeInTheDocument();
  expect(document.querySelectorAll('.practice-tips li')).toHaveLength(3);
  expect(document.querySelector('#tables')).toBeInTheDocument();
  expect(document.querySelector('#yoon')).toBeInTheDocument();
  expect(document.querySelector('#sokuon')).toBeInTheDocument();
  expect(document.querySelector('#choon')).toBeInTheDocument();
  expect(screen.getByText('71 complete pairs')).toBeInTheDocument();
  const reference = document.querySelector('#tables');
  expect(reference).toBeInTheDocument();
  expect(reference).toHaveAttribute('aria-labelledby', 'tables-title');
  expect(within(reference as HTMLElement).getAllByRole('table')).toHaveLength(3);
  expect(within(reference as HTMLElement).getAllByRole('row')).toHaveLength(16);
  expect(screen.getByRole('heading', { name: /Yōon/ })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Sokuon/ })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Chōon/ })).toBeInTheDocument();
});

test('opens the fixed Kana section menu with preserved anchors and a disabled current section', () => {
  render(<KanaPage />);

  const trigger = screen.getByRole('button', { name: 'Open Kana sections' });
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByRole('navigation', { name: 'Kana sections' })).not.toBeInTheDocument();

  fireEvent.click(trigger);

  const sectionNavigation = screen.getByRole('navigation', { name: 'Kana sections' });
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(sectionNavigation).toHaveAttribute('id', 'kana-section-menu');
  expect(Array.from(sectionNavigation.children, (item) => item.textContent)).toEqual(['Basics', 'Reference', 'Practice', 'Yōon', 'Sokuon', 'Chōon']);
  expect(screen.getByText('Basics', { selector: '[aria-current="location"]' })).toHaveAttribute('aria-disabled', 'true');
  expect(screen.getByText('Basics', { selector: '[aria-current="location"]' }).closest('a')).toBeNull();
  expect(screen.getByRole('link', { name: 'Practice' })).toHaveAttribute('href', '#practice');
  expect(screen.getByRole('link', { name: 'Reference' })).toHaveAttribute('href', '#tables');
  expect(screen.getByRole('link', { name: 'Yōon' })).toHaveAttribute('href', '#yoon');
  expect(screen.getByRole('link', { name: 'Sokuon' })).toHaveAttribute('href', '#sokuon');
  expect(screen.getByRole('link', { name: 'Chōon' })).toHaveAttribute('href', '#choon');
});

test('closes the Kana section menu on outside pointer press and Escape', () => {
  render(<KanaPage />);

  const trigger = screen.getByRole('button', { name: 'Open Kana sections' });
  fireEvent.click(trigger);
  fireEvent.pointerDown(document.body);
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByRole('navigation', { name: 'Kana sections' })).not.toBeInTheDocument();

  trigger.focus();
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(trigger).toHaveFocus();
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('reveals the back-to-top control after scrolling and scrolls smoothly to the page top', () => {
  const scrollTo = vi.fn();
  const originalScrollY = window.scrollY;
  const originalScrollTo = window.scrollTo;
  Object.defineProperty(window, 'scrollTo', { configurable: true, value: scrollTo });

  try {
    render(<KanaPage />);
    expect(screen.queryByRole('button', { name: 'Back to top' })).not.toBeInTheDocument();

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 301 });
    fireEvent.scroll(window);

    fireEvent.click(screen.getByRole('button', { name: 'Back to top' }));
    expect(scrollTo).toHaveBeenCalledWith({ behavior: 'smooth', top: 0 });
  } finally {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: originalScrollY });
    Object.defineProperty(window, 'scrollTo', { configurable: true, value: originalScrollTo });
  }
});

test('queues Japanese practice playback while preserving random practice', async () => {
  const random = vi.spyOn(Math, 'random').mockReturnValueOnce(0.99).mockReturnValueOnce(0.99).mockReturnValueOnce(0.98).mockReturnValueOnce(0);
  const speak = vi.fn();
  const voice = { lang: 'ja-JP', name: 'Japanese' } as SpeechSynthesisVoice;
  const synthesis = { getVoices: () => [voice], speak, cancel: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() };
  const original = window.speechSynthesis;
  const OriginalUtterance = window.SpeechSynthesisUtterance;
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synthesis });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: vi.fn(function (text: string) { return { text, lang: '', rate: 1, voice: null, onstart: null, onend: null, onerror: null } as unknown as SpeechSynthesisUtterance; }) });

  try {
    render(<KanaPage />);
    const glyph = screen.getByTestId('practice-glyph');
    const initialGlyph = glyph.textContent;
    fireEvent.click(screen.getByRole('button', { name: /Random practice/i }));

    expect(glyph).not.toHaveTextContent(initialGlyph ?? '');
    await waitFor(() => expect(screen.getByRole('button', { name: `Play Japanese pronunciation for ${glyph.textContent}` })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: `Play Japanese pronunciation for ${glyph.textContent}` }));
    expect(speak).toHaveBeenCalledOnce();
    expect(speak).toHaveBeenCalledWith(expect.objectContaining({ text: glyph.textContent, lang: 'ja-JP', rate: 0.1, voice }));
  } finally {
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: original });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: OriginalUtterance });
    random.mockRestore();
  }
});

test('renders Speech rate at 0.1 initially and lets learners configure it without a Japanese voice selector', async () => {
  const speak = vi.fn();
  const voice = { lang: 'ja-JP', name: 'Japanese' } as SpeechSynthesisVoice;
  const synthesis = { getVoices: () => [voice], speak, cancel: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() };
  const original = window.speechSynthesis;
  const OriginalUtterance = window.SpeechSynthesisUtterance;
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synthesis });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: vi.fn(function (text: string) { return { text, lang: '', rate: 1, voice: null, onstart: null, onend: null, onerror: null } as unknown as SpeechSynthesisUtterance; }) });

  try {
    render(<KanaPage />);
    const rate = screen.getByRole('slider', { name: 'Speech rate' });
    expect(rate).toHaveAttribute('min', '0.1');
    expect(rate).toHaveAttribute('max', '1');
    expect(rate).toHaveAttribute('step', '0.05');
    expect(rate).toHaveValue('0.1');
    expect(screen.queryByRole('combobox', { name: 'Japanese voice' })).not.toBeInTheDocument();

    fireEvent.change(rate, { target: { value: '0.75' } });
    expect(screen.getByText('0.75×')).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByRole('button', { name: /Play Japanese pronunciation for/ })[0]).toBeEnabled());
    fireEvent.click(screen.getAllByRole('button', { name: /Play Japanese pronunciation for/ })[0]);
    expect(speak).toHaveBeenCalledWith(expect.objectContaining({ rate: 0.75, voice }));
  } finally {
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: original });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: OriginalUtterance });
  }
});

test('connects every sound-mark speaker to the Japanese glyph instead of romaji', async () => {
  const speak = vi.fn();
  const voice = { lang: 'ja-JP', name: 'Japanese' } as SpeechSynthesisVoice;
  const synthesis = { getVoices: () => [voice], speak, cancel: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() };
  const original = window.speechSynthesis;
  const OriginalUtterance = window.SpeechSynthesisUtterance;
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synthesis });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: vi.fn(function (text: string) { return { text, lang: '', rate: 1, voice: null, onstart: null, onend: null, onerror: null } as unknown as SpeechSynthesisUtterance; }) });

  try {
    render(<KanaPage />);
    await waitFor(() => expect(screen.getAllByRole('button', { name: /Play Japanese pronunciation for/ })[0]).toBeEnabled());
    await waitFor(() => expect(screen.getAllByRole('button', { name: /Play Japanese pronunciation for/ })).toHaveLength(47));
    fireEvent.click(screen.getByRole('button', { name: 'Play Japanese pronunciation for きゃ' }));
    fireEvent.click(screen.getByRole('button', { name: 'Play Japanese pronunciation for きって' }));
    fireEvent.click(screen.getByRole('button', { name: 'Play Japanese pronunciation for ケーキ' }));

    expect(speak.mock.calls.map(([utterance]) => utterance.text)).toEqual(['きゃ', 'きって', 'ケーキ']);
  } finally {
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: original });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: OriginalUtterance });
  }
});

test('disables every speaker and reports no Japanese voice without pretending playback worked', async () => {
  const synthesis = { getVoices: () => [], speak: vi.fn(), cancel: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() };
  const original = window.speechSynthesis;
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synthesis });

  try {
    render(<KanaPage />);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('No Japanese voice is available on this device.'));
    expect(screen.getByRole('slider', { name: 'Speech rate' })).toBeEnabled();
    expect(screen.getAllByRole('button', { name: /Play Japanese pronunciation for/ })).toHaveLength(47);
    screen.getAllByRole('button', { name: /Play Japanese pronunciation for/ }).forEach((button) => expect(button).toBeDisabled());
  } finally {
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: original });
  }
});
