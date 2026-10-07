import type { Lesson } from './lessonTypes';

export const lessons: readonly Lesson[] = [
  { id: 'kana', title: 'Kana', japaneseTitle: 'かな', path: '/nihongo-o-benkyuo/kana', status: 'available', description: 'Compare Hiragana, Katakana, and Romaji.', accent: 'sun' },
  { id: 'grammar', title: 'Grammar', japaneseTitle: '文法', path: '/nihongo-o-benkyuo/grammar', status: 'available', description: 'Build sentences one pattern at a time.', accent: 'sakura' },
  { id: 'numbers', title: 'Numbers', japaneseTitle: '数字', path: '/nihongo-o-benkyuo/numbers', status: 'available', description: 'Read Japanese numbers from 1 to 90,000.', accent: 'sun' },
  { id: 'vocabulary', title: 'Vocabulary', japaneseTitle: '語彙', path: '/nihongo-o-benkyuo/vocabulary', status: 'available', description: 'Learn useful words by topic.', accent: 'indigo' },
];
