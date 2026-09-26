import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { JapaneseWithRomaji } from '../grammar/components/JapaneseWithRomaji';
import { vocabularyGroups, vocabularySections } from './content/firstIntroductions';

export function FirstIntroductionsVocabularyPage() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isSectionMenuOpen, setIsSectionMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(vocabularySections[0][0]);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      const visibleSection = entries.find((entry) => entry.isIntersecting);
      if (visibleSection) setActiveSection(visibleSection.target.id);
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
    vocabularySections.forEach(([id]) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isSectionMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSectionMenuOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isSectionMenuOpen]);

  return <main className="grammar-page grammar-topic-page vocabulary-topic-page">
    <header className="grammar-topic-hero">
      <Link className="grammar-back-link" to="/nihongo-o-benkyuo/vocabulary">← Vocabulary topics</Link>
      <div className="grammar-topic-heading">
        <div>
          <p className="grammar-eyebrow">Topic 01 <span lang="ja">最初のテーマ</span></p>
          <h1>First introductions <span lang="ja">はじめまして</span></h1>
          <p>Words for introducing yourself, meeting someone, and asking a few simple questions.</p>
          <Link className="grammar-back-link vocabulary-grammar-link" to="/nihongo-o-benkyuo/grammar/first-introductions">Study the sentence patterns →</Link>
        </div>
        <div aria-hidden="true" className="grammar-reference-stamp">
          <span>TOPIC</span><b>01</b><span>VOCABULARY</span>
        </div>
      </div>
    </header>

    <div className="grammar-section-menu">
      <button
        aria-controls="vocabulary-section-menu"
        aria-expanded={isSectionMenuOpen}
        aria-label={isSectionMenuOpen ? 'Close vocabulary sections' : 'Open vocabulary sections'}
        className="grammar-section-menu-trigger"
        onClick={() => setIsSectionMenuOpen((isOpen) => !isOpen)}
        type="button"
      ><span aria-hidden="true">{isSectionMenuOpen ? '→' : '←'}</span></button>
      {isSectionMenuOpen && <nav aria-label="Vocabulary sections" className="grammar-section-nav" id="vocabulary-section-menu">
        {vocabularySections.map(([id, label]) => id === activeSection
          ? <span aria-current="location" aria-disabled="true" className="grammar-section-current" key={id}>{label}</span>
          : <a href={`#${id}`} key={id} onClick={() => { setActiveSection(id); setIsSectionMenuOpen(false); }}>{label}</a>)}
      </nav>}
    </div>

    <section aria-labelledby="word-set-title" className="grammar-vocabulary vocabulary-topic-intro">
      <div className="grammar-section-title">
        <div><p className="grammar-eyebrow">Words for a first conversation <span lang="ja">会話のことば</span></p><h2 id="word-set-title">Find the words you need.</h2></div>
        <p>Start with people, then explore jobs, countries, answers, and natural first-meeting phrases.</p>
      </div>
      <div className="vocabulary-groups">
        {vocabularyGroups.map((group) => <section aria-labelledby={`vocab-${group.id}`} className="vocabulary-group" id={group.id} key={group.id}>
          <header><h3 id={`vocab-${group.id}`}>{group.title}</h3><span lang="ja">{group.japaneseTitle}</span></header>
          <dl>
            {group.words.map(([japanese, reading, meaning]) => <div key={japanese}>
              <dt><span lang="ja">{japanese}</span><small lang="ja-Latn">{reading}</small></dt><dd>{meaning}</dd>
            </div>)}
          </dl>
        </section>)}
      </div>
      <aside aria-labelledby="usage-notes-title" className="grammar-culture-note" id="usage-notes">
        <span aria-hidden="true">ことばのマナー</span>
        <p id="usage-notes-title"><JapaneseWithRomaji className="grammar-inline-reading" parts={[[ '彼', 'kare' ]]} /> and <JapaneseWithRomaji className="grammar-inline-reading" parts={[[ '彼女', 'kanojo' ]]} /> mean “he” and “she,” but can also mean “boyfriend” and “girlfriend.” Japanese speakers often omit pronouns when the meaning is clear, or use the person’s name. <JapaneseWithRomaji className="grammar-inline-reading" parts={[[ '僕', 'boku' ]]} /> is common for boys and men and sounds more masculine; <JapaneseWithRomaji className="grammar-inline-reading" parts={[[ 'あたし', 'atashi' ]]} /> is casual and feminine-coded. Use <JapaneseWithRomaji className="grammar-inline-reading" parts={[[ '〜さん', '〜san' ]]} /> for other people, not yourself.</p>
      </aside>
    </section>
    {showBackToTop && <button aria-label="Back to top" className="back-to-top" onClick={() => window.scrollTo({ behavior: 'smooth', top: 0 })} type="button">↑ <span>Top</span></button>}
  </main>;
}
