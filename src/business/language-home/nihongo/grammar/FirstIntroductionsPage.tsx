import { Link } from 'react-router-dom';
import { GrammarPatternCard } from './components/GrammarPatternCard';
import { JapaneseWithRomaji } from './components/JapaneseWithRomaji';
import { GrammarTopicNavigation } from './components/GrammarTopicNavigation';
import { grammarPatterns } from './content/firstIntroductions';
import { questionTypesPath } from './content/questionTypes';

const pair = (japanese: string, romaji: string, alternative?: readonly [string, string]) => alternative
  ? [japanese, romaji, alternative] as const
  : [japanese, romaji] as const;

const lessonSections = [
  ['opening', 'First words'],
  ['patterns', 'Sentence patterns'],
  ['conversation', 'Vocabulary conversation'],
  ['practice', 'Try it'],
] as const;

export function FirstIntroductionsPage() {
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

    <section aria-labelledby="conversation-title" className="grammar-dialogue grammar-conversation-bridge" id="conversation">
      <div>
        <p className="grammar-eyebrow">Put the pieces together <span lang="ja">会話にしてみよう</span></p>
        <h2 id="conversation-title">Hear the words in context.</h2>
        <p>The full conversation, audio playback, and key vocabulary now live together in the Vocabulary lesson.</p>
        <p className="grammar-topic-related">Study the questions: <Link to={`${questionTypesPath}#yes-no-nouns`}>Yes/No about nationality</Link> · <Link to={`${questionTypesPath}#what`}>WH about work</Link>.</p>
        <Link className="grammar-primary-link" to="/nihongo-o-benkyuo/vocabulary/first-introductions#conversation">Open the conversation and vocabulary →</Link>
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
