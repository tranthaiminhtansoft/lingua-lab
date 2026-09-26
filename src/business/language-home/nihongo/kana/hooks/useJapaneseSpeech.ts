import { useCallback, useEffect, useRef, useState } from 'react';

export type SpeechState = 'loading' | 'ready' | 'unsupported' | 'no-japanese-voice' | 'speaking' | 'error';
type JapaneseVoice = { id: string; lang: string; name: string; voice: SpeechSynthesisVoice };


function toJapaneseVoices(voices: SpeechSynthesisVoice[]): JapaneseVoice[] {
  return voices
    .filter((voice) => {
      const language = voice.lang.toLowerCase();
      return language === 'ja' || language.startsWith('ja-');
    })
    .map((voice, index) => ({
      id: `${voice.voiceURI || voice.name}:${voice.lang}:${index}`,
      lang: voice.lang,
      name: voice.name,
      voice,
    }));
}

function preferredVoiceId(voices: readonly JapaneseVoice[]) {
  const exactJapanese = voices.filter((voice) => voice.lang.toLowerCase() === 'ja-jp');
  return exactJapanese.find((voice) => voice.name.toLowerCase().includes('siri'))?.id
    ?? voices.find((voice) => voice.name.toLowerCase().includes('siri'))?.id
    ?? exactJapanese[0]?.id
    ?? voices[0]?.id;
}

export function useJapaneseSpeech(rate = 0.5) {
  const supported = typeof window !== 'undefined' && Boolean(window.speechSynthesis) && 'SpeechSynthesisUtterance' in window;
  const [state, setState] = useState<SpeechState>(supported ? 'loading' : 'unsupported');
  const [availableVoices, setAvailableVoices] = useState<JapaneseVoice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | undefined>(undefined);
  const playbackId = useRef(0);
  const selectedVoice = availableVoices.find((voice) => voice.id === selectedVoiceId);

  useEffect(() => {
    if (!supported) return;
    const synthesis = window.speechSynthesis;
    const update = () => {
      const japaneseVoices = toJapaneseVoices(synthesis.getVoices());
      setAvailableVoices(japaneseVoices);
      setSelectedVoiceId((current) => japaneseVoices.some((voice) => voice.id === current) ? current : preferredVoiceId(japaneseVoices));
      setState((current) => current === 'speaking' ? current : japaneseVoices.length > 0 ? 'ready' : 'no-japanese-voice');
    };
    const timer = window.setTimeout(update, 0);
    synthesis.addEventListener('voiceschanged', update);
    return () => { window.clearTimeout(timer); synthesis.removeEventListener('voiceschanged', update); };
  }, [supported]);

  useEffect(() => () => {
    playbackId.current += 1;
    window.speechSynthesis?.cancel();
  }, []);


  const cancel = useCallback(() => {
    playbackId.current += 1;
    window.speechSynthesis?.cancel();
    if (selectedVoice) setState('ready');
  }, [selectedVoice]);

  const speak = useCallback((text: string) => {
    if (!selectedVoice || (state !== 'ready' && state !== 'error')) return;
    playbackId.current += 1;
    const currentPlaybackId = playbackId.current;
    try {
      const synthesis = window.speechSynthesis;
      synthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = rate;
      utterance.voice = selectedVoice.voice;
      utterance.onstart = () => {
        if (playbackId.current === currentPlaybackId) setState('speaking');
      };
      utterance.onend = () => {
        if (playbackId.current === currentPlaybackId) setState('ready');
      };
      utterance.onerror = () => {
        if (playbackId.current === currentPlaybackId) setState('error');
      };
      synthesis.speak(utterance);
    } catch {
      if (playbackId.current === currentPlaybackId) setState('error');
    }
  }, [rate, selectedVoice, state]);

  return { state, speak, cancel };
}
