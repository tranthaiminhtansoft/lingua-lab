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
  timeLimit: '20',
};

const metaRows = [{ version: '2026.11.28', updatedAt: '2026-11-28' }];

function tabs(overrides: Record<string, unknown> = {}) {
  return {
    meta: metaRows,
    topics: [baseTopic],
    vocabulary: [],
    grammar: [
      {
        topicId: 'work-update',
        formula: '[Dùng cho thói quen hằng ngày]\nS + V(s/es)',
        example: 'I walk to work every day.\n(Tôi đi bộ đi làm mỗi ngày.)',
        pronunciation: '/aɪ wɔːk tə wɜːrk ˈevri deɪ/',
      },
    ],
    quizzes: [
      {
        topicId: 'work-update',
        questionType: 'Single Best Answer',
        question: 'Chọn đáp án đúng',
        options: 'A. walk\nB. walks\nC. walked\nD. walking',
        answerIndex: '0',
        explanation: 'Lý do sai:\nB - sai.\n\nLý do đúng:\nA - đúng.',
      },
    ],
    dialogue: [
      { topicId: 'work-update', variantIndex: '0', sentences: 'A: Hi.\n\n(Xin chào.)\n\nB: Hello.\n\n(Chào bạn.)' },
    ],
    ...overrides,
  } as never;
}

describe('parseEnglishSheetTabs', () => {
  it('parses sunday-mass grammar format with [Dùng...] label', () => {
    const result = parseEnglishSheetTabs(tabs(), BUNDLED_ENGLISH_CONTENT);
    expect(result.content).not.toBeNull();
    expect(result.errors).toEqual([]);
    const grammar = result.content!.topics[0].grammar;
    expect(grammar).toHaveLength(1);
    expect(grammar[0].formula).toBe('S + V(s/es)');
    expect(grammar[0].usage).toBe('Dùng cho thói quen hằng ngày');
    expect(grammar[0].example).toBe('I walk to work every day. (Tôi đi bộ đi làm mỗi ngày.)');
    expect(grammar[0].pronunciation).toBe('/aɪ wɔːk tə wɜːrk ˈevri deɪ/');
  });

  it('normalizes quiz questionType and strips option prefixes', () => {
    const result = parseEnglishSheetTabs(tabs(), BUNDLED_ENGLISH_CONTENT);
    const quiz = result.content!.topics[0].quizzes[0];
    expect(quiz.questionType).toBe('Single Best Answer');
    expect(quiz.options).toEqual(['walk', 'walks', 'walked', 'walking']);
  });

  it('parses multiple-choice answerIndices and trims questionType', () => {
    const result = parseEnglishSheetTabs(tabs({
      quizzes: [{
        topicId: 'work-update',
        questionType: ' Multiple Choice ',
        question: 'Chọn các đáp án đúng',
        options: 'A. one\nB. two\nC. three\nD. four',
        answerIndex: '0,2',
        explanation: 'Lý do sai:\nB - sai.\nD - sai.\n\nLý do đúng:\nA - đúng.\nC - đúng.',
      }],
    }), BUNDLED_ENGLISH_CONTENT);
    const quiz = result.content!.topics[0].quizzes[0];
    expect(quiz.questionType).toBe('Multiple Choice');
    expect(quiz.answerIndex).toBe(0);
    expect(quiz.answerIndices).toEqual([0, 2]);
  });

  it('groups dialogue translation lines into messages', () => {
    const result = parseEnglishSheetTabs(tabs(), BUNDLED_ENGLISH_CONTENT);
    expect(result.content!.topics[0].dialogue).toEqual(['A: Hi. (Xin chào.)', 'B: Hello. (Chào bạn.)']);
  });

  it('uses sheet values even for sunday-mass instead of bundled topic', () => {
    const result = parseEnglishSheetTabs(tabs({
      topics: [{ ...baseTopic, id: 'sunday-mass' }],
    }), BUNDLED_ENGLISH_CONTENT);
    expect(result.content?.topics[0].frequency).toBe('daily');
  });

  it('warns when timeLimit is blank but keeps content', () => {
    const result = parseEnglishSheetTabs(tabs({ topics: [{ ...baseTopic, timeLimit: '' }] }), BUNDLED_ENGLISH_CONTENT);
    expect(result.content).not.toBeNull();
    expect(result.warnings.some((w) => w.includes('timeLimit'))).toBe(true);
  });
});
