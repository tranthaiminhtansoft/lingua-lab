import { choonEntries, kanaEntries } from './kana';

test('contains the approved 71-entry kana inventory', () => {
  expect(kanaEntries).toHaveLength(71);
  expect(kanaEntries.filter((entry) => entry.group === 'basic')).toHaveLength(46);
  expect(kanaEntries.filter((entry) => entry.group === 'dakuten')).toHaveLength(20);
  expect(kanaEntries.filter((entry) => entry.group === 'handakuten')).toHaveLength(5);
  kanaEntries.forEach((entry) => {
    expect(entry.hiragana + entry.katakana).not.toMatch(/[ゃゅょャュョ]/);
    expect(entry.hiragana).not.toBe(''); expect(entry.katakana).not.toBe(''); expect(entry.romaji).not.toBe('');
  });
});

test('shows Chōon examples in Hiragana and Katakana with explicit long-vowel marks', () => {
  expect(choonEntries.slice(0, 3).map(([hiragana, katakana]) => [hiragana, katakana])).toEqual([
    ['おばあさん', 'オバーサン'],
    ['おにいさん', 'オニーサン'],
    ['くうこう', 'クーコー'],
  ]);
  expect(choonEntries.map(([, , romaji]) => romaji)).toEqual(['obāsan', 'onīsan', 'kūkō', 'kēki', 'sūpā', 'kōhī']);
});
