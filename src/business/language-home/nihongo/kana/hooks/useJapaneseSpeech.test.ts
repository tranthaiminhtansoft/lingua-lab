import { act, renderHook, waitFor } from '@testing-library/react';
import { useJapaneseSpeech } from './useJapaneseSpeech';
test('reports unsupported browser speech honestly', () => {
  const original = window.speechSynthesis; Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: undefined });
  const { result } = renderHook(() => useJapaneseSpeech()); expect(result.current.state).toBe('unsupported');
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: original });
});
test('prefers a Siri voice among exact ja-JP voices and uses a slower clarity-oriented rate', async () => {
  const speak = vi.fn();
  const kyoko = { lang: 'ja-JP', name: 'Kyoko' } as SpeechSynthesisVoice;
  const voice = { lang: 'ja-JP', name: 'Siri Japanese (Voice 2)' } as SpeechSynthesisVoice;
  const synthesis = {
    getVoices: () => [{ lang: 'ja', name: 'Japanese fallback' } as SpeechSynthesisVoice, kyoko, voice],
    speak,
    cancel: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  const original = window.speechSynthesis;
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synthesis });
  const OriginalUtterance = window.SpeechSynthesisUtterance;
  const utterance = vi.fn(function (this: SpeechSynthesisUtterance, text: string) {
    return { text, lang: '', rate: 1, voice: null, onend: null, onerror: null } as unknown as SpeechSynthesisUtterance;
  });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: utterance });

  const { result } = renderHook(() => useJapaneseSpeech());
  await waitFor(() => expect(result.current.state).toBe('ready'));
  act(() => result.current.speak('あ'));

  expect(speak).toHaveBeenCalledOnce();
  expect(utterance).toHaveBeenCalledWith('あ');
  expect(speak.mock.calls[0][0]).toMatchObject({ lang: 'ja-JP', rate: 0.5, voice });

  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: original });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: OriginalUtterance });
});

test('uses the supplied learner-selected rate while retaining the browser-selected preferred Japanese voice', async () => {
  const speak = vi.fn();
  const siri = { lang: 'ja-JP', name: 'Siri Japanese (Voice 2)' } as SpeechSynthesisVoice;
  const kyoko = { lang: 'ja-JP', name: 'Kyoko' } as SpeechSynthesisVoice;
  const synthesis = { getVoices: () => [siri, kyoko], speak, cancel: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() };
  const original = window.speechSynthesis;
  const OriginalUtterance = window.SpeechSynthesisUtterance;
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synthesis });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: vi.fn(function (text: string) {
    return { text, lang: '', rate: 1, voice: null, onend: null, onerror: null } as unknown as SpeechSynthesisUtterance;
  }) });

  try {
    const { result } = renderHook(() => useJapaneseSpeech(0.75));
    await waitFor(() => expect(result.current.state).toBe('ready'));
    act(() => result.current.speak('あ'));

    expect(speak).toHaveBeenCalledOnce();
    expect(speak.mock.calls[0][0]).toMatchObject({ lang: 'ja-JP', rate: 0.75, voice: siri });
  } finally {
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: original });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: OriginalUtterance });
  }
});

test('uses the only Japanese voice when its language is exactly ja', async () => {
  const speak = vi.fn();
  const voice = { lang: 'ja', name: 'Japanese' } as SpeechSynthesisVoice;
  const synthesis = { getVoices: () => [{ lang: 'en-US', name: 'English' } as SpeechSynthesisVoice, voice], speak, cancel: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() };
  const original = window.speechSynthesis;
  const OriginalUtterance = window.SpeechSynthesisUtterance;
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synthesis });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: vi.fn(function () {
    return { lang: '', rate: 1, voice: null, onend: null, onerror: null } as unknown as SpeechSynthesisUtterance;
  }) });

  try {
    const { result } = renderHook(() => useJapaneseSpeech());
    await waitFor(() => expect(result.current.state).toBe('ready'));
    act(() => result.current.speak('あ'));

    expect(speak).toHaveBeenCalledOnce();
    expect(speak.mock.calls[0][0]).toMatchObject({ voice });
  } finally {
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: original });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: OriginalUtterance });
  }
});

test('falls back to another ja-* voice when no exact ja-JP voice is available', async () => {
  const speak = vi.fn();
  const voice = { lang: 'ja-JP-x-kana', name: 'Japanese fallback' } as SpeechSynthesisVoice;
  const synthesis = { getVoices: () => [voice], speak, cancel: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() };
  const original = window.speechSynthesis;
  const OriginalUtterance = window.SpeechSynthesisUtterance;
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synthesis });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: vi.fn(function () {
    return { lang: '', rate: 1, voice: null, onend: null, onerror: null } as unknown as SpeechSynthesisUtterance;
  }) });

  try {
    const { result } = renderHook(() => useJapaneseSpeech());
    await waitFor(() => expect(result.current.state).toBe('ready'));
    act(() => result.current.speak('あ'));
    expect(speak).toHaveBeenCalledOnce();
    expect(speak.mock.calls[0][0]).toMatchObject({ voice });
  } finally {
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: original });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: OriginalUtterance });
  }
});

