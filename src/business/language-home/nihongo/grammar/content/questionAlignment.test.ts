import type { JapaneseRomajiPair } from '../components/JapaneseWithRomaji';
import { alignQuestionParts, alignQuestionText } from './questionAlignment';
import { questionGroups } from './questionTypes';

test('aligns a whole sentence into corresponding Japanese, romaji and gloss phrases', () => {
  const words = alignQuestionText('学校に行きますか。', 'Gakkō ni ikimasu ka?');
  expect(words.map(({ japanese, romaji, gloss }) => [japanese, romaji, gloss])).toEqual([
    ['学校', 'Gakkō', 'school'], ['に', 'ni', 'to / at'], ['行き', 'iki', 'go'],
    ['ます', 'masu', 'polite non-past'], ['か。', 'ka?', 'question'],
  ]);
});

test('marks wa and ni as particles without confusing lexical words or te-forms', () => {
  const words = alignQuestionText('今日は東京に住んでいますか。', 'Kyō wa Tōkyō ni sunde imasu ka?');
  expect(words.filter((word) => word.grammar).map((word) => word.romaji)).toEqual(['wa', 'ni', 'imasu', 'ka?']);
  expect(words.find((word) => word.japanese === '住んで')?.gloss).toBe('live (state)');
  expect(alignQuestionText('かばんですか。', 'Kaban desu ka?')[0].grammar).not.toBe(true);
});

test('keeps word alternatives aligned and preserves full-sentence variants', () => {
  const { words } = alignQuestionParts([['だれの', 'dare no', ['どなたの', 'donata no']]]);
  expect(words[0].alternative?.romaji).toBe('donata');
  expect(words[1].romaji).toBe('no');
  expect(words[1].alternative).toBeUndefined();
  const variant = alignQuestionParts([['どの本が好きですか。', 'Dono hon ga suki desu ka?', ['どれが好きですか。', 'Dore ga suki desu ka?']]]);
  expect(variant.fullAlternatives[0].map((word) => word.japanese).join('')).toBe('どれが好きですか。');
});

test('every displayed question and formula has explicit phrase glosses, including alternatives', () => {
  const parts: JapaneseRomajiPair[] = [];
  for (const group of questionGroups) for (const type of group.types) for (const form of type.forms) {
    parts.push(...form.formula);
    for (const example of form.examples) {
      parts.push(...example.question.parts);
      for (const answer of example.answers) parts.push(...answer.sentence.parts);
    }
  }
  const unmapped: string[] = [];
  for (const [japanese, romaji, alternative] of parts) {
    for (const [text, reading] of [[japanese, romaji], ...(alternative ? [alternative] : [])]) {
      if (typeof text !== 'string' || typeof reading !== 'string') continue;
      const words = alignQuestionText(text, reading);
      if (words.some((word) => !word.gloss)) { unmapped.push(text); continue; }
      expect(words.map((word) => word.japanese).join('')).toBe(text.replace(/\s/gu, ''));
      const normalizeReading = (value: string) => value.replace(/[\s\p{P}\p{S}]/gu, '').toLowerCase();
      expect(normalizeReading(words.map((word) => word.romaji).join(''))).toBe(normalizeReading(reading));
    }
  }
  expect([...new Set(unmapped)]).toEqual([]);
});

test('future question translations use going to with the corresponding subject', () => {
  const futureExamples = questionGroups.flatMap((group) => group.types.flatMap((type) => type.forms.filter((form) => form.time === 'future').flatMap((form) => form.examples)));
  for (const example of futureExamples) {
    expect(example.question.translation).toContain('going to');
    expect(example.question.translation).not.toMatch(/\bwill\b/iu);
  }
  expect(futureExamples.find((example) => example.question.translation.startsWith('Who '))?.question.translation).toBe('Who is going to come tomorrow?');
});
