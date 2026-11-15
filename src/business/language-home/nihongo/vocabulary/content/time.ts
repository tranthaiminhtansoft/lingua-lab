export type ReadingPart = { kana: string; romaji: string; role: 'base' | 'shared' | 'fun' | 'pun' | 'repeat' | 'link' | 'changed' };
export type TimeReading = { kana: string; romaji: string; parts?: ReadingPart[] };
export type TimeWord = { japanese: string; kana: string; romaji: string; meaning: string; special?: boolean; parts?: ReadingPart[]; alternative?: TimeReading };
const word = (japanese: string, kana: string, romaji: string, meaning: string, special = false): TimeWord => ({ japanese, kana, romaji, meaning, special });

// UTC arithmetic keeps this teaching calendar independent of device date and timezone.
export const sampleDate = { year: 2026, month: 10, day: 15 } as const;
export const weekdays = [
  word('月曜日', 'げつようび', 'getsuyōbi', 'Monday'), word('火曜日', 'かようび', 'kayōbi', 'Tuesday'),
  word('水曜日', 'すいようび', 'suiyōbi', 'Wednesday'), word('木曜日', 'もくようび', 'mokuyōbi', 'Thursday'),
  word('金曜日', 'きんようび', "kin'yōbi", 'Friday'), word('土曜日', 'どようび', 'doyōbi', 'Saturday'), word('日曜日', 'にちようび', 'nichiyōbi', 'Sunday'),
];
const numbers = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう'];
const romanNumbers = ['', 'ichi', 'ni', 'san', 'yon', 'go', 'roku', 'nana', 'hachi', 'kyū'];
function numberReading(n: number) {
  if (n < 10) return [numbers[n], romanNumbers[n]];
  const tens = Math.floor(n / 10), unit = n % 10;
  return [`${tens === 1 ? '' : numbers[tens]}じゅう${numbers[unit]}`, `${tens === 1 ? '' : romanNumbers[tens]}jū${romanNumbers[unit]}`];
}
const monthKana = ['いち', 'に', 'さん', 'し', 'ご', 'ろく', 'しち', 'はち', 'く', 'じゅう', 'じゅういち', 'じゅうに'];
const monthRomaji = ['ichi', 'ni', 'san', 'shi', 'go', 'roku', 'shichi', 'hachi', 'ku', 'jū', 'jūichi', 'jūni'];
export const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((name, i) => word(`${i + 1}月`, `${monthKana[i]}がつ`, `${monthRomaji[i]}gatsu`, name, [3, 6, 8].includes(i)));
const specialDates: Record<number, [string, string]> = {
  1: ['ついたち', 'tsuitachi'], 2: ['ふつか', 'futsuka'], 3: ['みっか', 'mikka'], 4: ['よっか', 'yokka'],
  5: ['いつか', 'itsuka'], 6: ['むいか', 'muika'], 7: ['なのか', 'nanoka'], 8: ['ようか', 'yōka'],
  9: ['ここのか', 'kokonoka'], 10: ['とおか', 'tōka'], 14: ['じゅうよっか', 'jūyokka'],
  17: ['じゅうしちにち', 'jūshichinichi'], 19: ['じゅうくにち', 'jūkunichi'], 20: ['はつか', 'hatsuka'],
  24: ['にじゅうよっか', 'nijūyokka'], 27: ['にじゅうしちにち', 'nijūshichinichi'], 29: ['にじゅうくにち', 'nijūkunichi'],
};
export const dates = Array.from({ length: 31 }, (_, i) => {
  const n = i + 1, reading = specialDates[n] ?? numberReading(n).map((r, tier) => r + (tier === 0 ? 'にち' : 'nichi'));
  return word(`${n}日`, reading[0], reading[1], `Day ${n} of the month`, n in specialDates);
});
dates[13].alternative = { kana: 'じゅうよんにち', romaji: 'jū yon nichi', parts: [{ kana: 'じゅう', romaji: 'jū', role: 'base' }, { kana: 'よん', romaji: 'yon', role: 'base' }, { kana: 'にち', romaji: 'nichi', role: 'shared' }] };
dates[16].alternative = { kana: 'じゅうななにち', romaji: 'jū nana nichi', parts: [{ kana: 'じゅう', romaji: 'jū', role: 'base' }, { kana: 'なな', romaji: 'nana', role: 'base' }, { kana: 'にち', romaji: 'nichi', role: 'shared' }] };
dates[18].alternative = { kana: 'じゅうきゅうにち', romaji: 'jū kyū nichi', parts: [{ kana: 'じゅう', romaji: 'jū', role: 'base' }, { kana: 'きゅう', romaji: 'kyū', role: 'base' }, { kana: 'にち', romaji: 'nichi', role: 'shared' }] };
export const relativeDays = [
  word('一昨日', 'おととい', 'ototoi', 'The day before yesterday'), word('昨日', 'きのう', 'kinō', 'Yesterday'),
  word('今日', 'きょう', 'kyō', 'Today'), word('明日', 'あした', 'ashita', 'Tomorrow'), word('明後日', 'あさって', 'asatte', 'The day after tomorrow'),
];
export const relativeMornings = [
  word('一昨日の朝', 'おとといのあさ', 'ototoi no asa', 'The morning before yesterday'),
  word('昨日の朝', 'きのうのあさ', 'kinō no asa', 'Yesterday morning'),
  word('今朝', 'けさ', 'kesa', 'This morning'),
  word('明日の朝', 'あしたのあさ', 'ashita no asa', 'Tomorrow morning'),
  word('明後日の朝', 'あさってのあさ', 'asatte no asa', 'The morning after tomorrow'),
];
export const relativeNights = [
  word('一昨日の夜', 'おとといのよる', 'ototoi no yoru', 'The night before last'), word('昨夜', 'ゆうべ', 'yūbe', 'Last night'),
  word('今夜', 'こんや', 'konya', 'Tonight'), word('明日の夜', 'あしたのよる', 'ashita no yoru', 'Tomorrow night'), word('明後日の夜', 'あさってのよる', 'asatte no yoru', 'The night after next'),
];
relativeDays[3].alternative = { kana: 'あす', romaji: 'asu' };
relativeNights[1].alternative = { kana: 'さくや', romaji: 'sakuya' };
export const dayPeriods = [
  { icon: '🌅', word: word('朝', 'あさ', 'asa', 'Morning'), repeat: word('毎朝', 'まいあさ', 'maiasa', 'Every morning') },
  { icon: '☀', word: word('正午', 'しょうご', 'shōgo', 'Noon'), repeat: word('毎日正午', 'まいにちしょうご', 'mainichi shōgo', 'Every noon') },
  { icon: '🌤', word: word('午後', 'ごご', 'gogo', 'Afternoon'), repeat: word('毎日午後', 'まいにちごご', 'mainichi gogo', 'Every afternoon') },
  { icon: '☀︎☾', word: word('夕方', 'ゆうがた', 'yūgata', 'Evening'), repeat: word('毎日夕方', 'まいにちゆうがた', 'mainichi yūgata', 'Every evening') },
  { icon: '☾', word: word('夜', 'よる', 'yoru', 'Night'), repeat: word('毎晩', 'まいばん', 'maiban', 'Every night') },
];
export const dayBoundaryWords = [
  word('日の出', 'ひので', 'hinode', 'Sunrise'),
  word('日の入り', 'ひのいり', 'hinoiri', 'Sunset'),
];
export const everyDay = word('毎日', 'まいにち', 'mainichi', 'Every day');
export const everyWeek = word('毎週', 'まいしゅう', 'maishū', 'Every week');
everyWeek.parts = [{ kana: 'まい', romaji: 'mai', role: 'repeat' }, { kana: 'しゅう', romaji: 'shū', role: 'shared' }];
export const everyMonth = word('毎月', 'まいつき', 'maitsuki', 'Every month');
everyMonth.parts = [{ kana: 'まい', romaji: 'mai', role: 'repeat' }, { kana: 'つき', romaji: 'tsuki', role: 'shared' }];
export const everyYear = word('毎年', 'まいとし', 'maitoshi', 'Every year');
everyYear.parts = [{ kana: 'まい', romaji: 'mai', role: 'repeat' }, { kana: 'とし', romaji: 'toshi', role: 'shared' }];
everyYear.alternative = { kana: 'まいねん', romaji: 'mai nen', parts: [{ kana: 'まい', romaji: 'mai', role: 'repeat' }, { kana: 'ねん', romaji: 'nen', role: 'shared' }] };
export const years = [
  word('年', 'ねん', 'nen', 'year (counter)'),
  word('年', 'とし', 'toshi', 'year; age'),
  word('今年', 'ことし', 'kotoshi', 'this year'),
  word('去年', 'きょねん', 'kyonen', 'last year'),
  word('来年', 'らいねん', 'rainen', 'next year'),
  word('毎年', 'まいとし', 'maitoshi', 'every year'),
  word('〜年前', '〜ねんまえ', '~nemmae', 'years ago'),
  word('〜年後', '〜ねんご', '~nengo', 'years later'),
];
export const hours = monthKana.map((reading, i) => word(`${i + 1}時`, `${i === 3 ? 'よ' : reading}じ`, `${i === 3 ? 'yo' : monthRomaji[i]}ji`, `${i + 1} o’clock`, [3, 6, 8].includes(i)));
hours[6].alternative = { kana: 'ななじ', romaji: 'nanaji' };
const minuteUnits = [['', ''], ['いっぷん', 'ippun'], ['にふん', 'nifun'], ['さんぷん', 'sanpun'], ['よんぷん', 'yonpun'], ['ごふん', 'gofun'], ['ろっぷん', 'roppun'], ['ななふん', 'nanafun'], ['はっぷん', 'happun'], ['きゅうふん', 'kyūfun']];
export const minutes = Array.from({ length: 59 }, (_, i) => {
  const n = i + 1, unit = n % 10, tens = Math.floor(n / 10);
  const prefix = tens ? [`${tens === 1 ? '' : numbers[tens]}じゅう`, `${tens === 1 ? '' : romanNumbers[tens]}jū`] : ['', ''];
  const reading = unit ? minuteUnits[unit].map((r, tier) => prefix[tier] + r) : [`${tens === 1 ? '' : numbers[tens]}じゅっぷん`, `${tens === 1 ? '' : romanNumbers[tens]}juppun`];
  const entry = word(`${n}分`, reading[0], reading[1], `${n} minute${n === 1 ? '' : 's'}`, [0, 1, 3, 4, 6, 8].includes(unit));
  if (unit === 0) entry.alternative = { kana: `${tens === 1 ? '' : numbers[tens]}じっぷん`, romaji: `${tens === 1 ? '' : romanNumbers[tens]}jippun` };
  if (unit === 8) entry.alternative = { kana: prefix[0] + 'はちふん', romaji: prefix[1] + 'hachifun' };
  return entry;
});
export const clockWords = [word('午前', 'ごぜん', 'gozen', 'a.m.'), word('午後', 'ごご', 'gogo', 'p.m.'), word('半', 'はん', 'han', 'Half past'), word('何分', 'なんぷん', 'nanpun', 'What minute?', true)];
export const clockExamples = [
  word('午前7時5分', 'ごぜんしちじごふん', 'gozen shichiji gofun', '7:05 a.m.'),
  word('午後4時半', 'ごごよじはん', 'gogo yoji han', '4:30 p.m.'),
  word('9時18分', 'くじじゅうはっぷん', 'kuji jūhappun', '9:18'),
  word('12時59分', 'じゅうにじごじゅうきゅうふん', 'jūniji gojūkyūfun', '12:59'),
];
export function buildSampleCalendar() {
  const first = new Date(Date.UTC(sampleDate.year, sampleDate.month - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const today = Date.UTC(sampleDate.year, sampleDate.month - 1, sampleDate.day);
  const relative = relativeDays.map((day, i) => ({ timestamp: today + (i - 2) * 86400000, morning: relativeMornings[i], day, night: relativeNights[i] }));
  return Array.from({ length: Math.ceil((offset + dates.length) / 7) * 7 }, (_, i) => {
    const day = i - offset + 1;
    if (day < 1 || day > dates.length) return null;
    const timestamp = Date.UTC(sampleDate.year, sampleDate.month - 1, day);
    return { day, date: dates[day - 1], relative: relative.find((item) => item.timestamp === timestamp) };
  });
}

// Keep complete pronunciations for speech/accessibility; show their building blocks visually.
const part = (kana: string, romaji: string, role: ReadingPart['role'] = 'base'): ReadingPart => ({ kana, romaji, role });
function splitEnding(reading: TimeReading, kana: string, romaji: string, role: ReadingPart['role'] = 'shared', changed = false) {
  if (!reading.kana.endsWith(kana) || !reading.romaji.endsWith(romaji)) return;
  reading.parts = [
    part(reading.kana.slice(0, -kana.length), reading.romaji.slice(0, -romaji.length), changed ? 'changed' : 'base'),
    part(kana, romaji, role),
  ];
}
weekdays.forEach((entry) => splitEnding(entry, 'ようび', 'yōbi'));
months.forEach((entry) => splitEnding(entry, 'がつ', 'gatsu', 'shared', entry.special));
hours.forEach((entry) => {
  splitEnding(entry, 'じ', 'ji', 'shared', entry.special);
  if (entry.alternative) splitEnding(entry.alternative, 'じ', 'ji');
});
dates.forEach((entry, i) => {
  // Tsuitachi and hatsuka are memorized as whole irregular date words.
  if (i === 0 || i === 19) return;
  if (entry.kana.endsWith('にち')) splitEnding(entry, 'にち', 'nichi', 'shared', entry.special);
  else splitEnding(entry, 'か', 'ka', 'shared', true);
});
function splitMinute(reading: TimeReading) {
  const pun = reading.kana.endsWith('ぷん');
  splitEnding(reading, pun ? 'ぷん' : 'ふん', pun ? 'pun' : 'fun', pun ? 'pun' : 'fun', reading.kana.includes('っ'));
}
minutes.forEach((entry) => {
  splitMinute(entry);
  if (entry.alternative) splitMinute(entry.alternative);
});
splitMinute(clockWords[3]);
relativeNights.forEach((entry) => {
  if (entry.kana.includes('のよる')) {
    const index = entry.kana.indexOf('のよる');
    entry.parts = [part(entry.kana.slice(0, index), entry.romaji.split(' no ')[0]), part('の', 'no', 'link'), part('よる', 'yoru', 'shared')];
  }
});
relativeMornings.forEach((entry) => {
  if (entry.kana.includes('のあさ')) {
    const index = entry.kana.indexOf('のあさ');
    entry.parts = [part(entry.kana.slice(0, index), entry.romaji.split(' no ')[0]), part('の', 'no', 'link'), part('あさ', 'asa', 'shared')];
  }
});
relativeNights[2].parts = [part('こん', 'kon'), part('や', 'ya', 'shared')];
relativeNights[1].alternative!.parts = [part('さく', 'saku'), part('や', 'ya', 'shared')];
everyDay.parts = [part('まい', 'mai', 'repeat'), part('にち', 'nichi', 'shared')];
export const relativeWeeks = [
  word('一昨週', 'いっさくしゅう', 'issakushū', 'The week before last'),
  word('先週', 'せんしゅう', 'senshū', 'Last week'),
  word('今週', 'こんしゅう', 'konshū', 'This week'),
  word('来週', 'らいしゅう', 'raishū', 'Next week'),
  word('再来週', 'さらいしゅう', 'saraishū', 'The week after next'),
];
export const relativeMonths = [
  word('一昨月', 'いっさくげつ', 'issakugatsu', 'The month before last'),
  word('先月', 'せんげつ', 'sengetsu', 'Last month'),
  word('今月', 'こんげつ', 'kongetsu', 'This month'),
  word('来月', 'らいげつ', 'raigetsu', 'Next month'),
  word('再来月', 'さらいげつ', 'saraigetsu', 'The month after next'),
];
export const relativeYears = [
  word('一昨年', 'いっさくねん', 'issakunen', 'The year before last'),
  years[3],
  years[2],
  years[4],
  word('再来年', 'さらいねん', 'sarainen', 'The year after next'),
];
years[0].parts = [{ kana: 'ねん', romaji: 'nen', role: 'shared' }];
years[1].parts = [{ kana: 'とし', romaji: 'toshi', role: 'base' }];
years[2].parts = [{ kana: 'ことし', romaji: 'kotoshi', role: 'base' }];
years[3].parts = [{ kana: 'きょ', romaji: 'kyo', role: 'base' }, { kana: 'ねん', romaji: 'nen', role: 'shared' }];
years[4].parts = [{ kana: 'らい', romaji: 'rai', role: 'base' }, { kana: 'ねん', romaji: 'nen', role: 'shared' }];
years[5].parts = [{ kana: 'まい', romaji: 'mai', role: 'repeat' }, { kana: 'とし', romaji: 'toshi', role: 'shared' }];
years[6].parts = [{ kana: '〜ねん', romaji: '~nem', role: 'shared' }, { kana: 'まえ', romaji: 'mae', role: 'base' }];
years[7].parts = [{ kana: '〜ねん', romaji: '~nen', role: 'shared' }, { kana: 'ご', romaji: 'go', role: 'base' }];
relativeWeeks[0].parts = [{ kana: 'いっさ', romaji: 'issa', role: 'base' }, { kana: 'くしゅう', romaji: 'kushū', role: 'shared' }];
relativeWeeks[1].parts = [{ kana: 'せん', romaji: 'sen', role: 'base' }, { kana: 'しゅう', romaji: 'shū', role: 'shared' }];
relativeWeeks[2].parts = [{ kana: 'こん', romaji: 'kon', role: 'base' }, { kana: 'しゅう', romaji: 'shū', role: 'shared' }];
relativeWeeks[3].parts = [{ kana: 'らい', romaji: 'rai', role: 'base' }, { kana: 'しゅう', romaji: 'shū', role: 'shared' }];
relativeWeeks[4].parts = [{ kana: 'さらい', romaji: 'sarai', role: 'base' }, { kana: 'しゅう', romaji: 'shū', role: 'shared' }];
relativeMonths[0].parts = [{ kana: 'いっさ', romaji: 'issa', role: 'base' }, { kana: 'くげつ', romaji: 'kugatsu', role: 'shared' }];
relativeMonths[1].parts = [{ kana: 'せん', romaji: 'sen', role: 'base' }, { kana: 'げつ', romaji: 'getsu', role: 'shared' }];
relativeMonths[2].parts = [{ kana: 'こん', romaji: 'kon', role: 'base' }, { kana: 'げつ', romaji: 'getsu', role: 'shared' }];
relativeMonths[3].parts = [{ kana: 'らい', romaji: 'rai', role: 'base' }, { kana: 'げつ', romaji: 'getsu', role: 'shared' }];
relativeMonths[4].parts = [{ kana: 'さらい', romaji: 'sarai', role: 'base' }, { kana: 'げつ', romaji: 'getsu', role: 'shared' }];
relativeYears[0].parts = [{ kana: 'いっさ', romaji: 'issa', role: 'base' }, { kana: 'くねん', romaji: 'kunen', role: 'shared' }];
relativeYears[4].parts = [{ kana: 'さらい', romaji: 'sarai', role: 'base' }, { kana: 'ねん', romaji: 'nen', role: 'shared' }];
dayPeriods[0].repeat.parts = [part('まい', 'mai', 'repeat'), part('あさ', 'asa', 'shared')];
dayPeriods[1].word.parts = [part('しょう', 'shō'), part('ご', 'go')];
dayPeriods[1].repeat.parts = [part('まい', 'mai', 'repeat'), part('にち', 'nichi', 'shared'), part('しょう', 'shō'), part('ご', 'go')];
dayPeriods[2].repeat.parts = [part('まい', 'mai', 'repeat'), part('にち', 'nichi', 'shared'), part('ごご', 'gogo')];
dayPeriods[3].repeat.parts = [part('まい', 'mai', 'repeat'), part('にち', 'nichi', 'shared'), part('ゆうがた', 'yūgata')];
dayPeriods[4].repeat.parts = [part('まい', 'mai', 'repeat'), part('ばん', 'ban', 'shared')];
dayBoundaryWords[0].parts = [part('ひ', 'hi'), part('の', 'no', 'link'), part('で', 'de')];
dayBoundaryWords[1].parts = [part('ひ', 'hi'), part('の', 'no', 'link'), part('いり', 'iri')];
clockExamples[0].parts = [part('ごぜん', 'gozen'), part('しち', 'shichi', 'changed'), part('じ', 'ji', 'shared'), part('ご', 'go'), part('ふん', 'fun', 'fun')];
clockExamples[1].parts = [part('ごご', 'gogo'), part('よ', 'yo', 'changed'), part('じ', 'ji', 'shared'), part('はん', 'han', 'shared')];
clockExamples[2].parts = [part('く', 'ku', 'changed'), part('じ', 'ji', 'shared'), part('じゅうはっ', 'jūhap', 'changed'), part('ぷん', 'pun', 'pun')];
clockExamples[3].parts = [part('じゅうに', 'jūni'), part('じ', 'ji', 'shared'), part('ごじゅうきゅう', 'gojūkyū'), part('ふん', 'fun', 'fun')];

// Standalone words retain the same color as the matching part of a compound.
dayPeriods[0].word.parts = [part('あさ', 'asa', 'shared')];
dayPeriods[4].word.parts = [part('よる', 'yoru', 'shared')];
clockWords[2].parts = [part('はん', 'han', 'shared')];

const numberParts: [string, string][] = [
  ['じゅう', 'jū'], ['じゅっ', 'jup'], ['じっ', 'jip'], ['よっ', 'yok'], ['みっ', 'mik'], ['しち', 'shichi'], ['きゅう', 'kyū'],
  ['いち', 'ichi'], ['ろく', 'roku'], ['なな', 'nana'], ['はち', 'hachi'], ['さん', 'san'], ['よん', 'yon'],
  ['いっ', 'ip'], ['ろっ', 'rop'], ['はっ', 'hap'], ['に', 'ni'], ['ご', 'go'], ['し', 'shi'], ['よ', 'yo'], ['く', 'ku'],
];
function splitNumberPart(original: ReadingPart): ReadingPart[] {
  if (!['base', 'changed'].includes(original.role)) return [original];
  let kana = original.kana, romaji = original.romaji;
  const result: ReadingPart[] = [];
  while (kana) {
    const match = numberParts.find(([k, r]) => kana.startsWith(k) && romaji.startsWith(r));
    if (!match) return [original];
    const [k, r] = match;
    const changed = k.includes('っ') || (original.role === 'changed' && ['し', 'しち', 'よ', 'く'].includes(k));
    result.push(part(k, r, changed ? 'changed' : 'base'));
    kana = kana.slice(k.length); romaji = romaji.slice(r.length);
  }
  return romaji ? [original] : result;
}
const allWords = [...weekdays, ...months, ...dates, ...relativeDays, ...relativeMornings, ...relativeNights, ...dayBoundaryWords, everyDay,
  ...dayPeriods.flatMap((period) => [period.word, period.repeat]), ...hours, ...minutes, ...clockWords, ...clockExamples];
allWords.forEach((entry) => {
  if (entry.parts) entry.parts = entry.parts.flatMap(splitNumberPart);
  if (entry.alternative?.parts) entry.alternative.parts = entry.alternative.parts.flatMap(splitNumberPart);
});
