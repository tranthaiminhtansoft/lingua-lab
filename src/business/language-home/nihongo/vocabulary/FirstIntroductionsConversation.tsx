import { useCallback, useEffect, useRef, useState } from 'react';
import { JapaneseWithRomaji } from '../grammar/components/JapaneseWithRomaji';
import { vocabularyGroups } from './content/firstIntroductions';

const pair = (japanese: string, romaji: string, alternative?: readonly [string, string]) => alternative
  ? [japanese, romaji, alternative] as const
  : [japanese, romaji] as const;

const conversation = [
  {
    speaker: '山田', side: 'dialogue-a',
    parts: [pair('はじめまして。', 'Hajimemashite.'), pair('DevOpsチーム', 'DebOppusu chīmu'), pair('の', 'no'), pair('山田', 'Yamada'), pair('です。', 'desu')],
    translation: 'Nice to meet you. I’m Yamada from the DevOps team.',
    terms: ['はじめまして', 'DevOpsチーム'],
  },
  {
    speaker: '森', side: 'dialogue-b',
    parts: [pair('はじめまして。', 'Hajimemashite.'), pair('今日', 'kyō'), pair('から', 'kara'), pair('QAチーム', 'kyū ē chīmu'), pair('に', 'ni'), pair('入りました。', 'hairimashita'), pair('森', 'Mori'), pair('です。', 'desu'), pair('よろしく', 'yoroshiku'), pair('お願いします。', 'onegaishimasu')],
    translation: 'Nice to meet you. I’m Mori, and I’ve just joined the QA team. I look forward to working with you.',
    terms: ['はじめまして', '今日から', 'QAチーム', 'よろしくお願いします'],
  },
  {
    speaker: '山田', side: 'dialogue-a',
    parts: [pair('森', 'Mori'), pair('さん', 'san'), pair('ですね。', 'desu ne.'), pair('入社', 'nyūsha'), pair('した', 'shita'), pair('ばかり', 'bakari'), pair('なん', 'nan'), pair('ですね。', 'desu ne.')],
    translation: 'You’re Mori, right? You’ve just joined the company, then.',
    terms: ['〜さん', '入社したばかり'],
  },
  {
    speaker: '森', side: 'dialogue-b',
    parts: [pair('はい。', 'Hai.'), pair('わからない', 'wakaranai'), pair('こと', 'koto'), pair('ばかり', 'bakari'), pair('ですが、', 'desu ga,'), pair('よろしく', 'yoroshiku'), pair('お願いします。', 'onegaishimasu')],
    translation: 'Yes. There’s still a lot I don’t know, but I look forward to working with you.',
    terms: ['はい', 'わからないことばかり', 'よろしくお願いします'],
  },
  {
    speaker: '山田', side: 'dialogue-a',
    parts: [pair('こちらこそ。', 'Kochira koso.'), pair('何か', 'nanika'), pair('あったら', 'attara'), pair('いつでも', 'itsudemo'), pair('聞いて', 'kiite'), pair('ください。', 'kudasai')],
    translation: 'Likewise. If anything comes up, feel free to ask me anytime.',
    terms: ['こちらこそよろしくお願いします', 'いつでも聞いてください'],
  },
  {
    speaker: '森', side: 'dialogue-b',
    parts: [pair('ありがとうございます。', 'Arigatō gozaimasu.')],
    translation: 'Thank you very much.',
    terms: ['ありがとうございます'],
  },
  {
    speaker: '山田', side: 'dialogue-a',
    parts: [pair('あっ、', 'A,'), pair('すみません。', 'Sumimasen.'), pair('このあと', 'kono ato'), pair('急きょ', 'kyūkyo'), pair('ミーティング', 'mītingu'), pair('が', 'ga'), pair('入っていた', 'haitte ita'), pair('のを', 'no o'), pair('すっかり', 'sukkari'), pair('忘れていました。', 'wasurete imashita')],
    translation: 'Oh, I’m sorry! I completely forgot I had a meeting scheduled right after this.',
    terms: ['すみません', 'このあと', '急きょ', 'ミーティング', '忘れていました'],
  },
  {
    speaker: '森', side: 'dialogue-b',
    parts: [pair('あっ、', 'A,'), pair('そうなん', 'sō nan'), pair('ですね。', 'desu ne.'), pair('お仕事中', 'oshigoto-chū'), pair('に', 'ni'), pair('声', 'koe'), pair('を', 'o'), pair('かけて', 'kakete'), pair('しまって', 'shimatte'), pair('すみません。', 'sumimasen.')],
    translation: 'Oh, I see. Sorry for interrupting you while you’re working.',
    terms: ['そうなんですね', 'お仕事', 'お仕事中', '声をかける', 'すみません'],
  },
  {
    speaker: '山田', side: 'dialogue-a',
    parts: [pair('いえいえ。', 'Ie ie.'), pair('こちらこそ。', 'Kochira koso.'), pair('今度', 'kondo'), pair('ゆっくり', 'yukkuri'), pair('お話し', 'ohanashi'), pair('しましょう。', 'shimashō.')],
    translation: 'Not at all. Likewise. Let’s have a proper chat another time.',
    terms: ['いえいえ', '今度ゆっくりお話ししましょう'],
  },
  {
    speaker: '森', side: 'dialogue-b',
    parts: [pair('はい、', 'Hai,'), pair('ぜひ。', 'zehi.'), pair('お仕事', 'oshigoto'), pair('頑張って', 'ganbatte'), pair('ください。', 'kudasai')],
    translation: 'Yes, I’d like that. Good luck with your meeting!',
    terms: ['はい', 'ぜひ', '頑張ってください'],
  },
  {
    speaker: '山田', side: 'dialogue-a',
    parts: [pair('ありがとうございます。', 'Arigatō gozaimasu.'), pair('失礼します。', 'Shitsurei shimasu.')],
    translation: 'Thanks. Excuse me; I’ll be off.',
    terms: ['ありがとうございます', '失礼します'],
  },
] as const;

