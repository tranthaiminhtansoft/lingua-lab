import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GrammarTopicNavigation } from '../grammar/components/GrammarTopicNavigation';
import { numberGroups } from './content/numbers';
import { readingUnits } from './content/reading';

const examples = [
  { label: 'Ones', number: 11, kana: 'じゅういち', romaji: 'jūichi', units: [['じゅう', 'jū'], ['いち', 'ichi']] },
  { label: 'Tens', number: 567, kana: 'ごひゃくろくじゅうなな', romaji: 'gohyaku-rokujū-nana', units: [['ご', 'go'], ['ひゃく', 'hyaku'], ['ろく', 'roku'], ['じゅう', 'jū'], ['なな', 'nana']] },
  { label: 'Hundreds', number: 2481, kana: 'にせんよんひゃくはちじゅういち', romaji: 'nisen-yonhyaku-hachijū-ichi', units: [['に', 'ni'], ['せん', 'sen'], ['よん', 'yon'], ['ひゃく', 'hyaku'], ['はち', 'hachi'], ['じゅう', 'jū'], ['いち', 'ichi']] },
  { label: 'Thousands', number: 10059, kana: 'いちまんごじゅうきゅう', romaji: 'ichiman-gojū-kyū', units: [['いち', 'ichi'], ['まん', 'man'], ['ご', 'go'], ['じゅう', 'jū'], ['きゅう', 'kyū']] },
  { label: 'Ten-thousands', number: 330479, kana: 'さんじゅうさんまんよんひゃくななじゅうきゅう', romaji: 'sanjūsanman-yonhyaku-nanajū-kyū', units: [['さん', 'san'], ['じゅう', 'jū'], ['さん', 'san'], ['まん', 'man'], ['よん', 'yon'], ['ひゃく', 'hyaku'], ['なな', 'nana'], ['じゅう', 'jū'], ['きゅう', 'kyū']] },
  { label: 'Million', number: 1000000, kana: 'ひゃくまん', romaji: 'hyakuman', units: [['ひゃく', 'hyaku'], ['まん', 'man']] },
  { label: 'Billion', number: 1000000000, kana: 'じゅうおく', romaji: 'jūoku', units: [['じゅう', 'jū'], ['おく', 'oku']] },
];

const digitParts = {
  1: ['いち', 'ichi'], 2: ['に', 'ni'], 3: ['さん', 'san'], 4: ['よん', 'yon'],
  5: ['ご', 'go'], 6: ['ろく', 'roku'], 7: ['なな', 'nana'], 8: ['はち', 'hachi'], 9: ['きゅう', 'kyū'],
} as const;
const placeParts = {
  10: ['じゅう', 'jū'], 100: ['ひゃく', 'hyaku'], 1000: ['せん', 'sen'],
  10000: ['まん', 'man'], 100000000: ['おく', 'oku'],
} as const;

const kanjiDigits = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

function kanjiUnderTenThousand(number: number) {
  let remainder = number;
  let result = '';
  for (const [place, kanji] of [[1000, '千'], [100, '百'], [10, '十']] as const) {
    const digit = Math.floor(remainder / place);
    if (digit > 0) result += `${digit === 1 ? '' : kanjiDigits[digit]}${kanji}`;
    remainder %= place;
  }
  if (remainder > 0) result += kanjiDigits[remainder];
  return result;
}

function kanjiNumber(number: number) {
  let remainder = number;
  let result = '';
  if (remainder >= 100000000) {
    result += `${kanjiUnderTenThousand(Math.floor(remainder / 100000000))}億`;
    remainder %= 100000000;
  }
  if (remainder >= 10000) {
    result += `${kanjiUnderTenThousand(Math.floor(remainder / 10000))}万`;
    remainder %= 10000;
  }
  return result + kanjiUnderTenThousand(remainder);
}

