import type { TimeReading, TimeWord } from './content/time';

function Pronunciation({ reading, tier, special = false }: { reading: TimeReading; tier: 'kana' | 'romaji'; special?: boolean }) {
  const text = reading[tier];
  return <span className={`time-pronunciation${special && !reading.parts ? ' time-special' : ''}`} lang={tier === 'kana' ? 'ja' : 'ja-Latn'} aria-label={text}>
    {reading.parts ? reading.parts.map((part, index) => <span className={`time-sound time-sound-${part.role}`} key={index} aria-hidden="true">{part[tier]}</span>) : text}
  </span>;
}

function AlignedReading({ reading, special = false }: { reading: TimeReading; special?: boolean }) {
  const parts = reading.parts ?? [{ kana: reading.kana, romaji: reading.romaji, role: special ? 'changed' as const : 'base' as const }];
  return <span className="time-aligned-parts" aria-hidden="true">
    {parts.map((part, index) => <span className={`time-aligned-part time-sound-${part.role}`} key={`${part.kana}-${index}`}>
      <span lang="ja">{part.kana}</span><span lang="ja-Latn">{part.romaji}</span>
    </span>)}
  </span>;
}

export function Reading({ entry, meaning = true, alignKanaRomaji = true }: { entry: TimeWord; meaning?: boolean; alignKanaRomaji?: boolean }) {
  return <span className="time-reading">
    {meaning && <span className="time-meaning">{entry.meaning}</span>}
    <span lang="ja">{entry.japanese}</span>
    {alignKanaRomaji
      ? <AlignedReading reading={entry} special={entry.special} />
      : <><Pronunciation reading={entry} tier="kana" special={entry.special} /><Pronunciation reading={entry} tier="romaji" special={entry.special} /></>}
    {entry.alternative && <span className="time-alternative">Also: {alignKanaRomaji
      ? <AlignedReading reading={entry.alternative} />
      : <><Pronunciation reading={entry.alternative} tier="kana" /> · <Pronunciation reading={entry.alternative} tier="romaji" /></>}</span>}
  </span>;
}
