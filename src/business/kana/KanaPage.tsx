import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { choonEntries, kanaEntries, sokuonEntries, yoonEntries } from './data/kana';
import { KanaTables } from './components/KanaTables';
import { useJapaneseSpeech } from './hooks/useJapaneseSpeech';
import type { KanaEntry, SoundMarkEntry } from './types/kana';

type PracticeSelection = { entry: KanaEntry; script: 0 | 1 };

const kanaSections = [
  { label: 'Basics', href: '#basics' },
  { label: 'Practice', href: '#practice' },
  { label: 'Reference', href: '#tables' },
  { label: 'Yōon', href: '#yoon' },
  { label: 'Sokuon', href: '#sokuon' },
  { label: 'Chōon', href: '#choon' },
] as const;

function selectPractice(previous?: PracticeSelection): PracticeSelection {
  let next: PracticeSelection;
  do {
    const entry = kanaEntries[Math.floor(Math.random() * kanaEntries.length)] ?? kanaEntries[0];
    next = { entry, script: Math.floor(Math.random() * 2) as 0 | 1 };
  } while (previous && next.entry[next.script === 0 ? 'hiragana' : 'katakana'] === previous.entry[previous.script === 0 ? 'hiragana' : 'katakana']);
  return next;
}


function speechStatusMessage(state: ReturnType<typeof useJapaneseSpeech>['state']) {
  return state === 'unsupported' ? 'Speech is not supported by this browser.'
    : state === 'no-japanese-voice' ? 'No Japanese voice is available on this device.'
      : state === 'error' ? 'Speech failed. Please try again.'
        : state === 'loading' ? 'Checking Japanese voice availability.'
          : state === 'speaking' ? 'Speaking the Kana. Select Stop Japanese playback to cancel.'
            : 'Japanese voice is ready. Play the Kana to hear it.';
}

function SoundMarkSection({ id, title, japanese, label, description, entries, state, onSpeak, onCancel }: { id: string; title: string; japanese: string; label?: string; description: ReactNode; entries: readonly SoundMarkEntry[]; state: ReturnType<typeof useJapaneseSpeech>['state']; onSpeak: (text: string) => void; onCancel: () => void }) {
  const disabled = state === 'loading' || state === 'unsupported' || state === 'no-japanese-voice';
  const speaking = state === 'speaking';
  return <section className="panel sound-marks" id={id}>
    <div className="section-head"><div><h2>{title} / <span lang="ja">{japanese}</span>{label && <small className="term-label">{label}</small>}</h2><p>{description}</p></div></div>
    <div className="sound-grid">{entries.map(([hiragana, katakana, romaji, meaning]) => {
      const text = hiragana || katakana;
      return <article className="sound-item" key={`${hiragana}-${katakana}`}>
        <div><div className="sound-pair" lang="ja">{hiragana}{hiragana && katakana ? ' / ' : ''}{katakana}</div><div className="sound-romaji">{romaji}</div>{meaning && <div className="sound-meaning">{meaning}</div>}</div>
        <button aria-label={speaking ? 'Stop Japanese playback' : `Play Japanese pronunciation for ${text}`} className="sound-speaker" disabled={disabled} onClick={speaking ? onCancel : () => onSpeak(text)} title={speaking ? 'Stop Japanese playback' : 'Play Japanese pronunciation'} type="button">🔊</button>
      </article>;
    })}</div>
  </section>;
}

