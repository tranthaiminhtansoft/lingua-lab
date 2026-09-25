import { kanaEntries } from './kana';

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
