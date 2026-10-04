import type { JapaneseRomajiPair } from '../components/JapaneseWithRomaji';

export type QuestionWord = { japanese: string; romaji: string; gloss: string; grammar?: boolean; alternative?: QuestionWord };
type WordEntry = readonly [japanese: string, romaji: string, gloss: string, grammar?: boolean];

// Explicit word readings and glosses for this topic, rather than a guessed
// one-to-one translation of Japanese word order into an English sentence.
const vocabulary: readonly WordEntry[] = ([
  ['日本料理', 'nihon ryōri', 'Japanese food'], ['日本語', 'nihongo', 'Japanese'], ['日本', 'Nihon', 'Japan'],
  ['今日', 'kyō', 'today'], ['昨日', 'kinō', 'yesterday'], ['明日', 'ashita', 'tomorrow'],
  ['毎日', 'mainichi', 'every day'], ['去年', 'kyonen', 'last year'], ['来年', 'rainen', 'next year'],
  ['今', 'ima', 'now'], ['さっき', 'sakki', 'a moment ago'], ['夜', 'yoru', 'night'], ['前', 'mae', 'before'],
  ['学生', 'gakusei', 'student'], ['先生', 'sensei', 'teacher'], ['会社員', 'kaishain', 'employee'],
  ['お仕事', 'oshigoto', 'job'], ['仕事', 'shigoto', 'job'], ['エンジニア', 'enjinia', 'engineer'],
  ['田中', 'Tanaka', 'Tanaka'], ['ミン', 'Min', 'Min'], ['リン', 'Rin', 'Lin'], ['さん', 'san', 'name suffix'],
  ['会議室', 'kaigishitsu', 'meeting room'], ['会議', 'kaigi', 'meeting'], ['学校', 'gakkō', 'school'],
  ['図書館', 'toshokan', 'library'], ['空港', 'kūkō', 'airport'], ['病院', 'byōin', 'hospital'],
  ['東京', 'Tōkyō', 'Tokyo'], ['授業', 'jugyō', 'class'], ['天気', 'tenki', 'weather'],
  ['この', 'kono', 'this'], ['あの', 'ano', 'that'], ['方', 'kata', 'person (polite)'],
  ['本', 'hon', 'book'], ['かばん', 'kaban', 'bag'], ['もの', 'mono', 'thing'],
  ['りんご', 'ringo', 'apple'], ['うどん', 'udon', 'udon'], ['バス', 'basu', 'bus'], ['セール', 'sēru', 'sale'],
  ['二十一歳', 'nijūissai', '21 years old'], ['二十歳', 'hatachi', '20 years old'], ['十九歳', 'jūkyūsai', '19 years old'],
  ['三つ', 'mittsu', 'three things'], ['三個', 'sanko', 'three items'], ['三人', 'sannin', 'three people'],
  ['三十分', 'sanjuppun', '30 minutes'], ['一時間', 'ichijikan', 'one hour'], ['九時', 'kuji', 'nine o’clock'],
  ['四月', 'shigatsu', 'April'], ['八百円', 'happyaku en', '800 yen'], ['千円', 'sen en', '1,000 yen'],
  ['どのくらい', 'dono kurai', 'how long / much'], ['どれくらい', 'dore kurai', 'how long / much'],
  ['どうやって', 'dō yatte', 'by what method'], ['どうして', 'dōshite', 'why'], ['どなた', 'donata', 'who (polite)'],
  ['おいくつ', 'oikutsu', 'how old (polite)'], ['どちら', 'dochira', 'where / which'], ['どこ', 'doko', 'where'],
  ['だれ', 'dare', 'who'], ['いつ', 'itsu', 'when'], ['どれ', 'dore', 'which one'], ['どの', 'dono', 'which'],
  ['どんな', 'donna', 'what kind'], ['どう', 'dō', 'how'], ['なぜ', 'naze', 'why'], ['なんで', 'nande', 'why / how'],
  ['いくつ', 'ikutsu', 'how many'], ['いくら', 'ikura', 'how much money'],
  ['何歳', 'nansai', 'how old'], ['何時', 'nanji', 'what time'], ['何人', 'nannin', 'how many people'], ['何個', 'nanko', 'how many items'],
  ['勉強', 'benkyō', 'study'], ['出発', 'shuppatsu', 'departure'], ['料理', 'ryōri', 'food'],
  ['話して', 'hanashite', 'speak (te-form)'], ['読んで', 'yonde', 'read (te-form)'], ['食べて', 'tabete', 'eat (te-form)'],
  ['急いで', 'isoide', 'hurry (te-form)'], ['解いて', 'toite', 'solve (te-form)'], ['描いて', 'kaite', 'draw (te-form)'],
  ['考えて', 'kangaete', 'think (te-form)'], ['住んで', 'sunde', 'live (state)'], ['して', 'shite', 'do (te-form)'],
  ['行き', 'iki', 'go'], ['行く', 'iku', 'go'], ['来', 'ki', 'come'], ['読み', 'yomi', 'read'],
  ['食べ', 'tabe', 'eat'], ['買い', 'kai', 'buy'], ['作り', 'tsukuri', 'make'], ['休み', 'yasumi', 'take time off'],
  ['なり', 'nari', 'become'], ['かかり', 'kakari', 'take (time)'], ['し', 'shi', 'do'],
  ['問題', 'mondai', 'problem'], ['図', 'zu', 'diagram'], ['熱', 'netsu', 'fever'], ['時間', 'jikan', 'time'],
  ['暑かった', 'atsukatta', 'was hot'], ['暑い', 'atsui', 'hot'], ['暑く', 'atsuku', 'hot'],
  ['楽しかった', 'tanoshikatta', 'was fun'], ['楽しい', 'tanoshii', 'fun'], ['親切', 'shinsetsu', 'kind'],
  ['好き', 'suki', 'like'], ['晴れ', 'hare', 'sunny'], ['そう', 'sō', 'that’s right'], ['違い', 'chigai', 'differ / wrong'],
  ['いいえ', 'iie', 'no'], ['はい', 'hai', 'yes'], ['あった', 'atta', 'had / existed'],
  ['なかった', 'nakatta', 'was not', true], ['ない', 'nai', 'not', true],
  ['ありません', 'arimasen', 'not / isn’t', true], ['あります', 'arimasu', 'there is / are', true],
  ['いません', 'imasen', 'not ongoing', true], ['いました', 'imashita', 'past ongoing', true], ['います', 'imasu', 'ongoing / state', true],
  ['ません', 'masen', 'polite negative', true], ['ました', 'mashita', 'polite past', true], ['ます', 'masu', 'polite non-past', true],
  ['でした', 'deshita', 'was / were', true], ['です', 'desu', 'am / is / are', true],
  ['では', 'de wa', 'negative link', true], ['じゃ', 'ja', 'negative link', true],
  ['は', 'wa', 'topic', true], ['に', 'ni', 'to / at', true], ['が', 'ga', 'subject', true], ['を', 'o', 'object', true],
  ['の', 'no', 'of / ’s', true], ['も', 'mo', 'also / still', true], ['で', 'de', 'at / by', true],
  ['から', 'kara', 'from / because', true], ['まで', 'made', 'until / to', true], ['な', 'na', 'noun link', true],
  ['だ', 'da', 'is (plain)', true], ['て', 'te', 'te-form', true], ['か', 'ka', 'question', true],
  ['い形容詞', 'i-keiyōshi', 'i-adjective'], ['形容詞', 'keiyōshi', 'adjective'], ['語幹', 'gokan', 'stem'],
  ['助数詞', 'josūshi', 'counter'], ['かった', 'katta', 'adjective past', true],
  ['N1', 'N1', 'topic noun'], ['N2', 'N2', 'description'], ['N', 'N', 'noun'], ['V-', 'V-', 'verb stem'],
  ['〜', '〜', '…'], ['＋', '+', '+'], ['／', '/', 'or'], ['…', '…', '…'],
] as WordEntry[]).sort((a, b) => b[0].length - a[0].length);

