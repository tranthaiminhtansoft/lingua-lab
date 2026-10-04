import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { GrammarPatternCard } from './components/GrammarPatternCard';
import { JapaneseWithRomaji } from './components/JapaneseWithRomaji';
import { GrammarTopicNavigation } from './components/GrammarTopicNavigation';
import { grammarPatterns } from './content/firstIntroductions';
import { questionTypesPath } from './content/questionTypes';

const pair = (japanese: string, romaji: string, alternative?: readonly [string, string]) => alternative
  ? [japanese, romaji, alternative] as const
  : [japanese, romaji] as const;

const firstConversation = [
  {
    speaker: '山田',
    side: 'dialogue-a',
    parts: [pair('はじめまして。', 'Hajimemashite.'), pair('山田新', 'Yamada Arata'), pair('です。', 'desu'), pair('よろしく', 'yoroshiku'), pair('お願いします。', 'onegaishimasu')],
    translation: 'Nice to meet you. I’m Arata Yamada.',
  },
  {
    speaker: '森',
    side: 'dialogue-b',
    parts: [pair('はじめまして。', 'Hajimemashite.'), pair('森若菜', 'Mori Wakana'), pair('です。', 'desu'), pair('こちらこそ、', 'kochira koso,'), pair('よろしく', 'yoroshiku'), pair('お願いします。', 'onegaishimasu')],
    translation: 'Nice to meet you. I’m Wakana Mori. Likewise.',
  },
  {
    speaker: '山田',
    side: 'dialogue-a',
    parts: [pair('森', 'Mori'), pair('さん', 'san'), pair('は', 'wa'), pair('日本人', 'nihonjin'), pair('です', 'desu'), pair('か。', 'ka?')],
    translation: 'Are you Japanese?',
  },
  {
    speaker: '森',
    side: 'dialogue-b',
    parts: [pair('はい、', 'hai,'), pair('日本人', 'nihonjin'), pair('です。', 'desu'), pair('山田', 'Yamada'), pair('さん', 'san'), pair('は？', 'wa?')],
    translation: 'Yes, I am. And you?',
  },
  {
    speaker: '山田',
    side: 'dialogue-a',
    parts: [pair('わたし', 'watashi'), pair('も', 'mo'), pair('日本人', 'nihonjin'), pair('です。', 'desu')],
    translation: 'I am too.',
  },
  {
    speaker: '森',
    side: 'dialogue-b',
    parts: [pair('そうなん', 'sō nan'), pair('です', 'desu'), pair('ね。', 'ne.'), pair('お仕事', 'oshigoto'), pair('は', 'wa'), pair('何', 'nan'), pair('です', 'desu'), pair('か。', 'ka?')],
    translation: 'I see. What do you do?',
  },
  {
    speaker: '山田',
    side: 'dialogue-a',
    parts: [pair('エンジニア', 'enjinia'), pair('です。', 'desu'), pair('森', 'Mori'), pair('さん', 'san'), pair('は？', 'wa?')],
    translation: 'I’m an engineer. And you?',
  },
  {
    speaker: '森',
    side: 'dialogue-b',
    parts: [pair('病院', 'byōin'), pair('の', 'no'), pair('技師', 'gishi'), pair('です。', 'desu')],
    translation: 'I’m a hospital technician.',
  },
  {
    speaker: '森',
    side: 'dialogue-b',
    parts: [pair('そろそろ', 'sorosoro'), pair('失礼', 'shitsurei'), pair('します。', 'shimasu.'), pair('また', 'mata'), pair('お会い', 'oai'), pair('しましょう。', 'shimashō.')],
    translation: 'I should get going. See you again.',
  },
  {
    speaker: '山田',
    side: 'dialogue-a',
    parts: [pair('はい、', 'hai,'), pair('ぜひ。', 'zehi.')],
    translation: 'Yes, I’d like that.',
  },
] as const;

