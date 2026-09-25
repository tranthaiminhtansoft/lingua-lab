import type { KanaEntry, KanaGroup, SoundMarkEntry } from '../types/kana';

const rows = {
  basic: [['あ', 'ア', 'a'], ['い', 'イ', 'i'], ['う', 'ウ', 'u'], ['え', 'エ', 'e'], ['お', 'オ', 'o'], ['か', 'カ', 'ka'], ['き', 'キ', 'ki'], ['く', 'ク', 'ku'], ['け', 'ケ', 'ke'], ['こ', 'コ', 'ko'], ['さ', 'サ', 'sa'], ['し', 'シ', 'shi'], ['す', 'ス', 'su'], ['せ', 'セ', 'se'], ['そ', 'ソ', 'so'], ['た', 'タ', 'ta'], ['ち', 'チ', 'chi'], ['つ', 'ツ', 'tsu'], ['て', 'テ', 'te'], ['と', 'ト', 'to'], ['な', 'ナ', 'na'], ['に', 'ニ', 'ni'], ['ぬ', 'ヌ', 'nu'], ['ね', 'ネ', 'ne'], ['の', 'ノ', 'no'], ['は', 'ハ', 'ha'], ['ひ', 'ヒ', 'hi'], ['ふ', 'フ', 'fu'], ['へ', 'ヘ', 'he'], ['ほ', 'ホ', 'ho'], ['ま', 'マ', 'ma'], ['み', 'ミ', 'mi'], ['む', 'ム', 'mu'], ['め', 'メ', 'me'], ['も', 'モ', 'mo'], ['や', 'ヤ', 'ya'], ['ゆ', 'ユ', 'yu'], ['よ', 'ヨ', 'yo'], ['ら', 'ラ', 'ra'], ['り', 'リ', 'ri'], ['る', 'ル', 'ru'], ['れ', 'レ', 're'], ['ろ', 'ロ', 'ro'], ['わ', 'ワ', 'wa'], ['を', 'ヲ', 'wo'], ['ん', 'ン', 'n']],
  dakuten: [['が', 'ガ', 'ga'], ['ぎ', 'ギ', 'gi'], ['ぐ', 'グ', 'gu'], ['げ', 'ゲ', 'ge'], ['ご', 'ゴ', 'go'], ['ざ', 'ザ', 'za'], ['じ', 'ジ', 'ji'], ['ず', 'ズ', 'zu'], ['ぜ', 'ゼ', 'ze'], ['ぞ', 'ゾ', 'zo'], ['だ', 'ダ', 'da'], ['ぢ', 'ヂ', 'ji'], ['づ', 'ヅ', 'zu'], ['で', 'デ', 'de'], ['ど', 'ド', 'do'], ['ば', 'バ', 'ba'], ['び', 'ビ', 'bi'], ['ぶ', 'ブ', 'bu'], ['べ', 'ベ', 'be'], ['ぼ', 'ボ', 'bo']],
  handakuten: [['ぱ', 'パ', 'pa'], ['ぴ', 'ピ', 'pi'], ['ぷ', 'プ', 'pu'], ['ぺ', 'ペ', 'pe'], ['ぽ', 'ポ', 'po']],
} as const;

export const kanaEntries: readonly KanaEntry[] = (Object.entries(rows) as [KanaGroup, readonly (readonly [string, string, string])[]][]).flatMap(([group, entries]) => entries.map(([hiragana, katakana, romaji]) => ({ hiragana, katakana, romaji, group })));

export const kanaGroups: Readonly<Record<KanaGroup, readonly KanaEntry[]>> = {
  basic: kanaEntries.filter((entry) => entry.group === 'basic'),
  dakuten: kanaEntries.filter((entry) => entry.group === 'dakuten'),
  handakuten: kanaEntries.filter((entry) => entry.group === 'handakuten'),
};

export const kanaRowLayouts: Readonly<Record<KanaGroup, readonly (readonly (number | null)[])[]>> = {
  basic: [[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24], [25, 26, 27, 28, 29], [30, 31, 32, 33, 34], [35, null, 36, null, 37], [38, 39, 40, 41, 42], [43, null, null, null, 44], [45, null, null, null, null]],
  dakuten: [[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19]],
  handakuten: [[0, 1, 2, 3, 4]],
};

export const yoonEntries: readonly SoundMarkEntry[] = [['きゃ', 'キャ', 'kya'], ['きゅ', 'キュ', 'kyu'], ['きょ', 'キョ', 'kyo'], ['しゃ', 'シャ', 'sha'], ['しゅ', 'シュ', 'shu'], ['しょ', 'ショ', 'sho'], ['ちゃ', 'チャ', 'cha'], ['ちゅ', 'チュ', 'chu'], ['ちょ', 'チョ', 'cho'], ['にゃ', 'ニャ', 'nya'], ['にゅ', 'ニュ', 'nyu'], ['にょ', 'ニョ', 'nyo'], ['ひゃ', 'ヒャ', 'hya'], ['ひゅ', 'ヒュ', 'hyu'], ['ひょ', 'ヒョ', 'hyo'], ['みゃ', 'ミャ', 'mya'], ['みゅ', 'ミュ', 'myu'], ['みょ', 'ミョ', 'myo'], ['りゃ', 'リャ', 'rya'], ['りゅ', 'リュ', 'ryu'], ['りょ', 'リョ', 'ryo'], ['ぎゃ', 'ギャ', 'gya'], ['ぎゅ', 'ギュ', 'gyu'], ['ぎょ', 'ギョ', 'gyo'], ['じゃ', 'ジャ', 'ja'], ['じゅ', 'ジュ', 'ju'], ['じょ', 'ジョ', 'jo'], ['ぢゃ', 'ヂャ', 'ja'], ['ぢゅ', 'ヂュ', 'ju'], ['ぢょ', 'ヂョ', 'jo'], ['びゃ', 'ビャ', 'bya'], ['びゅ', 'ビュ', 'byu'], ['びょ', 'ビョ', 'byo'], ['ぴゃ', 'ピャ', 'pya'], ['ぴゅ', 'ピュ', 'pyu'], ['ぴょ', 'ピョ', 'pyo']];
export const sokuonEntries: readonly SoundMarkEntry[] = [['きって', 'キッテ', 'kitte', 'stamp'], ['がっこう', 'ガッコウ', 'gakkou', 'school'], ['ざっし', 'ザッシ', 'zasshi', 'magazine'], ['いっぱい', 'イッパイ', 'ippai', 'full / one cup / plenty']];
export const choonEntries: readonly SoundMarkEntry[] = [['おばあさん', '', 'obaasan', 'grandmother / elderly woman'], ['おにいさん', '', 'oniisan', 'older brother / young man'], ['くうこう', '', 'kuukou', 'airport'], ['', 'ケーキ', 'keeki', 'cake'], ['', 'スーパー', 'suupaa', 'supermarket'], ['', 'コーヒー', 'koohii', 'coffee']];
