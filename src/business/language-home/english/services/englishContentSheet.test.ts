import { describe, it, expect } from 'vitest';
import { parseEnglishSheetTabs } from './englishContentSheet';
import { BUNDLED_ENGLISH_CONTENT } from '../content/englishContentStore';

const baseTopic = {
  id: 'work-update',
  title: 'Demo topic',
  description: 'Demo description',
  frequency: 'daily',
  startDate: '2020-01-01',
  endDate: 'none',
};

const metaRows = [{ version: '2026.11.26', updatedAt: '2026-11-26' }];

describe('parseEnglishSheetTabs grammar parsing', () => {
  it('parses new items format with pronunciation', () => {
    const tabs = {
      meta: metaRows,
      topics: [baseTopic],
      vocabulary: [],
      grammar: [
        {
          topicId: 'work-update',
          items: 'Present simple | Tense | S + V | I walk. | /aɪ wɔːk/',
        },
      ],
      quizzes: [],
      dialogue: [
        { topicId: 'work-update', variantIndex: '0', sentences: 'A: Hi. (Xin chào.)' },
      ],
    } as never;
    const result = parseEnglishSheetTabs(tabs, BUNDLED_ENGLISH_CONTENT);
    expect(result.content).not.toBeNull();
    const grammar = result.content!.topics[0].grammar;
    expect(grammar).toHaveLength(1);
    expect(grammar[0].title).toBe('Present simple');
    expect(grammar[0].category).toBe('Tense');
    expect(grammar[0].formula).toBe('S + V');
    expect(grammar[0].example).toBe('I walk.');
    expect(grammar[0].pronunciation).toBe('/aɪ wɔːk/');
  });

  it('parses new items format without pronunciation', () => {
    const tabs = {
      meta: metaRows,
      topics: [baseTopic],
      vocabulary: [],
      grammar: [
        {
          topicId: 'work-update',
          items: 'Past simple | Tense | S + V2 | I walked.',
        },
      ],
      quizzes: [],
      dialogue: [
        { topicId: 'work-update', variantIndex: '0', sentences: 'A: Hi. (Xin chào.)' },
      ],
    } as never;
    const result = parseEnglishSheetTabs(tabs, BUNDLED_ENGLISH_CONTENT);
    expect(result.content).not.toBeNull();
    const grammar = result.content!.topics[0].grammar;
    expect(grammar).toHaveLength(1);
    expect(grammar[0].pronunciation).toBeUndefined();
    expect(grammar[0].formula).toBe('S + V2');
  });

  it('parses new items format with usage in parentheses', () => {
    const tabs = {
      meta: metaRows,
      topics: [baseTopic],
      vocabulary: [],
      grammar: [
        {
          topicId: 'work-update',
          items: 'Present simple | Tense | S + V\n(Thói quen hằng ngày) | I walk.',
        },
      ],
      quizzes: [],
      dialogue: [
        { topicId: 'work-update', variantIndex: '0', sentences: 'A: Hi. (Xin chào.)' },
      ],
    } as never;
    const result = parseEnglishSheetTabs(tabs, BUNDLED_ENGLISH_CONTENT);
    expect(result.content).not.toBeNull();
    const grammar = result.content!.topics[0].grammar;
    expect(grammar[0].usage).toBe('Thói quen hằng ngày');
  });

  it('falls back to old multi-column format', () => {
    const tabs = {
      meta: metaRows,
      topics: [baseTopic],
      vocabulary: [],
      grammar: [
        {
          topicId: 'work-update',
          title: 'Old grammar',
          category: 'Tense',
          formula: 'S + V2',
          example: 'I walked.',
          pronunciation: '/aɪ wɔːkt/',
        },
      ],
      quizzes: [],
      dialogue: [
        { topicId: 'work-update', variantIndex: '0', sentences: 'A: Hi. (Xin chào.)' },
      ],
    } as never;
    const result = parseEnglishSheetTabs(tabs, BUNDLED_ENGLISH_CONTENT);
    expect(result.content).not.toBeNull();
    const grammar = result.content!.topics[0].grammar;
    expect(grammar).toHaveLength(1);
    expect(grammar[0].title).toBe('Old grammar');
    expect(grammar[0].formula).toBe('S + V2');
    expect(grammar[0].pronunciation).toBe('/aɪ wɔːkt/');
  });

  it('returns error when required field is missing', () => {
    const tabs = {
      meta: metaRows,
      topics: [baseTopic],
      vocabulary: [],
      grammar: [
        {
          topicId: 'work-update',
          items: 'Incomplete | Tense | S + V',
        },
      ],
      quizzes: [],
      dialogue: [
        { topicId: 'work-update', variantIndex: '0', sentences: 'A: Hi. (Xin chào.)' },
      ],
    } as never;
    const result = parseEnglishSheetTabs(tabs, BUNDLED_ENGLISH_CONTENT);
    expect(result.errors.some((e) => e.includes('thiếu trường bắt buộc'))).toBe(true);
  });
});