function composition(number: number) {
  const parts: { value: number; factor: number; place: number; kana: string; romaji: string }[] = [];
  const scale = number >= 100000000 ? 100000000 : number >= 10000 ? 10000 : 1;
  if (scale > 1) {
    const factor = Math.floor(number / scale);
    const [unitKana, unitRomaji] = placeParts[scale as keyof typeof placeParts];
    parts.push({ value: factor * scale, factor, place: scale, kana: `${factor === 33 ? 'さんじゅうさん' : factor === 100 ? 'ひゃく' : factor === 10 ? 'じゅう' : digitParts[(factor % 10) as keyof typeof digitParts]?.[0] ?? ''}${unitKana}`, romaji: `${factor === 33 ? 'sanjūsan' : factor === 100 ? 'hyaku' : factor === 10 ? 'jū' : digitParts[(factor % 10) as keyof typeof digitParts]?.[1] ?? ''}${unitRomaji}` });
  }
  const remainder = scale > 1 ? number % scale : number;
  for (let exponent = Math.floor(Math.log10(remainder || 1)); exponent >= 0; exponent -= 1) {
    const place = 10 ** exponent;
    const digit = Math.floor(remainder / place) % 10;
    if (digit === 0) continue;
    const value = digit * place;
    const [digitKana, digitRomaji] = digitParts[digit as keyof typeof digitParts];
    const scale = place >= 100000000 ? 100000000 : place >= 10000 ? 10000 : place;
    const [unitKana, unitRomaji] = place === 1 ? ['', ''] : placeParts[scale as keyof typeof placeParts];
    const sound = { 300: ['さんびゃく', 'sanbyaku'], 600: ['ろっぴゃく', 'roppyaku'], 800: ['はっぴゃく', 'happyaku'], 3000: ['さんぜん', 'sanzen'], 8000: ['はっせん', 'hassen'] } as const;
    const changed = sound[value as keyof typeof sound];
    const omitLeadingOne = digit === 1 && [10, 100, 1000].includes(place);
    parts.push({ value, factor: digit, place, kana: changed?.[0] ?? `${omitLeadingOne ? '' : digitKana}${unitKana}`, romaji: changed?.[1] ?? `${omitLeadingOne ? '' : digitRomaji}${unitRomaji}` });
  }
  return parts;
}

function NumberComposition({ number, showReading = true }: { number: number; showReading?: boolean }) {
  const parts = composition(number);
  const equation = `${parts.map((part) => part.place === 1 ? `${part.factor}` : `${part.factor} × ${part.place.toLocaleString('en-US')}`).join(' + ')} = ${number.toLocaleString('en-US')}`;
  const hasSoundChange = parts.some((part) => [300, 600, 800, 3000, 8000].includes(part.value));
  return <div className="number-composition" data-testid="number-composition" aria-label={`Number composition: ${equation}`}>
    <span className="number-composition-equation">{equation}</span>
    {showReading && hasSoundChange && <span className="number-composition-reading number-composition-phonetics" lang="ja">{parts.map((part, index) => <span className="number-reading-unit" key={`${part.kana}-${index}`}>{[300, 600, 800, 3000, 8000].includes(part.value) ? <><span className="number-kana">{digitParts[part.factor as keyof typeof digitParts][0]} + {part.place === 1000 ? 'せん' : 'ひゃく'} → {part.kana}</span><span className="number-romaji">{digitParts[part.factor as keyof typeof digitParts][1]} + {part.place === 1000 ? 'sen' : 'hyaku'} → {part.romaji}</span></> : <><span className="number-kana">{part.kana}</span><span className="number-romaji">{part.romaji}</span></>}</span>)}</span>}
  </div>;
}

