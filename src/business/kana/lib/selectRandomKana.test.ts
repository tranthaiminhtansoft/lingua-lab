import { selectRandomKana } from './selectRandomKana';
const entries = [{ hiragana: 'あ', katakana: 'ア', romaji: 'a', group: 'basic' as const }, { hiragana: 'い', katakana: 'イ', romaji: 'i', group: 'basic' as const }];
test('selects an item and excludes the immediate previous item', () => {
  expect(entries).toContain(selectRandomKana(entries, entries[0], () => 0));
  expect(selectRandomKana(entries, entries[0], () => 0)).toBe(entries[1]);
  expect(selectRandomKana([entries[0]], entries[0], () => 0)).toBe(entries[0]);
});
