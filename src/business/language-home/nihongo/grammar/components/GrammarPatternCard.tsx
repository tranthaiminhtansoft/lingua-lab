import { JapaneseWithRomaji } from './JapaneseWithRomaji';
import type { JapaneseRomajiPair } from './JapaneseWithRomaji';

export type GrammarPattern = {
  number: string;
  title: string;
  japaneseTitle: string;
  formulaParts: readonly JapaneseRomajiPair[];
  formulaBreakBefore?: number;
  explanation: string;
  examples: readonly {
    parts: readonly JapaneseRomajiPair[];
    translation: string;
    marker?: string;
    label?: string;
  }[];
  note?: string;
};

export function GrammarPatternCard({ pattern }: { pattern: GrammarPattern }) {
  const formulaRows = pattern.formulaBreakBefore === undefined
    ? [pattern.formulaParts]
    : [pattern.formulaParts.slice(0, pattern.formulaBreakBefore), pattern.formulaParts.slice(pattern.formulaBreakBefore)];

  return <article className="grammar-pattern-card">
    <div className="grammar-pattern-card-head">
      <span>{pattern.number}</span>
      <h3>{pattern.title} <small lang="ja">{pattern.japaneseTitle}</small></h3>
    </div>
    <div className="grammar-formula">
      <div className="grammar-formula-pairs">
        {formulaRows.map((parts, index) => <JapaneseWithRomaji className="grammar-formula-row" key={index} parts={parts} />)}
      </div>
    </div>
    <p className="grammar-pattern-explanation">{pattern.explanation}</p>
    <div className="grammar-example">
      {pattern.examples.map((example, index) => <div className="grammar-example-row" key={index}>
        {example.label && <span className="grammar-example-label">{example.label}</span>}
        <div className={`grammar-example-line${example.marker ? ' has-marker' : ''}`}>
          {example.marker && <span aria-hidden="true" className="grammar-example-marker">{example.marker}</span>}
          <div className="grammar-example-content">
            <JapaneseWithRomaji className="grammar-example-japanese" parts={example.parts} />
            <p className="grammar-example-translation">{example.translation}</p>
          </div>
        </div>
      </div>)}
    </div>
    {pattern.note && <p className="grammar-pattern-note"><span aria-hidden="true">↳</span> {pattern.note}</p>}
  </article>;
}
