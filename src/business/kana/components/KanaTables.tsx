import type { KanaEntry, KanaGroup } from '../types/kana';
const labels: Record<KanaGroup, { label?: string; title: string }> = {
  basic: { title: 'Basic kana / 基本かな' },
  dakuten: { title: 'Dakuten / 濁点', label: 'Voiced sound mark' },
  handakuten: { title: 'Handakuten / 半濁点', label: 'Semi-voiced sound mark' },
};

export function KanaTables({ entries }: { entries: readonly KanaEntry[] }) {
  return <section aria-labelledby="tables-title" className="panel tables" id="tables">
    <div className="section-head">
      <div><h2 id="tables-title">Kana reference / <span lang="ja">かな一覧</span></h2><p>Each row pairs Hiragana and Katakana with its reading.</p></div>
      <span className="eyebrow">71 complete pairs</span>
    </div>
    {(Object.keys(labels) as KanaGroup[]).map((group) => {
      const { label, title } = labels[group];
      return <div className="table-scroll" aria-label={`${title} horizontal scroll`} key={group}>
        <table>
          <caption>{title}{label && <small className="term-label">{label}</small>}</caption>
          <thead><tr><th scope="col">Hiragana</th><th scope="col">Katakana</th><th scope="col">Romaji</th></tr></thead>
          <tbody>{entries.filter((entry) => entry.group === group).map((entry) => <tr key={entry.hiragana}><td lang="ja">{entry.hiragana}</td><td lang="ja">{entry.katakana}</td><td>{entry.romaji}</td></tr>)}</tbody>
        </table>
      </div>;
    })}
    <p className="note">46 basic · 20 dakuten · 5 handakuten.</p>
  </section>;
}