const dialogueSpeechReadings: Readonly<Record<string, string>> = {
  森: 'もり', 山田: 'やまだ', 'DevOpsチーム': 'デブオプスチーム', 'QAチーム': 'キューエーチーム',
};
const vocabularyByHeadword = new Map(vocabularyGroups.flatMap(({ words }) => words.map((entry) => [entry[0], entry] as const)));

function splitJapaneseSpeechAtPunctuation(text: string) {
  return text.match(/[^、。！？!?]+[、。！？!?]?/gu)?.filter(Boolean) ?? [text];
}

export function FirstIntroductionsConversation() {
  type PlaybackState = 'idle' | 'playing' | 'paused';
  const [speechAvailability, setSpeechAvailability] = useState<'loading' | 'ready' | 'no-japanese-voice' | 'unsupported' | 'error'>(() =>
    'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window ? 'loading' : 'unsupported',
  );
  const [japaneseVoice, setJapaneseVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const playbackId = useRef(0);
  const playbackStateRef = useRef<PlaybackState>('idle');
  const scheduledAction = useRef<{ timer: number; dueAt: number; callback: () => void } | null>(null);
  const pendingAction = useRef<{ remaining: number; callback: () => void } | null>(null);

  const updatePlaybackState = (nextState: PlaybackState) => {
    playbackStateRef.current = nextState;
    setPlaybackState(nextState);
  };

  const clearInterTurnTimer = useCallback(() => {
    if (scheduledAction.current !== null) {
      window.clearTimeout(scheduledAction.current.timer);
      scheduledAction.current = null;
    }
  }, []);

  const scheduleAction = useCallback((callback: () => void, delay: number) => {
    if (playbackStateRef.current === 'paused') {
      pendingAction.current = { callback, remaining: delay };
      return;
    }
    clearInterTurnTimer();
    const dueAt = Date.now() + delay;
    const timer = window.setTimeout(() => {
      scheduledAction.current = null;
      callback();
    }, delay);
    scheduledAction.current = { timer, dueAt, callback };
  }, [clearInterTurnTimer]);

  useEffect(() => {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return;
    const synthesis = window.speechSynthesis;
    const updateVoice = () => {
      const japaneseVoices = synthesis.getVoices().filter((voice) => /^ja(?:-|$)/i.test(voice.lang));
      const voice = japaneseVoices.find((candidate) => candidate.lang.toLowerCase() === 'ja-jp' && candidate.name.toLowerCase().includes('siri'))
        ?? japaneseVoices.find((candidate) => candidate.lang.toLowerCase() === 'ja-jp')
        ?? japaneseVoices[0]
        ?? null;
      setJapaneseVoice(voice);
      setSpeechAvailability(voice ? 'ready' : 'no-japanese-voice');
    };
    updateVoice();
    synthesis.addEventListener('voiceschanged', updateVoice);
    return () => {
      synthesis.removeEventListener('voiceschanged', updateVoice);
      playbackId.current += 1;
      clearInterTurnTimer();
      pendingAction.current = null;
      synthesis.cancel();
    };
  }, [clearInterTurnTimer]);

  const pausePlayback = () => {
    const synthesis = window.speechSynthesis;
    if (playbackStateRef.current !== 'playing') return;
    const action = scheduledAction.current;
    if (action) {
      window.clearTimeout(action.timer);
      scheduledAction.current = null;
      pendingAction.current = { callback: action.callback, remaining: Math.max(0, action.dueAt - Date.now()) };
    }
    synthesis.pause();
    updatePlaybackState('paused');
  };

  const resumePlayback = () => {
    if (playbackStateRef.current !== 'paused') return;
    updatePlaybackState('playing');
    window.speechSynthesis.resume();
    const action = pendingAction.current;
    pendingAction.current = null;
    if (action) scheduleAction(action.callback, action.remaining);
  };

  const startPlayback = () => {
    if (!japaneseVoice) return;

    const synthesis = window.speechSynthesis;
    const currentPlaybackId = ++playbackId.current;
    updatePlaybackState('playing');
    setActiveLine(null);
    clearInterTurnTimer();
    pendingAction.current = null;
    synthesis.cancel();
    const voice = japaneseVoice;

    const failPlayback = () => {
      if (playbackId.current !== currentPlaybackId) return;
      playbackId.current += 1;
      updatePlaybackState('idle');
      clearInterTurnTimer();
      pendingAction.current = null;
      synthesis.cancel();
      setActiveLine(null);
      setSpeechAvailability('error');
    };

    const speakLine = (index: number, segmentIndex = 0) => {
      if (playbackId.current !== currentPlaybackId) return;
      const line = conversation[index];
      if (!line) return;
      try {
        const spokenText = line.parts.map(([japanese]) => dialogueSpeechReadings[japanese] ?? japanese).join('');
        const speechSegments = splitJapaneseSpeechAtPunctuation(spokenText);
        const segment = speechSegments[segmentIndex] ?? spokenText;
        const utterance = new SpeechSynthesisUtterance(segment);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.82;
        utterance.voice = voice;
        utterance.onstart = () => { if (playbackId.current === currentPlaybackId) setActiveLine(index); };
        utterance.onend = () => {
          if (playbackId.current !== currentPlaybackId) return;
          if (segmentIndex < speechSegments.length - 1) {
            const pause = /[、,]$/.test(segment) ? 300 : 480;
            scheduleAction(() => speakLine(index, segmentIndex + 1), pause);
            return;
          }
          if (index === conversation.length - 1) {
            updatePlaybackState('idle');
            return;
          }
          const lineText = line.parts.map(([japanese]) => japanese).join('');
          const pause = lineText.includes('か。') || lineText.includes('？') ? 1200 : 560;
          scheduleAction(() => speakLine(index + 1), pause);
        };
        utterance.onerror = failPlayback;
        synthesis.speak(utterance);
      } catch {
        failPlayback();
      }
    };
    speakLine(0);
  };

  const isUnavailable = speechAvailability === 'loading' || speechAvailability === 'unsupported' || speechAvailability === 'no-japanese-voice';
  const progress = activeLine === null ? 0 : activeLine + 1;
  const playbackButtonLabel = playbackState === 'playing' ? 'Pause dialogue' : playbackState === 'paused' ? 'Resume dialogue' : 'Play dialogue';
  const playbackMessage = playbackState === 'playing' ? `Reading turn ${progress} of ${conversation.length}; highlighted below.`
    : playbackState === 'paused' ? `Paused at turn ${progress} of ${conversation.length}. Resume to continue.`
      : activeLine !== null && progress === conversation.length ? 'Conversation complete. Play again from the beginning or restart.'
        : speechAvailability === 'loading' ? 'Loading Japanese voice…'
          : speechAvailability === 'no-japanese-voice' ? 'No Japanese voice is available on this device.'
            : speechAvailability === 'unsupported' ? 'Japanese speech is not available in this browser.'
              : speechAvailability === 'error' ? 'Speech could not be played. Try again.'
                : 'Play all turns from the beginning.';

  return <section aria-labelledby="conversation-title" className="vocabulary-conversation" id="conversation">
    <div className="grammar-section-title">
      <div><p className="grammar-eyebrow">Words in a real exchange <span lang="ja">会話のことば</span></p><h2 id="conversation-title">A first conversation.</h2></div>
      <p>Listen or read the full exchange. Key vocabulary is listed under each turn and expanded in the word groups below.</p>
    </div>
    <div className="dialogue-card">
      <div aria-label="Speaker marker key" className="dialogue-speaker-key">
        <span><b className="dialogue-speaker-key-red" lang="ja">山田</b><span>Red marker · Arata (man)</span></span>
        <span><b className="dialogue-speaker-key-blue" lang="ja">森</b><span>Blue marker · Wakana (woman)</span></span>
      </div>
      <div className="dialogue-playback">
        <button className="dialogue-playback-button" disabled={isUnavailable} onClick={playbackState === 'playing' ? pausePlayback : playbackState === 'paused' ? resumePlayback : startPlayback} type="button">
          <span aria-hidden="true">{playbackState === 'playing' ? 'Ⅱ' : playbackState === 'paused' ? '▶' : '▶'}</span>{playbackButtonLabel}
        </button>
        <button aria-label="Restart dialogue" className="dialogue-restart-button" disabled={isUnavailable || (playbackState === 'idle' && activeLine === null)} onClick={startPlayback} type="button">↺ Restart</button>
        <p aria-live="polite" className="dialogue-playback-status">{playbackMessage}</p>
      </div>
      <div aria-label="Conversation playback progress" aria-valuemax={conversation.length} aria-valuemin={0} aria-valuenow={progress} aria-valuetext={activeLine === null ? 'Not started' : playbackMessage} className="dialogue-progress" role="progressbar">
        <span className="dialogue-progress-fill" style={{ width: `${progress / conversation.length * 100}%` }} />
      </div>
      {conversation.map((line, index) => <div aria-current={activeLine === index && playbackState !== 'idle' ? 'true' : undefined} className={`dialogue-line ${line.side}${activeLine === index && playbackState !== 'idle' ? ' is-speaking' : ''}${activeLine === index && playbackState === 'paused' ? ' is-paused' : ''}`} id={`conversation-line-${index}`} key={`${line.speaker}-${index}`}>
        <span className="dialogue-speaker" lang="ja">{line.speaker}</span>
        <div>
          <JapaneseWithRomaji parts={line.parts} />
          <p className="dialogue-meaning">{line.translation}</p>
          <ul aria-label="Key vocabulary" className="conversation-keywords">{line.terms.map((headword) => {
            const entry = vocabularyByHeadword.get(headword);
            return entry ? <li key={headword}><span lang="ja">{entry[0]}</span><small lang="ja-Latn">{entry[1]}</small><span>{entry[2]}</span></li> : null;
          })}</ul>
        </div>
      </div>)}
      <p className="dialogue-name-note">These fictional Japanese practice names use the given names 新 (Arata, “new”) and 若菜 (Wakana, “young edible greens”). 若菜 is only a loose botanical association with one possible sense of Thảo when written as 草 (grass/plants), not an exact translation. Surname + さん is a common polite choice at a first meeting.</p>
    </div>
  </section>;
}
