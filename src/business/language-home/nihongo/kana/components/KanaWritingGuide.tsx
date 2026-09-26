import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import hiraganaStrokeData from 'kana-svg-data/dist/allHiragana.json';
import katakanaStrokeData from 'kana-svg-data/dist/allKatakana.json';

type Stroke = { id: string; value: string };
type Median = { id: string; value: readonly (readonly [number, number])[] };
type KanaStrokeData = { charCode: number; strokes: readonly Stroke[]; medians: readonly Median[]; clipPaths: readonly Stroke[] };

const allStrokeData = [...hiraganaStrokeData, ...katakanaStrokeData] as unknown as KanaStrokeData[];

function getStrokeData(glyph: string) {
  const charCode = glyph.codePointAt(0);
  return allStrokeData.find((character) => character.charCode === charCode);
}

function medianPath(points: readonly (readonly [number, number])[]) {
  return points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
}

function strokeNumber(id: string, fallback: number) {
  const number = Number.parseInt(id, 10);
  return Number.isNaN(number) ? fallback + 1 : number;
}

function StrokeOrderSvg({ glyph, data }: { glyph: string; data: KanaStrokeData }) {
  const prefix = `kana-${data.charCode}`;
  const visibleMedians = data.medians.filter((median) => median.value.length > 1);
  const strokeCount = Math.max(...visibleMedians.map((median, index) => strokeNumber(median.id, index)), 1);
  const strokeStepMs = 1500;
  const cycleDurationMs = strokeCount * strokeStepMs + 1800;
  const [cycle, setCycle] = useState(0);
  const numberedStrokes = new Set<number>();

  useEffect(() => {
    const timer = window.setInterval(() => setCycle((current) => current + 1), cycleDurationMs);
    return () => window.clearInterval(timer);
  }, [cycleDurationMs]);

  return <svg aria-label={`Animated stroke guide for ${glyph}`} className="writing-guide-svg" key={`${glyph}-${cycle}`} role="img" viewBox="0 0 1024 1024">
    <defs>
      {data.strokes.map(({ id, value }) => <clipPath id={`${prefix}-clip-${id}`} key={`clip-${id}`}><path d={value} /></clipPath>)}
    </defs>
    <g className="writing-guide-shadow">
      {data.strokes.map(({ id, value }) => <path d={value} key={`shadow-${id}`} />)}
    </g>
    <g className="writing-guide-strokes">
      {visibleMedians.map((median, index) => {
        const number = strokeNumber(median.id, index);
        return <path className="writing-guide-stroke" clipPath={`url(#${prefix}-clip-${median.id})`} d={medianPath(median.value)} key={`stroke-${median.id}`} style={{ '--stroke-index': number - 1 } as CSSProperties} />;
      })}
    </g>
    <g className="writing-guide-numbers" aria-hidden="true">
      {visibleMedians.map((median, index) => {
        const number = strokeNumber(median.id, index);
        const firstPoint = median.value[0];
        if (!firstPoint || numberedStrokes.has(number)) return null;
        numberedStrokes.add(number);
        return <g key={`number-${number}`}>
          <circle cx={firstPoint[0]} cy={firstPoint[1]} r="36" />
          <text x={firstPoint[0]} y={firstPoint[1]}>{number}</text>
        </g>;
      })}
    </g>
  </svg>;
}

export function KanaWritingGuide({ glyph }: { glyph: string }) {
  const data = getStrokeData(glyph);

  return <div aria-label={`Writing guide for ${glyph}`} className="writing-guide" data-testid="kana-writing-guide">
    <div className="writing-guide-heading">
      <span className="practice-kicker">Writing guide</span>
      <span lang="ja">書き順</span>
    </div>
    {data ? <StrokeOrderSvg data={data} glyph={glyph} key={glyph} /> : <p role="img" aria-label={`Animated stroke guide for ${glyph}`}>Stroke guide unavailable.</p>}
    <p className="writing-guide-caption">Follow the animated strokes, then say the Kana aloud.</p>
  </div>;
}