export function NumbersMatrixView() {
  return <main className="numbers-page">
    <p className="numbers-back"><Link to="/nihongo-o-benkyuo" aria-label="Back to Nihongo lessons">← Back to Nihongo lessons</Link></p>
    <header className="numbers-hero"><p className="eyebrow">Japanese foundations / 数字</p><h1>Numbers</h1><p>Read the basic Kango numbers by place value. Each row uses the same multiplier across all five groups.</p></header>
    <section aria-labelledby="numbers-table-title" className="numbers-table-section">
      <h2 id="numbers-table-title">Number reference</h2>
      <p id="numbers-table-help">Scroll the table horizontally on narrow screens to reach every place-value group.</p>
      <div className="numbers-table-scroll" role="region" aria-label="Scrollable Japanese numbers table" tabIndex={0}>
        <table aria-describedby="numbers-table-help">
          <caption>Japanese numbers — number, Kana, and Romaji</caption>
          <thead><tr>{numberGroups.map((group) => <th scope="col" key={group.id}>{group.id === 'ones' ? 'Ones' : group.id === 'ten-thousands' ? 'Ten-thousands' : group.id[0].toUpperCase() + group.id.slice(1)}</th>)}</tr></thead>
          <tbody>{Array.from({ length: 9 }, (_, row) => <tr key={row}>{numberGroups.map((group) => {
            const entry = group.entries[row];
            const soundChanged = [300, 600, 800, 3000, 8000].includes(entry.number);
            return <td key={entry.number}><strong className="number-value" data-number={entry.number}>{kanjiNumber(entry.number)}</strong><span className="number-complete-reading visually-hidden" aria-label="Complete reading">{entry.kana} / {entry.romaji}</span><div className="number-reading-comparison"><div className={`number-reading-line${soundChanged ? ' number-sound-change' : ''}`} lang="ja">{readingUnits(entry.kana, entry.romaji).map((unit, index) => <span className="number-reading-unit" aria-label={`Reading unit ${unit.kana} ${unit.romaji}`} key={`${entry.number}-${index}`}><span className="number-kana">{unit.kana}</span><span className="number-romaji">{unit.romaji}</span></span>)}</div>{entry.alternatives.length > 0 && <ul className="number-alternatives" aria-label={`Alternate readings for ${entry.number}`}>{entry.alternatives.map((alternative) => <li key={alternative.kana}><span className="number-alternative-label">Alternate reading: {('label' in alternative ? alternative.label : 'Alternative')}</span><div className="number-reading-line" lang="ja" aria-label={`Alternate reading: ${alternative.kana} / ${alternative.romaji}`}>{readingUnits(alternative.kana, alternative.romaji).map((unit, index) => <span className="number-reading-unit" key={`${entry.number}-${alternative.kana}-${index}`}><strong className="number-alternative">{unit.kana}</strong><span className="number-alternative-romaji">{unit.romaji}</span></span>)}</div><span className="number-context">{alternative.context}</span></li>)}</ul>}</div><NumberComposition number={entry.number} /></td>;
          })}</tr>)}</tbody>
        </table>
      </div>
      <p className="numbers-reading-key"><strong>Reading notes:</strong> red bold text marks alternate readings; sound changes in the main reading are also bolded.</p>
    </section>
    <section aria-labelledby="numbers-examples-title" className="numbers-examples">
      <h2 id="numbers-examples-title">Examples by place-value row</h2>
      <p>Composed-number examples grouped by the place value each section introduces.</p>
      <div className="numbers-example-grid">{examples.map(({ label, number, kana, romaji, units }) => <article className="numbers-example" aria-label={`Example: ${label}`} key={label}><h3>{label}</h3><strong className="number-value" data-number={number}>{kanjiNumber(number)}</strong><span className="number-complete-reading visually-hidden" aria-label="Complete reading">{kana} / {romaji}</span><div className="number-reading-line" lang="ja">{units.map(([unitKana, unitRomaji], index) => <span className="number-reading-unit" aria-label={`Reading unit ${unitKana} ${unitRomaji}`} key={`${number}-${index}`}><span className="number-kana">{unitKana}</span><span className="number-romaji">{unitRomaji}</span></span>)}</div><NumberComposition number={number} showReading={false} /></article>)}</div>
      <p className="numbers-source">Readings and example forms: <a href="https://www.tofugu.com/japanese/counting-in-japanese/">Mami Suzuki, “Japanese Numbers and How to Count ALL of Them”</a>.</p>
    </section>
  </main>;
}

const numberGroupNames: Record<(typeof numberGroups)[number]['id'], string> = {
  ones: 'Ones',
  tens: 'Tens',
  hundreds: 'Hundreds',
  thousands: 'Thousands',
  'ten-thousands': 'Ten-thousands',
};

const soundChangedNumbers = [300, 600, 800, 3000, 8000];

