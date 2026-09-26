import type { ReactNode } from 'react';

export type JapaneseRomajiPair = readonly [japanese: ReactNode, romaji: string, alternative?: readonly [japanese: ReactNode, romaji: string]];

export function JapaneseWithRomaji({ parts, className = '' }: {
  parts: readonly JapaneseRomajiPair[];
  className?: string;
}) {
  return <span className={`japanese-with-romaji ${className}`}>
    {parts.map(([japanese, romaji, alternative], index) => <span className="japanese-romaji-pair" key={`${index}-${romaji}`}>
      <span className="japanese-with-romaji-text" lang="ja">{japanese}</span>
      <small className="grammar-romaji" lang="ja-Latn">{romaji}</small>
      {alternative && <span className="japanese-romaji-alternative">
        <span className="japanese-romaji-alternative-label">alternative</span>
        <span className="japanese-with-romaji-text" lang="ja">{alternative[0]}</span>
        <small className="grammar-romaji" lang="ja-Latn">{alternative[1]}</small>
      </span>}
    </span>)}
  </span>;
}
