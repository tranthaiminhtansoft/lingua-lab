import type { ReactNode } from 'react';
import { JapaneseWithRomaji } from './JapaneseWithRomaji';
import type { JapaneseRomajiPair } from './JapaneseWithRomaji';
import { annotateQuestionKanji, emphasizeQuestionGrammar } from '../content/questionAnnotations';
import { alignQuestionParts } from '../content/questionAlignment';
import type { QuestionWord } from '../content/questionAlignment';

function annotatedJapanese(value: ReactNode, romaji?: string, grammar = false) {
  if (typeof value !== 'string') return value;
  return annotateQuestionKanji(value, romaji).map((part, index) => part.reading
    ? <span className="question-kanji-word" data-kanji={part.text} key={index}>{part.text}<span className="question-kana-reading">（{part.reading}）</span></span>
    : grammar ? part.text : <span key={index}>{emphasizeQuestionGrammar(part.text, 'japanese').map((segment, segmentIndex) => segment.emphasized
      ? <strong className="question-grammar-emphasis" key={segmentIndex}>{segment.text}</strong>
      : segment.text)}</span>);
}

function emphasizedRomaji(text: string) {
  return emphasizeQuestionGrammar(text, 'romaji').map((part, index) => part.emphasized
    ? <strong className="question-grammar-emphasis" key={index}>{part.text}</strong>
    : part.text);
}

function AlignedWordText({ word, showGloss }: { word: QuestionWord; showGloss: boolean }) {
  const japanese = annotatedJapanese(word.japanese, word.romaji, word.grammar);
  return <>
    <span className="japanese-with-romaji-text" lang="ja">{word.grammar ? <strong className="question-grammar-emphasis">{japanese}</strong> : japanese}</span>
    <small className="grammar-romaji" lang="ja-Latn">{word.grammar ? <strong className="question-grammar-emphasis">{word.romaji}</strong> : emphasizedRomaji(word.romaji)}</small>
    {showGloss && <small className="question-word-gloss" lang="en">{word.grammar ? <strong className="question-grammar-emphasis">{word.gloss}</strong> : word.gloss}</small>}
  </>;
}

function AlignedWords({ words, showGloss }: { words: readonly QuestionWord[]; showGloss: boolean }) {
  const hasAlternatives = words.some((word) => word.alternative);
  return <span className={`question-aligned-line${showGloss ? ' has-glosses' : ''}${hasAlternatives ? ' has-alternatives' : ''}`}>
    {words.map((word, index) => <span className="japanese-romaji-pair" key={index}>
      <AlignedWordText word={word} showGloss={showGloss} />
      {word.alternative ? <span className="japanese-romaji-alternative"><span className="japanese-romaji-alternative-label">alternative</span><AlignedWordText word={word.alternative} showGloss={showGloss} /></span>
        : hasAlternatives && <span aria-hidden="true" className="question-alternative-placeholder" />}
    </span>)}
  </span>;
}

export function QuestionJapaneseWithRomaji({ parts, className = '', alignWords = false, showGloss = false }: {
  parts: readonly JapaneseRomajiPair[]; className?: string; alignWords?: boolean; showGloss?: boolean;
}) {
  if (alignWords) {
    const { words, fullAlternatives } = alignQuestionParts(parts);
    return <span className={`japanese-with-romaji question-annotated question-aligned ${className}`}>
      <AlignedWords words={words} showGloss={showGloss} />
      {fullAlternatives.map((alternative, index) => <span className="japanese-romaji-alternative question-full-alternative" key={index}>
        <span className="japanese-romaji-alternative-label">alternative</span><AlignedWords words={alternative} showGloss={showGloss} />
      </span>)}
    </span>;
  }
  return <JapaneseWithRomaji className={`question-annotated ${className}`} parts={parts} renderJapanese={annotatedJapanese} renderRomaji={emphasizedRomaji} />;
}
