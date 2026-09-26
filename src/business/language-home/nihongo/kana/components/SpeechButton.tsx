import type { SpeechState } from '../hooks/useJapaneseSpeech';

const unavailable = new Set<SpeechState>(['loading', 'unsupported', 'no-japanese-voice']);

export function SpeechButton({ state, onSpeak, onCancel }: { state: SpeechState; onSpeak: () => void; onCancel: () => void }) {
  const disabled = unavailable.has(state);
  const speaking = state === 'speaking';
  const message = state === 'unsupported' ? 'Speech is not supported by this browser.'
    : state === 'no-japanese-voice' ? 'No Japanese voice is available on this device.'
      : state === 'error' ? 'Speech failed. Please try again.'
        : state === 'loading' ? 'Checking Japanese voice availability.'
          : speaking ? 'Speaking the Kana. Select Stop Japanese playback to cancel.'
            : 'Japanese voice is ready. Select a speaker to play the Kana.';
  return <div><button type="button" onClick={speaking ? onCancel : onSpeak} disabled={disabled} aria-describedby="speech-status">{speaking ? 'Stop Japanese playback' : 'Listen in Japanese'}</button><p id="speech-status" role="status">{message}</p></div>;
}