export function KanaPage() {
  const [selection, setSelection] = useState<PracticeSelection>(() => selectPractice());
  const [speechRate, setSpeechRate] = useState(0.1);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isSectionMenuOpen, setIsSectionMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(() => kanaSections.find((section) => section.href === window.location.hash)?.href ?? '#basics');
  const sectionMenuRef = useRef<HTMLElement>(null);
  const sectionMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const { state: speechState, speak, cancel } = useJapaneseSpeech(speechRate);
  const glyph = selection.script === 0 ? selection.entry.hiragana : selection.entry.katakana;
  const script = selection.script === 0 ? 'Hiragana' : 'Katakana';
  const disabled = speechState === 'loading' || speechState === 'unsupported' || speechState === 'no-japanese-voice';
  const speaking = speechState === 'speaking';
  const showRandom = () => setSelection((previous) => selectPractice(previous));

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const matchingSection = kanaSections.find((section) => section.href === window.location.hash);
      if (matchingSection) setActiveSection(matchingSection.href);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      const visibleSection = entries.find((entry) => entry.isIntersecting);
      const matchingSection = kanaSections.find((section) => section.href === `#${visibleSection?.target.id}`);
      if (matchingSection) setActiveSection(matchingSection.href);
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
    const sections = kanaSections.map(({ href }) => document.querySelector(href)).filter((section): section is HTMLElement => section instanceof HTMLElement);
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isSectionMenuOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!sectionMenuRef.current?.contains(target) && !sectionMenuTriggerRef.current?.contains(target)) setIsSectionMenuOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSectionMenuOpen(false);
        sectionMenuTriggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSectionMenuOpen]);

  return <main className="kana-page">
    <section className="hero"><div><div className="eyebrow">Learn one sound at a time</div><h1>Kana<br /><span lang="ja">かなを読む</span></h1><p>Build a clear foundation with Hiragana, Katakana, and sound marks.</p></div><div aria-hidden="true" className="seal">かな</div></section>
    <div className="kana-section-menu">
      <button
        aria-controls="kana-section-menu"
        aria-expanded={isSectionMenuOpen}
        aria-label={isSectionMenuOpen ? 'Close Kana sections' : 'Open Kana sections'}
        className="kana-section-menu-trigger"
        onClick={() => setIsSectionMenuOpen((isOpen) => !isOpen)}
        ref={sectionMenuTriggerRef}
        type="button"
      ><span aria-hidden="true">{isSectionMenuOpen ? '→' : '←'}</span></button>
      {isSectionMenuOpen && <nav aria-label="Kana sections" className="kana-section-nav" id="kana-section-menu" ref={sectionMenuRef}>
        {kanaSections.map((section) => section.href === activeSection
          ? <span aria-current="location" aria-disabled="true" className="kana-section-current" key={section.href}>{section.label}</span>
          : <a href={section.href} key={section.href} onClick={() => setIsSectionMenuOpen(false)}>{section.label}</a>)}
      </nav>}
    </div>
    <div className="kana-grid">
      <section className="panel guide" id="basics"><h2>Basics Guide / <span lang="ja">基礎ガイド</span></h2><p>See the shape, say the sound, then compare it with the reference.</p><ul><li>Hiragana: native words and grammar.</li><li>Katakana: loanwords and names.</li><li>゛Dakuten and ゜Handakuten change sound groups.</li></ul></section>
      <section aria-labelledby="practice-title" className="panel practice" id="practice"><div className="practice-top"><div><div className="practice-kicker">Practice card / <span lang="ja">練習カード</span></div><h2 id="practice-title">Recognize the sound</h2></div><span className="eyebrow">{script}</span></div><div className="practice-stage"><div className="glyph" data-testid="practice-glyph" lang="ja">{glyph}</div><button aria-label={speaking ? 'Stop Japanese playback' : `Play Japanese pronunciation for ${glyph}`} className="speaker" disabled={disabled} onClick={speaking ? cancel : () => speak(glyph)} title={speaking ? 'Stop Japanese playback' : 'Play Japanese pronunciation'} type="button">🔊</button></div><p className="cue">{script} {glyph} — say this glyph out loud.</p><div className="speech-rate"><label htmlFor="speech-rate">Speech rate <span aria-hidden="true" className="speech-rate-value">{speechRate.toFixed(2)}×</span></label><input aria-describedby="speech-rate-help" aria-label="Speech rate" id="speech-rate" max="1" min="0.1" name="speech-rate" onChange={(event) => setSpeechRate(Number(event.target.value))} step="0.05" type="range" value={speechRate} /><div id="speech-rate-help">Slow 0.1× · 0.05× steps · Fast 1×</div></div><p className="status" role="status">{speechStatusMessage(speechState)}</p><div className="actions"><button className="action" onClick={showRandom} type="button">Random practice / <span lang="ja">ランダム練習</span></button></div></section>
      <KanaTables entries={kanaEntries} />
      <SoundMarkSection description={<>Small <span lang="ja">ゃ, ゅ, ょ</span> combine with the preceding sound to make one blended sound.</>} entries={yoonEntries} id="yoon" japanese="拗音" onCancel={cancel} onSpeak={speak} state={speechState} title="Yōon" />
      <SoundMarkSection description={<><span lang="ja">っ / ッ</span> marks a short stop and doubles the following consonant.</>} entries={sokuonEntries} id="sokuon" japanese="促音" label="Small tsu / Geminate consonant" onCancel={cancel} onSpeak={speak} state={speechState} title="Sokuon" />
      <SoundMarkSection description={<>Long vowels use extra Kana in Hiragana; Katakana commonly uses <span lang="ja">ー</span>.</>} entries={choonEntries} id="choon" japanese="長音" label="Long vowel" onCancel={cancel} onSpeak={speak} state={speechState} title="Chōon" />
    </div>
    {showBackToTop && <button aria-label="Back to top" className="back-to-top" onClick={() => window.scrollTo({ behavior: 'smooth', top: 0 })} type="button">↑ <span>Top</span></button>}
  </main>;
}