function NumberLadderView() {
  const [activeNumber, setActiveNumber] = useState<number | null>(null);
  return <main className="numbers-page numbers-ladder-page">
    <p className="numbers-back"><Link to="/nihongo-o-benkyuo" aria-label="Back to Nihongo lessons">← Back to Nihongo lessons</Link></p>
    <header className="numbers-hero"><p className="eyebrow">Japanese foundations / 数字</p><h1>Numbers</h1><p>Follow each place-value step. Read the Kanji first, then the Hiragana and Romaji.</p></header>
    <section className="number-ladder" aria-label="Japanese numbers by place value">
      {numberGroups.map((group, groupIndex) => <section className="number-ladder-step" aria-labelledby={`number-step-${group.id}`} key={group.id}>
        <header className="number-ladder-heading"><span className="number-ladder-index">{String(groupIndex + 1).padStart(2, '0')}</span><div><h2 id={`number-step-${group.id}`}>{numberGroupNames[group.id]}</h2><p>{groupIndex === 0 ? 'Start with the basic digits.' : `Build ${numberGroupNames[group.id].toLowerCase()} from the same digits.`}</p></div></header>
        <div className="number-ladder-grid">{group.entries.map((entry) => {
          const hasSoundChange = soundChangedNumbers.includes(entry.number);
          const hasNote = hasSoundChange || entry.alternatives.length > 0;
          const isNoteOpen = activeNumber === entry.number;
          return <article className="number-ladder-card" key={entry.number}>
            <strong className="number-value" data-number={entry.number}>{kanjiNumber(entry.number)}</strong>
            <span className="number-ladder-kana" lang="ja">{entry.kana}</span>
            <span className="number-ladder-romaji">{entry.romaji}</span>
            {hasNote && <button className="number-ladder-notes-button" type="button" aria-expanded={isNoteOpen} aria-controls={`number-notes-${group.id}`} onClick={() => setActiveNumber(isNoteOpen ? null : entry.number)}>{isNoteOpen ? 'Hide notes' : 'Reading notes'}</button>}
          </article>;
        })}</div>
        {group.entries.some((entry) => entry.number === activeNumber) && (() => {
          const entry = group.entries.find((item) => item.number === activeNumber)!;
          const hasSoundChange = soundChangedNumbers.includes(entry.number);
          return <aside className="number-ladder-note-panel" id={`number-notes-${group.id}`} aria-label={`Reading notes for ${kanjiNumber(entry.number)}`}>
            <div className="number-ladder-note-heading"><h3>{kanjiNumber(entry.number)} · {entry.kana} · {entry.romaji}</h3><button type="button" aria-label="Close reading notes" onClick={() => setActiveNumber(null)}>Close</button></div>
            {hasSoundChange && <NumberComposition number={entry.number} />}
            {entry.alternatives.map((alternative) => <div className="number-ladder-alternative" key={alternative.kana}>
              <strong>{'label' in alternative ? alternative.label : 'Alternative'}: {alternative.kana} / {alternative.romaji}</strong>
              <span>{alternative.context}</span>
            </div>)}
          </aside>;
        })()}
      </section>)}
    </section>
    <section aria-labelledby="number-ladder-examples-title" className="numbers-examples">
      <h2 id="number-ladder-examples-title">Examples by place value</h2>
      <p>See how the steps combine to form larger numbers.</p>
      <div className="numbers-example-grid">{examples.map(({ label, number, kana, romaji, units }) => <article className="numbers-example" aria-label={`Example: ${label}`} key={label}><h3>{label}</h3><strong className="number-value" data-number={number}>{kanjiNumber(number)}</strong><span className="number-complete-reading visually-hidden" aria-label="Complete reading">{kana} / {romaji}</span><div className="number-reading-line" lang="ja">{units.map(([unitKana, unitRomaji], index) => <span className="number-reading-unit" aria-label={`Reading unit ${unitKana} ${unitRomaji}`} key={`${number}-${index}`}><span className="number-kana">{unitKana}</span><span className="number-romaji">{unitRomaji}</span></span>)}</div><NumberComposition number={number} showReading={false} /></article>)}</div>
      <p className="numbers-source">Readings and example forms: <a href="https://www.tofugu.com/japanese/counting-in-japanese/">Mami Suzuki, “Japanese Numbers and How to Count ALL of Them”</a>.</p>
    </section>
  </main>;
}

export function NumbersPage() {
  const sections: readonly (readonly [string, string])[] = [...numberGroups.map((group) => [`number-step-${group.id}`, numberGroupNames[group.id]] as const), ['number-ladder-examples-title', 'Examples']];
  return <div className="numbers-page-shell">
    <GrammarTopicNavigation sections={sections} allowCurrentSectionNavigation navigationLabel="Number sections" menuId="number-section-menu" />
    <NumberLadderView />
  </div>;
}
