import { BUNDLED_ENGLISH_CONTENT } from './englishContentStore';
import { parseEnglishContent } from './englishContentValidation';
import type { EnglishTopic } from './englishContentTypes';

function makeTopic(overrides: Partial<EnglishTopic> = {}): EnglishTopic {
  return {
    id: 'test-topic',
    title: 'Test topic',
    description: 'A topic used by unit tests.',
    startDate: '2026-01-01',
    endDate: 'none',
    frequency: 'daily',
    vocab: [
      { term: 'hello', meaning: 'xin chào', pronunciation: '/həˈləʊ/', score: 0 },
    ],
    grammar: [
      { title: 'Present simple', category: 'Tense', formula: 'S + V', example: 'I work.' },
    ],
    examples: ['I work every day.'],
    quizzes: [
      { question: 'Pick hello', options: ['hello', 'goodbye'], answerIndex: 0, explanation: 'hello' },
    ],
    readExpected: 'Hello.',
    dialogue: ['A: Hello.'],
    ...overrides,
  };
}

function makeBank(topic: EnglishTopic = makeTopic()) {
  return { version: '2026.11.22', updatedAt: '2026-11-22', topics: [topic] };
}

test('bundled content is a valid content bank', () => {
  const parsed = parseEnglishContent(BUNDLED_ENGLISH_CONTENT);
  expect(parsed).not.toBeNull();
  expect(parsed?.topics).toHaveLength(20);
});

test('accepts a minimal valid bank', () => {
  const parsed = parseEnglishContent(makeBank());
  expect(parsed?.topics[0]?.id).toBe('test-topic');
});

test('rejects duplicate topic ids', () => {
  const bank = makeBank();
  bank.topics.push(makeTopic({ id: 'test-topic' }));
  expect(parseEnglishContent(bank)).toBeNull();
});

test('rejects a quiz answer index outside the options', () => {
  const topic = makeTopic({
    quizzes: [{ question: 'Pick one', options: ['a', 'b'], answerIndex: 2, explanation: 'none' }],
  });
  expect(parseEnglishContent(makeBank(topic))).toBeNull();
});

test('rejects an impossible availability date', () => {
  expect(parseEnglishContent(makeBank(makeTopic({ startDate: '2026-02-30' })))).toBeNull();
});

test('rejects malformed vocabulary scores', () => {
  const topic = makeTopic({
    vocab: [{ term: 'hello', meaning: 'xin chào', pronunciation: '/həˈləʊ/', score: Number.NaN }],
  });
  expect(parseEnglishContent(makeBank(topic))).toBeNull();
});

test('rejects banks without topics', () => {
  expect(parseEnglishContent({ ...makeBank(), topics: [] })).toBeNull();
});
