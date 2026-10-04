import type { JapaneseRomajiPair } from '../components/JapaneseWithRomaji';
import { annotateQuestionKanji, emphasizeQuestionGrammar } from './questionAnnotations';
import { questionGroups } from './questionTypes';

test('uses whole-word and context-specific kana readings', () => {
  expect(annotateQuestionKanji('二十歳です。')).toContainEqual({ text: '二十歳', reading: 'はたち' });
  expect(annotateQuestionKanji('三つあります。')).toContainEqual({ text: '三つ', reading: 'みっつ' });
  expect(annotateQuestionKanji('何を食べますか。')).toContainEqual({ text: '何', reading: 'なに' });
  expect(annotateQuestionKanji('何ですか。')).toContainEqual({ text: '何', reading: 'なん' });
  expect(annotateQuestionKanji('日本語')).toEqual([{ text: '日本語', reading: 'にほんご' }]);
});

test('emphasizes question markers and endings without coloring lookalike word stems', () => {
  expect(emphasizeQuestionGrammar('かばんですか。', 'japanese').filter((part) => part.emphasized).map((part) => part.text)).toEqual(['です', 'か']);
  expect(emphasizeQuestionGrammar('Chigaimasu.', 'romaji').filter((part) => part.emphasized).map((part) => part.text)).toEqual(['masu']);
  expect(emphasizeQuestionGrammar('Hanashite imasu ka?', 'romaji').filter((part) => part.emphasized).map((part) => part.text)).toEqual(['imasu', 'ka']);
  expect(emphasizeQuestionGrammar('話していませんでした。', 'japanese').filter((part) => part.emphasized).map((part) => part.text)).toEqual(['ていませんでした']);
});

test('every Kanji in topic formulas, examples, replies and alternatives has a kana reading', () => {
  const parts: JapaneseRomajiPair[] = [];
  for (const group of questionGroups) {
    parts.push(...group.japanese);
    for (const type of group.types) {
      parts.push(...type.keywords);
      for (const form of type.forms) {
        parts.push(...form.formula);
        for (const example of form.examples) {
          parts.push(...example.question.parts);
          for (const answer of example.answers) parts.push(...answer.sentence.parts);
        }
      }
    }
  }
  for (const [japanese, , alternative] of parts) {
    for (const text of [japanese, alternative?.[0]]) {
      if (typeof text !== 'string') continue;
      const unannotated = annotateQuestionKanji(text).filter((part) => !part.reading).map((part) => part.text).join('');
      expect(unannotated, text).not.toMatch(/\p{Script=Han}/u);
    }
  }
});
