// Readings for the words used in this topic. Keep compound words together so
// exceptions such as 二十歳 and 三十分 have their actual word readings.
const kanjiReadings: Readonly<Record<string, string>> = {
  '一時間': 'いちじかん', '三つ': 'みっつ', '三人': 'さんにん', '三個': 'さんこ', '三十分': 'さんじゅっぷん',
  '九時': 'くじ', '二十一歳': 'にじゅういっさい', '二十歳': 'はたち', '十九歳': 'じゅうきゅうさい',
  '今': 'いま', '今日': 'きょう', '仕事': 'しごと', '会社員': 'かいしゃいん',
  '会議': 'かいぎ', '会議室': 'かいぎしつ', '何人': 'なんにん', '何個': 'なんこ',
  '何時': 'なんじ', '何歳': 'なんさい', '先生': 'せんせい', '八百円': 'はっぴゃくえん',
  '出発': 'しゅっぱつ', '前': 'まえ', '助数詞': 'じょすうし', '勉強': 'べんきょう',
  '千円': 'せんえん', '去年': 'きょねん', '問題': 'もんだい', '四月': 'しがつ',
  '図': 'ず', '図書館': 'としょかん', '夜': 'よる', '天気': 'てんき',
  '学校': 'がっこう', '学生': 'がくせい', '形容詞': 'けいようし', '授業': 'じゅぎょう',
  '料理': 'りょうり', '方': 'かた', '日本': 'にほん', '日本料理': 'にほんりょうり',
  '日本語': 'にほんご', '明日': 'あした', '昨日': 'きのう', '時間': 'じかん',
  '本': 'ほん', '来年': 'らいねん', '東京': 'とうきょう', '毎日': 'まいにち',
  '熱': 'ねつ', '田中': 'たなか', '疑問文': 'ぎもんぶん', '疑問詞': 'ぎもんし',
  '病院': 'びょういん', '空港': 'くうこう', '親切': 'しんせつ', '語幹': 'ごかん', '質問': 'しつもん',
  '休': 'やす', '住': 'す', '作': 'つく', '使': 'つか', '好': 'す', '急': 'いそ',
  '描': 'か', '晴': 'は', '暑': 'あつ', '来': 'き', '楽': 'たの', '考': 'かんが',
  '行': 'い', '解': 'と', '話': 'はな', '読': 'よ', '買': 'か', '違': 'ちが', '食': 'た',
};
const readingWords = Object.keys(kanjiReadings).sort((a, b) => b.length - a.length);

export type AnnotatedKanjiPart = { text: string; reading?: string };

export function annotateQuestionKanji(text: string, romaji?: string): readonly AnnotatedKanjiPart[] {
  const parts: AnnotatedKanjiPart[] = [];
  const matcher = new RegExp(`${readingWords.join('|')}|何|三`, 'gu');
  let offset = 0;
  for (const match of text.matchAll(matcher)) {
    if (match.index > offset) parts.push({ text: text.slice(offset, match.index) });
    const word = match[0];
    const following = text.slice(match.index + word.length);
    const reading = word === '何'
      ? (/^[をが]/u.test(following) || /^nani[,.?]?$/iu.test(romaji ?? '') ? 'なに' : /^nan[,.?]?$/iu.test(romaji ?? '') ? 'なん' : text === '何' ? 'なに／なん' : 'なん')
      : word === '三' ? (following.startsWith('つ') ? 'みっ' : 'さん') : kanjiReadings[word];
    parts.push({ text: word, reading });
    offset = match.index + word.length;
  }
  if (offset < text.length) parts.push({ text: text.slice(offset) });
  return parts;
}

export type GrammarEmphasisPart = { text: string; emphasized: boolean };

export function emphasizeQuestionGrammar(text: string, script: 'japanese' | 'romaji'): readonly GrammarEmphasisPart[] {
  if (script === 'japanese' && /^(は|に)$/u.test(text)) return [{ text, emphasized: true }];
  // Match grammatical endings, not lookalike substrings inside words. In
  // particular, the first か in かばん and the i in chigaimasu stay unmarked.
  const matcher = script === 'japanese'
    ? /(?:て|で)(?:いませんでした|いました|いません|います)|ありませんでした|あります|ありません|ませんでした|ません|でした|です|ました|ます|か(?=[。？?]|\s|／|$)/gu
    : /\b(?:deshita|desu|imashita|imasen|imasu|arimasen|arimasu|ka|wa|ni)\b|(?:masen|mashita|masu)\b/giu;
  const parts: GrammarEmphasisPart[] = [];
  let offset = 0;
  for (const match of text.matchAll(matcher)) {
    if (match.index > offset) parts.push({ text: text.slice(offset, match.index), emphasized: false });
    parts.push({ text: match[0], emphasized: true });
    offset = match.index + match[0].length;
  }
  if (offset < text.length) parts.push({ text: text.slice(offset), emphasized: false });
  return parts;
}
