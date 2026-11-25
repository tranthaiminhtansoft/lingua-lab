import { getDailyTopics, getTodayEnglishContext, isTopicAvailable } from './todayEnglish';

test('daily topics are deterministic for the same date', () => {
  const date = new Date(2026, 10, 15);
  expect(getDailyTopics(date).map((topic) => topic.id)).toEqual(getDailyTopics(date).map((topic) => topic.id));
});

test('each weekday contributes three daily topics', () => {
  const topics = getDailyTopics(new Date(2026, 10, 16));
  expect(topics).toHaveLength(3);
  expect(topics.map((topic) => topic.theme).sort()).toEqual(['devops', 'meals', 'neighbor']);
});

test('weekend replaces work topics with leisure topics', () => {
  const topics = getDailyTopics(new Date(2026, 10, 15));
  expect(topics).toHaveLength(4);
  expect(topics.map((topic) => topic.theme).sort()).toEqual(['meals', 'neighbor', 'weekend', 'weekend']);
  const ids = topics.map((topic) => topic.id);
  expect(ids).not.toContain('devops-meeting');
  expect(ids).not.toContain('devops-release-planning');
});

test('daily selection rotates across the week', () => {
  const combos = new Set<string>();
  for (let day = 0; day < 7; day += 1) {
    combos.add(getDailyTopics(new Date(2026, 10, 1 + day)).map((topic) => topic.id).join(','));
  }
  expect(combos.size).toBeGreaterThan(1);
});

test('future holiday topics stay unavailable until their date', () => {
  const context = getTodayEnglishContext(new Date(2026, 10, 15));
  const blackFriday = context.topics.find((topic) => topic.id === 'black-friday');
  expect(blackFriday).toBeDefined();
  expect(isTopicAvailable(blackFriday!, new Date(2026, 10, 15))).toBe(false);
  expect(isTopicAvailable(blackFriday!, new Date(2026, 10, 28))).toBe(true);
});

test('daily vocabulary sets rotate instead of repeating', () => {
  const vocabByTopic = new Map<string, Set<string>>();
  for (let day = 1; day <= 8; day += 1) {
    for (const topic of getTodayEnglishContext(new Date(2026, 10, day)).topics.filter((item) => item.theme !== undefined && item.frequency !== 'limitedTime')) {
      expect(topic.vocab).toHaveLength(9);
      const set = vocabByTopic.get(topic.id) ?? new Set<string>();
      set.add(topic.vocab.map((item) => item.term).join('|'));
      vocabByTopic.set(topic.id, set);
    }
  }
  expect([...vocabByTopic.values()].some((sets) => sets.size > 1)).toBe(true);
});

test('daily quizzes mix curated and vocabulary questions with valid answers', () => {
  for (const topic of getTodayEnglishContext(new Date(2026, 10, 15)).topics.filter((t) => t.theme !== undefined)) {
    expect(topic.quizzes).toHaveLength(4);
    for (const quiz of topic.quizzes) {
      expect(quiz.options[quiz.answerIndex]).toBeTruthy();
      expect(quiz.options.length).toBe(3);
    }
  }
});

test('dialogue variants rotate by date', () => {
  const dialoguesByTopic = new Map<string, Set<string>>();
  for (let day = 1; day <= 8; day += 1) {
    for (const topic of getTodayEnglishContext(new Date(2026, 10, day)).topics.filter((item) => item.theme !== undefined && item.frequency !== 'limitedTime')) {
      const set = dialoguesByTopic.get(topic.id) ?? new Set<string>();
      set.add(topic.dialogue.join('|'));
      dialoguesByTopic.set(topic.id, set);
    }
  }
  expect([...dialoguesByTopic.values()].some((sets) => sets.size > 1)).toBe(true);
});

test('every grammar point has a category, a formula, and an example', () => {
  for (const topic of getTodayEnglishContext(new Date(2026, 10, 15)).topics) {
    expect(topic.grammar.length).toBeGreaterThanOrEqual(4);
    for (const item of topic.grammar) {
      expect(item.category.length).toBeGreaterThan(0);
      expect(item.formula.length).toBeGreaterThan(0);
      expect(item.example.length).toBeGreaterThan(0);
    }
  }
});
