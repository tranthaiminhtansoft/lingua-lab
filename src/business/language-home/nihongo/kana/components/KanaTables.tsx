import { kanaRowLayouts } from '../data/kana';
import type { KanaEntry, KanaGroup } from '../types/kana';
import { KanaMarkText } from './KanaMarkText';
const labels: Record<KanaGroup, { description?: string; label?: string; title: string }> = {
  basic: { title: 'Basic kana / 基本かな' },
  dakuten: { title: 'Dakuten / 濁点', label: 'Voiced sound mark', description: 'Adds two small strokes (゛) to a Kana and voices the sound, for example か → が.' },
  handakuten: { title: 'Handakuten / 半濁点', label: 'Semi-voiced sound mark', description: 'Adds a small circle (゜) to the は row and changes the sound to p, for example は → ぱ.' },
};

export function KanaTables({ entries }: { entries: readonly KanaEntry[] }) {
  return <section aria-labelledby="tables-title" className="panel tables" id="tables">
    <div className="section-head">
      <div><h2 id="tables-title">Kana reference / <span lang="ja">かな一覧</span></h2><p>Each row pairs Hiragana and Katakana with its reading.</p></div>
      <span className="eyebrow">71 complete pairs</span>
    </div>
    {(Object.keys(labels) as KanaGroup[]).map((group) => {
      const { description, label, title } = labels[group];
      const groupEntries = entries.filter((entry) => entry.group === group);
      return <div className="table-wrap" key={group}>
        <div className="kana-row-title">{title}{label && <small className="term-label">{label}</small>}{description && <p className="kana-table-description"><KanaMarkText>{description}</KanaMarkText></p>}</div>
        <div aria-label={title} role="table">
          {kanaRowLayouts[group].map((layout, rowIndex) => <div className="kana-row" key={`${group}-${rowIndex}`} role="row">
            {layout.map((entryIndex, cellIndex) => {
              const entry = entryIndex === null ? undefined : groupEntries[entryIndex];
              return <div
                aria-hidden={entry ? undefined : 'true'}
                className={`kana-cell${entry ? '' : ' kana-table-empty'}`}
                key={`${group}-${rowIndex}-${cellIndex}`}
                role={entry ? 'cell' : 'presentation'}
              >
                {entry && <>
                  <div className="kana-pair" lang="ja">{entry.hiragana}<span className="kana-divider">/</span>{entry.katakana}</div>
                  <div className="kana-romaji">{entry.romaji}</div>
                </>}
              </div>;
            })}
          </div>)}
        </div>
      </div>;
    })}
    <p className="note">46 basic · 20 dakuten · 5 handakuten.</p>
  </section>;
}