export function alignQuestionText(japanese: string, sourceRomaji: string): readonly QuestionWord[] {
  const words: QuestionWord[] = [];
  let offset = 0;
  while (offset < japanese.length) {
    const remainder = japanese.slice(offset);
    if (/^\s/u.test(remainder)) { offset += 1; continue; }
    if (/^[、。！？?]/u.test(remainder) && words.length > 0) {
      const last = words[words.length - 1];
      last.japanese += remainder[0];
      last.romaji += remainder[0] === '、' ? ',' : /[？?]/u.test(remainder[0]) || /[?]$/u.test(sourceRomaji) ? '?' : '.';
      offset += 1;
      continue;
    }
    if (remainder.startsWith('何') && !vocabulary.some(([word]) => word.startsWith('何') && remainder.startsWith(word))) {
      const romaji = /^[をが]/u.test(remainder.slice(1)) || /^nani$/iu.test(sourceRomaji) ? 'nani' : 'nan';
      words.push({ japanese: '何', romaji, gloss: 'what' });
      offset += 1;
      continue;
    }
    const entry = vocabulary.find(([word]) => remainder.startsWith(word)
      && (word !== 'はい' || offset === 0 || /[、。\s]/u.test(japanese[offset - 1])));
    if (!entry) return [{ japanese, romaji: sourceRomaji, gloss: '' }];
    const [text, romaji, gloss, grammar] = entry;
    words.push({ japanese: text, romaji, gloss, grammar });
    offset += text.length;
  }
  if (/^[A-Z]/u.test(sourceRomaji) && words[0]) words[0].romaji = words[0].romaji.charAt(0).toUpperCase() + words[0].romaji.slice(1);
  return words;
}

export function alignQuestionParts(parts: readonly JapaneseRomajiPair[]) {
  const words: QuestionWord[] = [];
  const fullAlternatives: readonly (readonly QuestionWord[])[] = parts.flatMap(([japanese, romaji, alternative]) => {
    if (typeof japanese !== 'string') return [];
    const primary = alignQuestionText(japanese, romaji);
    if (!alternative || typeof alternative[0] !== 'string') { words.push(...primary); return []; }
    const alternate = alignQuestionText(alternative[0], alternative[1]);
    if (primary.length === alternate.length) {
      words.push(...primary.map((word, index) => word.japanese === alternate[index].japanese
        ? word : { ...word, alternative: alternate[index] }));
      return [];
    }
    words.push(...primary);
    return [alternate];
  });
  return { words, fullAlternatives };
}