const dialogueSpeechReadings: Readonly<Record<string, string>> = {
  山田新: 'やまだ あらた',
  森若菜: 'もり わかな',
  森: 'もり',
  山田: 'やまだ',
};

function splitJapaneseSpeechAtPunctuation(text: string) {
  return text.match(/[^、。！？!?]+[、。！？!?]?/gu)?.filter(Boolean) ?? [text];
}

const lessonSections = [
  ['opening', 'First words'],
  ['patterns', 'Sentence patterns'],
  ['dialogue', 'Put it together'],
  ['practice', 'Try it'],
] as const;

export function FirstIntroductionsPage() {
  const [speechAvailability, setSpeechAvailability] = useState<'loading' | 'ready' | 'no-japanese-voice' | 'unsupported' | 'error'>(() =>
    'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window ? 'loading' : 'unsupported',
  );
  const [japaneseVoice, setJapaneseVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [activeDialogueLine, setActiveDialogueLine] = useState<number | null>(null);
  const [isPlayingDialogue, setIsPlayingDialogue] = useState(false);
  const playbackId = useRef(0);
  const isPlayingRef = useRef(false);
  const interTurnTimer = useRef<number | null>(null);

  const clearInterTurnTimer = useCallback(() => {
    if (interTurnTimer.current !== null) {
      window.clearTimeout(interTurnTimer.current);
      interTurnTimer.current = null;
    }
  }, []);

  useEffect(() => {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return;

    const synthesis = window.speechSynthesis;
    const updateVoice = () => {
      const voices = synthesis.getVoices();
      const japaneseVoices = voices.filter((voice) => /^ja(?:-|$)/i.test(voice.lang));
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
      isPlayingRef.current = false;
      clearInterTurnTimer();
      synthesis.cancel();
    };
  }, [clearInterTurnTimer]);

  const toggleDialoguePlayback = () => {
    const synthesis = window.speechSynthesis;
    if (isPlayingRef.current) {
      playbackId.current += 1;
      isPlayingRef.current = false;
      clearInterTurnTimer();
      synthesis.cancel();
      setIsPlayingDialogue(false);
      setActiveDialogueLine(null);
      return;
    }
    if (!japaneseVoice) return;

    const currentPlaybackId = ++playbackId.current;
    isPlayingRef.current = true;
    setIsPlayingDialogue(true);
    setActiveDialogueLine(null);
    clearInterTurnTimer();
    synthesis.cancel();
    const voice = japaneseVoice;

    const failPlayback = () => {
      if (playbackId.current !== currentPlaybackId) return;
      playbackId.current += 1;
      isPlayingRef.current = false;
      clearInterTurnTimer();
      synthesis.cancel();
      setIsPlayingDialogue(false);
      setActiveDialogueLine(null);
      setSpeechAvailability('error');
    };

    const speakLine = (index: number, segmentIndex = 0) => {
      if (playbackId.current !== currentPlaybackId) return;
      const line = firstConversation[index];
      if (!line) return;

      try {
        const spokenText = line.parts.map(([japanese]) => dialogueSpeechReadings[japanese] ?? japanese).join('');
        const speechSegments = splitJapaneseSpeechAtPunctuation(spokenText);
        const segment = speechSegments[segmentIndex] ?? spokenText;
        const utterance = new SpeechSynthesisUtterance(segment);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.82;
        utterance.voice = voice;
        utterance.onstart = () => {
          if (playbackId.current === currentPlaybackId) setActiveDialogueLine(index);
        };
        utterance.onend = () => {
          if (playbackId.current !== currentPlaybackId) return;
          if (segmentIndex < speechSegments.length - 1) {
            const pause = /[、,]$/.test(segment) ? 300 : 480;
            interTurnTimer.current = window.setTimeout(() => {
              interTurnTimer.current = null;
              speakLine(index, segmentIndex + 1);
            }, pause);
            return;
          }
          if (index === firstConversation.length - 1) {
            isPlayingRef.current = false;
            setIsPlayingDialogue(false);
            setActiveDialogueLine(null);
            return;
          }

          const lineText = line.parts.map(([japanese]) => japanese).join('');
          const pause = lineText.includes('か。') || lineText.includes('？') ? 1200 : 560;
          interTurnTimer.current = window.setTimeout(() => {
            interTurnTimer.current = null;
            speakLine(index + 1);
          }, pause);
        };
        utterance.onerror = failPlayback;
        synthesis.speak(utterance);
      } catch {
        failPlayback();
      }
    };

    speakLine(0);
  };

  return <main className="grammar-page grammar-topic-page">
    <header className="grammar-topic-hero">
      <Link className="grammar-back-link" to="/nihongo-o-benkyuo/grammar">← Grammar topics</Link>
      <div className="grammar-topic-heading">
        <div>
          <p className="grammar-eyebrow">First topic <span lang="ja">最初のテーマ</span></p>
          <h1>First introductions <span lang="ja">はじめまして</span></h1>
          <p>Meet someone, tell them who you are, and connect simple statements.</p>
        </div>
        <div aria-label="Reference: Minna no Nihongo lesson 1" className="grammar-reference-stamp">
          <span>REFERENCE</span><b>01</b><span>MINNA NO NIHONGO</span>
        </div>
      </div>
    </header>

    <GrammarTopicNavigation sections={lessonSections} />

    <section aria-labelledby="opening-title" className="grammar-opening" id="opening">
      <div className="grammar-opening-copy">
        <p className="grammar-eyebrow">A small ritual <span lang="ja">はじめのあいさつ</span></p>
        <h2 id="opening-title">Begin with a greeting.</h2>
        <p>Greet the person, say your name, then add a polite closing phrase. Japanese often leaves out the subject when it is clear.</p>
      </div>
      <ol aria-label="First-meeting greeting sequence" className="greeting-sequence">
        <li><span>01</span><JapaneseWithRomaji parts={[pair('はじめまして。', 'Hajimemashite.')]} /><small>Nice to meet you.</small></li>
        <li><span>02</span><JapaneseWithRomaji parts={[pair('山田新', 'Yamada Arata'), pair('です。', 'desu')]} /><small>I’m Arata Yamada.</small></li>
        <li><span>03</span><JapaneseWithRomaji parts={[pair('どうぞ', 'dōzo'), pair('よろしく', 'yoroshiku'), pair('お願いします。', 'onegaishimasu')]} /><small>Pleased to meet you.</small></li>
      </ol>
    </section>

    <section aria-labelledby="patterns-title" className="grammar-patterns" id="patterns">
      <div className="grammar-section-title grammar-patterns-title">
        <div><p className="grammar-eyebrow">From one idea to a sentence <span lang="ja">文のかたち</span></p><h2 id="patterns-title">Build the patterns.</h2></div>
        <span className="grammar-pattern-count">{String(grammarPatterns.length).padStart(2, '0')} <small>patterns</small></span>
      </div>
      <div className="grammar-pattern-grid">
        {grammarPatterns.map((pattern) => <GrammarPatternCard key={pattern.number} pattern={pattern} />)}
      </div>
      <p className="grammar-topic-related">Ready to ask questions? <Link to={questionTypesPath}>Explore Yes/No and WH questions →</Link></p>
    </section>

    <section aria-labelledby="dialogue-title" className="grammar-dialogue" id="dialogue">
      <div className="grammar-dialogue-intro">
        <p className="grammar-eyebrow">Put the pieces together <span lang="ja">会話にしてみよう</span></p>
        <h2 id="dialogue-title">A first conversation.</h2>
        <p>Arata and Wakana exchange names, ask about nationality and work, then say goodbye.</p>
        <p className="grammar-topic-related">Study the questions: <Link to={`${questionTypesPath}#yes-no-nouns`}>Yes/No about nationality</Link> · <Link to={`${questionTypesPath}#what`}>WH about work</Link>.</p>
      </div>
      <div className="dialogue-card">
        <div aria-label="Conversation participants" className="dialogue-participants">
          <span><b>MAN</b>Arata Yamada</span>
          <span><b>WOMAN</b>Wakana Mori</span>
        </div>
        <div className="dialogue-playback">
          <button aria-pressed={isPlayingDialogue} className="dialogue-playback-button" disabled={speechAvailability === 'loading' || speechAvailability === 'unsupported' || speechAvailability === 'no-japanese-voice'} onClick={toggleDialoguePlayback} type="button">
            <span aria-hidden="true">{isPlayingDialogue ? '■' : '▶'}</span>{isPlayingDialogue ? 'Stop playback' : 'Play dialogue'}
          </button>
          <p aria-live="polite" className="dialogue-playback-status">{isPlayingDialogue ? 'Reading in Japanese; the current turn is highlighted.'
            : speechAvailability === 'loading' ? 'Loading Japanese voice…'
              : speechAvailability === 'no-japanese-voice' ? 'No Japanese voice is available on this device.'
                  : speechAvailability === 'unsupported' ? 'Japanese speech is not available in this browser.'
                    : speechAvailability === 'error' ? 'Speech could not be played. Try again.'
                  : 'Play all turns from the beginning.'}</p>
        </div>
        {firstConversation.map((line, index) => <div aria-current={activeDialogueLine === index ? 'true' : undefined} className={`dialogue-line ${line.side}${activeDialogueLine === index ? ' is-speaking' : ''}`} id={`dialogue-line-${index}`} key={`${line.speaker}-${index}`}>
          <span className="dialogue-speaker" lang="ja">{line.speaker}</span>
          <div><JapaneseWithRomaji parts={line.parts} /><p className="dialogue-meaning">{line.translation}</p></div>
        </div>)}
        <p className="dialogue-name-note">These fictional Japanese practice names use the given names 新 (Arata, “new”) and 若菜 (Wakana, “young edible greens”). 若菜 is only a loose botanical association with one possible sense of Thảo when written as 草 (grass/plants), not an exact translation. Surname + さん is a common polite choice at a first meeting.</p>
      </div>
    </section>

    <section aria-labelledby="practice-title" className="grammar-practice" id="practice">
      <div className="grammar-section-title">
        <div><p className="grammar-eyebrow">Your turn <span lang="ja">やってみよう</span></p><h2 id="practice-title">Make it yours.</h2></div>
        <p>Reveal a model answer, then swap in your own information.</p>
      </div>
      <div className="grammar-exercises">
        <details><summary><span>01</span> Say your name and what you do.</summary><p><JapaneseWithRomaji parts={[pair('わたし', 'watashi'), pair('は', 'wa'), pair('[name]', '[name]'), pair('です。', 'desu'), pair('[job]', '[job]'), pair('です。', 'desu')]} /></p><div className="grammar-exercise-note"><JapaneseWithRomaji parts={[pair('わたし', 'watashi'), pair('は', 'wa'), pair('タン', 'Tan'), pair('です。', 'desu'), pair('ソフトウェア会社', 'sofutowea kaisha'), pair('の', 'no'), pair('エンジニア', 'enjinia'), pair('です。', 'desu')]} /><span>I’m Tân. I’m an engineer at a software company.</span></div></details>
        <details><summary><span>02</span> Say that you are also a student at a school.</summary><p><JapaneseWithRomaji parts={[pair('わたし', 'watashi'), pair('も', 'mo'), pair('[school]', '[school]'), pair('の', 'no'), pair('学生', 'gakusei'), pair('です。', 'desu')]} /></p><div className="grammar-exercise-note"><JapaneseWithRomaji parts={[pair('わたし', 'watashi'), pair('も', 'mo'), pair('ABC大学', 'ABC daigaku'), pair('の', 'no'), pair('学生', 'gakusei'), pair('です。', 'desu')]} /><span>I’m also a student at ABC University.</span></div></details>
      </div>
    </section>
  </main>;
}
