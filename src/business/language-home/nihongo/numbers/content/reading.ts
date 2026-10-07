const mora: Record<string, string> = {
  あ:'a',い:'i',う:'u',え:'e',お:'o',か:'ka',き:'ki',く:'ku',け:'ke',こ:'ko',さ:'sa',し:'shi',す:'su',せ:'se',そ:'so',
  た:'ta',ち:'chi',つ:'tsu',て:'te',と:'to',な:'na',に:'ni',ぬ:'nu',ね:'ne',の:'no',は:'ha',ひ:'hi',ふ:'fu',へ:'he',ほ:'ho',
  ま:'ma',み:'mi',む:'mu',め:'me',も:'mo',や:'ya',ゆ:'yu',よ:'yo',ら:'ra',り:'ri',る:'ru',れ:'re',ろ:'ro',わ:'wa',を:'o',ん:'n',
  が:'ga',ぎ:'gi',ぐ:'gu',げ:'ge',ご:'go',ざ:'za',じ:'ji',ず:'zu',ぜ:'ze',ぞ:'zo',だ:'da',ぢ:'ji',づ:'zu',で:'de',ど:'do',
  ば:'ba',び:'bi',ぶ:'bu',べ:'be',ぼ:'bo',ぱ:'pa',ぴ:'pi',ぷ:'pu',ぺ:'pe',ぽ:'po',
  きゃ:'kya',きゅ:'kyu',きょ:'kyo',しゃ:'sha',しゅ:'shu',しょ:'sho',ちゃ:'cha',ちゅ:'chu',ちょ:'cho',にゃ:'nya',にゅ:'nyu',にょ:'nyo',
  ひゃ:'hya',ひゅ:'hyu',ひょ:'hyo',みゃ:'mya',みゅ:'myu',みょ:'myo',りゃ:'rya',りゅ:'ryu',りょ:'ryo',ぎゃ:'gya',ぎゅ:'gyu',ぎょ:'gyo',
  じゃ:'ja',じゅ:'ju',じょ:'jo',びゃ:'bya',びゅ:'byu',びょ:'byo',ぴゃ:'pya',ぴゅ:'pyu',ぴょ:'pyo',
};

const expandedMacrons: Record<string, string> = { ā:'aa', ī:'ii', ū:'uu', ē:'ee', ō:'oo' };
const macrons: Record<string, string> = { a:'ā', i:'ī', u:'ū', e:'ē', o:'ō' };

export function readingUnits(kana: string, romaji: string) {
  const kanaUnits: string[] = [];
  for (let index = 0; index < kana.length;) {
    const pair = kana.slice(index, index + 2);
    if (kana[index] === 'っ') {
      const next = kana.slice(index + 1, index + 3);
      kanaUnits.push(mora[next] ? `っ${next}` : `っ${kana[index + 1]}`);
      index += mora[next] ? 3 : 2;
    } else if (mora[pair]) { kanaUnits.push(pair); index += 2; }
    else { kanaUnits.push(kana[index]); index++; }
  }
  const expanded = [...romaji].map((char) => expandedMacrons[char] ?? char).join('');
  const raw: { kana: string; spelling: string }[] = kanaUnits.map((unit) => ({
    kana: unit,
    spelling: unit.startsWith('っ') ? `${mora[unit.slice(1)][0]}${mora[unit.slice(1)]}` : mora[unit],
  }));
  let normalizedCursor = 0;
  for (const unit of raw) {
    if (!unit.spelling || !expanded.slice(normalizedCursor).startsWith(unit.spelling)) throw new Error(`Cannot align reading ${kana} / ${romaji} at ${unit.kana}`);
    normalizedCursor += unit.spelling.length;
  }
  const result: { kana: string; romaji: string }[] = [];
  let cursor = 0;
  for (let index = 0; index < raw.length; index++) {
    const current = raw[index];
    const next = raw[index + 1];
    if (next?.kana === 'う' && /[ou]$/.test(current.spelling)) {
      const tail = current.spelling.at(-1)!;
      let sourceLength = 0;
      let normalizedLength = 0;
      while (normalizedLength < current.spelling.length + 1) {
        const char = romaji[cursor + sourceLength++];
        normalizedLength += (expandedMacrons[char] ?? char).length;
      }
      const sourceSegment = romaji.slice(cursor, cursor + sourceLength);
      const combinedRomaji = sourceSegment.includes(macrons[tail]) ? `${current.spelling.slice(0, -1)}${macrons[tail]}` : `${current.spelling}u`;
      result.push({ kana: `${current.kana}う`, romaji: combinedRomaji });
      cursor += sourceSegment.length;
      index++;
    } else {
      let sourceLength = 0;
      let normalizedLength = 0;
      while (normalizedLength < current.spelling.length) {
        const char = romaji[cursor + sourceLength++];
        normalizedLength += (expandedMacrons[char] ?? char).length;
      }
      const rawSegment = romaji.slice(cursor, cursor + sourceLength);
      result.push({ kana: current.kana, romaji: rawSegment });
      cursor += sourceLength;
    }
  }
  if (cursor !== romaji.length) throw new Error(`Unconsumed romaji in reading ${kana} / ${romaji}`);
  return result;
}
