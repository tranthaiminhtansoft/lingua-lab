import { Link } from 'react-router-dom';
import { QuestionJapaneseWithRomaji } from './components/QuestionJapaneseWithRomaji';
import { questionGroups, questionTypesPath } from './content/questionTypes';

const firstTopicPath = '/nihongo-o-benkyuo/grammar/first-introductions';

export function GrammarPage() {
  return <main className="grammar-page">
    <header className="grammar-hero">
      <div className="grammar-hero-copy">
        <p className="grammar-eyebrow">Japanese learning lab <span lang="ja">日本語学習</span></p>
        <h1>Grammar <span lang="ja">文法</span></h1>
        <p>Start with things you want to say. Then see how each sentence comes together.</p>
      </div>
      <div aria-hidden="true" className="grammar-stamp">
        <span>ことば</span>
        <b>文</b>
        <span>WORDS → SENTENCES</span>
      </div>
    </header>

    <section aria-labelledby="grammar-start-title" className="grammar-feature">
      <div className="grammar-feature-top">
        <span className="grammar-feature-number">01</span>
        <span className="grammar-feature-label">A first conversation <span lang="ja">はじめの会話</span></span>
      </div>
      <div className="grammar-feature-main">
        <div className="grammar-feature-copy">
          <p className="grammar-eyebrow">Expressions + sentence patterns</p>
          <h2 id="grammar-start-title">First introductions <span lang="ja">はじめまして</span></h2>
          <p>Greet someone, introduce yourself, and connect simple statements. One small conversation gives you the first building blocks of Japanese.</p>
          <Link className="grammar-primary-link" to={firstTopicPath}>Explore this topic <span aria-hidden="true">↗</span></Link>
        </div>
        <ol aria-label="What you will learn" className="grammar-feature-steps">
          <li><span>01</span><span>Open a conversation</span></li>
          <li><span>02</span><span>Say who you are</span></li>
          <li><span>03</span><span>Connect ideas with も and の</span></li>
        </ol>
      </div>
      <div aria-label="Patterns in this topic" className="grammar-pattern-ribbon" lang="ja">
        <span>N1 は N2 です</span>
        <span>N1 も N2 です</span>
        <span>N1 の N2</span>
      </div>
      <p className="grammar-source-note">Follows the first lesson in the Minna no Nihongo video series; the topic title describes what you learn, so it remains useful if lesson order changes.</p>
    </section>

    <section aria-labelledby="grammar-questions-title" className="grammar-feature grammar-question-feature">
      <div className="grammar-feature-top">
        <span className="grammar-feature-number">02</span>
        <span className="grammar-feature-label">Ask + answer <span lang="ja">質問と答え</span></span>
      </div>
      <div className="grammar-feature-main">
        <div className="grammar-feature-copy">
          <p className="grammar-eyebrow">Question families + time + context</p>
          <h2 id="grammar-questions-title">Question types <span lang="ja">疑問文</span></h2>
          <p>Open Yes/No or WH, choose the kind of question you need, then compare model questions and replies across time. Every example includes romaji.</p>
          <Link className="grammar-primary-link" to={questionTypesPath}>Explore question types <span aria-hidden="true">↗</span></Link>
        </div>
        <ol aria-label="Question families in this topic" className="grammar-feature-steps">
          {questionGroups.map((group, index) => <li key={group.id}><span>{String(index + 1).padStart(2, '0')}</span><span>{group.title} · {group.types.length} types</span></li>)}
          <li><span>↳</span><span>Model replies + time notes</span></li>
        </ol>
      </div>
      <div aria-label="Question words in this topic" className="grammar-pattern-ribbon">
        <QuestionJapaneseWithRomaji parts={[[ 'ですか', 'desu ka' ]]} />
        <QuestionJapaneseWithRomaji parts={[[ 'だれ', 'dare', [ 'どなた', 'donata' ] ]]} />
        <QuestionJapaneseWithRomaji parts={[[ 'どこ', 'doko', [ 'どちら', 'dochira' ] ]]} />
        <QuestionJapaneseWithRomaji parts={[[ '何歳', 'nansai', [ 'おいくつ', 'oikutsu' ] ]]} />
      </div>
      <p className="grammar-source-note">Includes the Yes/No, who, and age patterns from First introductions, alongside other common WH questions.</p>
    </section>

    <section aria-labelledby="grammar-approach-title" className="grammar-approach">
      <div>
        <p className="grammar-eyebrow">How this section works</p>
        <h2 id="grammar-approach-title">Useful language first. Patterns after.</h2>
      </div>
      <p>Topics are named by what you can do with them—not only by a lesson number. Greetings, reactions, and sentence patterns can grow into their own paths as more material is added.</p>
    </section>
  </main>;
}