test('reports speaking only after speech starts and returns ready after the single utterance ends', async () => {
  vi.useFakeTimers();
  const speak = vi.fn();
  const synthesis = { getVoices: () => [{ lang: 'ja-JP', name: 'Japanese' }], speak, cancel: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() };
  const original = window.speechSynthesis;
  const OriginalUtterance = window.SpeechSynthesisUtterance;
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synthesis });
  const utterance = vi.fn(function () {
    return { lang: '', rate: 1, voice: null, onstart: null, onend: null, onerror: null } as unknown as SpeechSynthesisUtterance;
  });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: utterance });

  try {
    const { result } = renderHook(() => useJapaneseSpeech());
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(result.current.state).toBe('ready');
    act(() => result.current.speak('あ'));
    expect(result.current.state).toBe('ready');
    act(() => speak.mock.calls[0][0].onstart?.(new Event('start') as SpeechSynthesisEvent));
    expect(result.current.state).toBe('speaking');
    act(() => speak.mock.calls[0][0].onend?.(new Event('end') as SpeechSynthesisEvent));
    expect(result.current.state).toBe('ready');
    await act(async () => { await vi.advanceTimersByTimeAsync(400); });
    expect(vi.getTimerCount()).toBe(0);
    expect(utterance).toHaveBeenCalledOnce();
    expect(speak).toHaveBeenCalledOnce();
    expect(result.current.state).toBe('ready');
  } finally {
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: original });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: OriginalUtterance });
    vi.useRealTimers();
  }
});

test('queues one utterance per invocation and cancellation invalidates stale playback callbacks', async () => {
  vi.useFakeTimers();
  const speak = vi.fn();
  const cancel = vi.fn();
  const voice = { lang: 'ja-JP', name: 'Japanese' } as SpeechSynthesisVoice;
  const synthesis = { getVoices: () => [voice], speak, cancel, addEventListener: vi.fn(), removeEventListener: vi.fn() };
  const original = window.speechSynthesis;
  const OriginalUtterance = window.SpeechSynthesisUtterance;
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synthesis });
  const utterance = vi.fn(function (text: string) {
    return { text, lang: '', rate: 1, voice: null, onstart: null, onend: null, onerror: null } as unknown as SpeechSynthesisUtterance;
  });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: utterance });

  try {
    const { result } = renderHook(() => useJapaneseSpeech());
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(result.current.state).toBe('ready');

    act(() => result.current.speak('あ'));
    act(() => speak.mock.calls[0][0].onstart?.(new Event('start') as SpeechSynthesisEvent));
    act(() => speak.mock.calls[0][0].onend?.(new Event('end') as SpeechSynthesisEvent));
    expect(speak).toHaveBeenCalledOnce();
    act(() => result.current.cancel());
    await act(async () => { await vi.advanceTimersByTimeAsync(400); });
    expect(vi.getTimerCount()).toBe(0);
    expect(utterance).toHaveBeenCalledOnce();
    expect(speak).toHaveBeenCalledOnce();
    expect(result.current.state).toBe('ready');
  } finally {
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: original });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: OriginalUtterance });
    vi.useRealTimers();
  }
});

test('allows a fresh user-initiated attempt after an utterance error', async () => {
  const speak = vi.fn();
  const voice = { lang: 'ja-JP', name: 'Japanese' } as SpeechSynthesisVoice;
  const synthesis = { getVoices: () => [voice], speak, cancel: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() };
  const original = window.speechSynthesis;
  const OriginalUtterance = window.SpeechSynthesisUtterance;
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synthesis });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: vi.fn(function () { return { lang: '', rate: 1, voice: null, onerror: null } as unknown as SpeechSynthesisUtterance; }) });

  try {
    const { result } = renderHook(() => useJapaneseSpeech());
    await waitFor(() => expect(result.current.state).toBe('ready'));
    act(() => result.current.speak('あ'));
    act(() => speak.mock.calls[0][0].onerror?.(new Event('error') as SpeechSynthesisErrorEvent));
    expect(result.current.state).toBe('error');

    act(() => result.current.speak('あ'));
    expect(speak).toHaveBeenCalledTimes(2);
  } finally {
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: original });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: OriginalUtterance });
  }
});
