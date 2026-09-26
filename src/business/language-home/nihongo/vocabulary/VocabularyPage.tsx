import { Link } from 'react-router-dom';

const firstTopicPath = '/nihongo-o-benkyuo/vocabulary/first-introductions';

export function VocabularyPage() {
  return <main className="grammar-page vocabulary-page">
    <header className="grammar-hero">
      <div className="grammar-hero-copy">
        <p className="grammar-eyebrow">Japanese learning lab <span lang="ja">日本語学習</span></p>
        <h1>Vocabulary <span lang="ja">語彙</span></h1>
        <p>Learn words in the situations where you will actually use them.</p>
      </div>
      <div aria-hidden="true" className="grammar-stamp">
        <span>ことば</span>
        <b>語</b>
        <span>WORDS BY TOPIC</span>
      </div>
    </header>

    <section aria-labelledby="vocabulary-start-title" className="grammar-feature">
      <div className="grammar-feature-top">
        <span className="grammar-feature-number">01</span>
        <span className="grammar-feature-label">A first conversation <span lang="ja">はじめの会話</span></span>
      </div>
      <div className="grammar-feature-main">
        <div className="grammar-feature-copy">
          <p className="grammar-eyebrow">Words + useful expressions</p>
          <h2 id="vocabulary-start-title">First introductions <span lang="ja">はじめまして</span></h2>
          <p>Names, pronouns, jobs, nationalities, and the phrases that help a first conversation feel natural.</p>
          <Link className="grammar-primary-link" to={firstTopicPath}>Explore this topic <span aria-hidden="true">↗</span></Link>
        </div>
        <ol aria-label="Vocabulary in this topic" className="grammar-feature-steps">
          <li><span>01</span><span>People and names</span></li>
          <li><span>02</span><span>Work and origins</span></li>
          <li><span>03</span><span>First-meeting phrases</span></li>
        </ol>
      </div>
      <div aria-label="Words in this topic" className="grammar-pattern-ribbon" lang="ja">
        <span>わたし</span>
        <span>日本人</span>
        <span>こちらこそ</span>
      </div>
      <p className="grammar-source-note">Topics follow the same learning path as Grammar, so related words and sentence patterns are easy to find together.</p>
    </section>

    <section aria-labelledby="vocabulary-approach-title" className="grammar-approach">
      <div>
        <p className="grammar-eyebrow">How this section works</p>
        <h2 id="vocabulary-approach-title">Words grouped by what you want to say.</h2>
      </div>
      <p>Each topic brings together people, places, and expressions for a situation. Use the Grammar topic with the same name when you want to study how those words fit into sentences.</p>
    </section>
  </main>;
}
