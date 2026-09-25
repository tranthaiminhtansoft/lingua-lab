import { fireEvent, render, screen } from '@testing-library/react';
import { PracticeCard } from './PracticeCard';
const entry = { hiragana: 'あ', katakana: 'ア', romaji: 'a', group: 'basic' as const };
test('shows exact cue and supports Next and unmodified ArrowRight', () => {
  const onNext = vi.fn(); render(<PracticeCard entry={entry} onNext={onNext} speechControl={<span />} />);
  expect(screen.getByText('Hãy phát âm to chữ này')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Next' })); fireEvent.keyDown(window, { key: 'ArrowRight' });
  expect(onNext).toHaveBeenCalledTimes(2);
  fireEvent.keyDown(window, { key: 'ArrowRight', ctrlKey: true }); expect(onNext).toHaveBeenCalledTimes(2);
});
test('does not advance while an editable input is focused', () => {
  const onNext = vi.fn(); render(<><input aria-label="edit" /><PracticeCard entry={entry} onNext={onNext} speechControl={<span />} /></>);
  screen.getByRole('textbox', { name: 'edit' }).focus(); fireEvent.keyDown(window, { key: 'ArrowRight' }); expect(onNext).not.toHaveBeenCalled();
});
