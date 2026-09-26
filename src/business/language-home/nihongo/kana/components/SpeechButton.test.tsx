import { fireEvent, render, screen } from '@testing-library/react';
import { SpeechButton } from './SpeechButton';

test('explains single Kana playback and lets learners stop playback', () => {
  const onCancel = vi.fn();
  render(<SpeechButton state="speaking" onSpeak={vi.fn()} onCancel={onCancel} />);

  fireEvent.click(screen.getByRole('button', { name: 'Stop Japanese playback' }));

  expect(onCancel).toHaveBeenCalledOnce();
  expect(screen.getByRole('status')).toHaveTextContent('Speaking the Kana. Select Stop Japanese playback to cancel.');
});

test('keeps the listen action available after a speech error so a learner can retry', () => {
  const onSpeak = vi.fn();
  render(<SpeechButton state="error" onSpeak={onSpeak} onCancel={vi.fn()} />);

  fireEvent.click(screen.getByRole('button', { name: 'Listen in Japanese' }));

  expect(onSpeak).toHaveBeenCalledOnce();
});
