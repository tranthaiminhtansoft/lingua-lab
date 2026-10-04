import type { ReactNode } from 'react';

export type JapaneseRomajiPair = readonly [japanese: ReactNode, romaji: string, alternative?: readonly [japanese: ReactNode, romaji: string]];

export function JapaneseWithRomaji({ parts, className = '', renderJapanese, renderRomaji }: {
  parts: readonly JapaneseRomajiPair[];
  className?: string;
  renderJapanese?: (value: ReactNode) => ReactNode;
  renderRomaji?: (value: string) => ReactNode;
}) {
  return <span className={`japanese-with-romaji ${className}`}>
    {parts.map(([japanese, romaji, alternative], index) => <span className="japanese-romaji-pair" key={`${index}-${romaji}`}>
      <span className="japanese-with-romaji-text" lang="ja">{renderJapanese ? renderJapanese(japanese) : japanese}</span>
      <small className="grammar-romaji" lang="ja-Latn">{renderRomaji ? renderRomaji(romaji) : romaji}</small>
      {alternative && <span className="japanese-romaji-alternative">
        <span className="japanese-romaji-alternative-label">alternative</span>
        <span className="japanese-with-romaji-text" lang="ja">{renderJapanese ? renderJapanese(alternative[0]) : alternative[0]}</span>
        <small className="grammar-romaji" lang="ja-Latn">{renderRomaji ? renderRomaji(alternative[1]) : alternative[1]}</small>
      </span>}
    </span>)}
  </span>;
}
