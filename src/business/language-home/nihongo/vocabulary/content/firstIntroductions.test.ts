import { expect, test } from 'vitest';
import { vocabularyGroups } from './firstIntroductions';

const allWords = vocabularyGroups.flatMap(({ words }) => [...words]);
const word = (japanese: string) => allWords.find(([entry]) => entry === japanese);

test('introduction vocabulary covers the core Irodori name and origin exchange', () => {
  expect(word('名前')).toEqual(['名前', 'namae', 'name']);
  expect(word('国')).toEqual(['国', 'kuni', 'country']);
  expect(word('出身')).toEqual(['出身', 'shusshin', 'one’s origin or hometown']);
  expect(word('〜から来ました')).toBeDefined();
  expect(word('お名前は？')).toBeDefined();
  expect(word('お国は？')).toBeDefined();
  expect(word('ご出身は？')).toBeDefined();
  expect(word('〜と申します')).toBeDefined();
  expect(word('どうぞよろしくお願いします')?.[2]).toContain('getting to know you');
});

test('country examples include the countries used in the matching beginner lesson', () => {
  for (const country of ['タイ', 'ブラジル', '韓国', 'ミャンマー', 'フィリピン']) {
    expect(word(country), `${country} should be present`).toBeDefined();
  }
  expect(word('日本')).toEqual(['日本', 'Nihon / Nippon', 'Japan; both readings are used']);
});

test('age and conversational responses include the special reading and natural acknowledgement', () => {
  expect(word('二十歳')).toEqual(['二十歳', 'hatachi', '20 years old; commonly read はたち, also にじゅっさい／にじっさい']);
  expect(word('そうなんですね')).toBeDefined();
  expect(word('こちらこそよろしくお願いします')).toBeDefined();
});

test('vocabulary entries have unique Japanese headwords and non-empty readings and meanings', () => {
  expect(new Set(allWords.map(([japanese]) => japanese)).size).toBe(allWords.length);
  for (const [japanese, reading, meaning] of allWords) {
    expect(japanese.trim()).not.toBe('');
    expect(reading.trim()).not.toBe('');
    expect(meaning.trim()).not.toBe('');
  }
});
