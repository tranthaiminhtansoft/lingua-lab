import { getDailyTopics, getTodayEnglishContext, isTopicAvailable } from './todayEnglish';

test('daily topics are deterministic for the same date', () => {
  const date = new Date(2026, 10, 15);
  expect(getDailyTopics(date).map((topic) => topic.id)).toEqual(getDailyTopics(date).map((topic) => topic.id));
});

test('topics shown match frequency and pick one per theme', () => {
  const date = new Date(2026, 10, 16); // Monday
  const topics = getDailyTopics(date);
  // same theme should not appear twice
  const themes = topics.map((t) => t.theme ?? `id:${t.id}`);
  expect(new Set(themes).size).toBe(themes.length);
  // a devops daily topic should appear (one per theme)
  expect(topics.some((t) => t.theme === 'devops')).toBe(true);
});

test('weekend frequency topics show only on weekends', () => {
  const sat = getDailyTopics(new Date(2026, 10, 14)); // Sat
  const mon = getDailyTopics(new Date(2026, 10, 16)); // Mon
  const satIds = sat.map((t) => t.id);
  const monIds = mon.map((t) => t.id);
  expect(satIds.some((id) => id.startsWith('weekend-') || id === 'sunday-mass')).toBe(true);
  expect(monIds.some((id) => id === 'weekend-rest' || id === 'weekend-market' || id === 'weekend-outing')).toBe(false);
});

test('daily frequency theme slot shows every day', () => {
  for (let day = 0; day < 7; day += 1) {
    const topics = getDailyTopics(new Date(2026, 10, 16 + day));
    expect(topics.some((t) => t.theme === 'devops')).toBe(true);
  }
});

test('same theme rotates across days', () => {
  const picks = new Set<string>();
  for (let day = 0; day < 7; day += 1) {
    const topic = getDailyTopics(new Date(2026, 10, 16 + day)).find((t) => t.theme === 'devops');
    if (topic) picks.add(topic.id);
  }
  expect(picks.size).toBeGreaterThan(1);
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
    expect(topic.quizzes.length).toBeGreaterThanOrEqual(4);
    for (const quiz of topic.quizzes) {
      expect(quiz.options[quiz.answerIndex]).toBeTruthy();
      expect(quiz.options.length).toBeGreaterThanOrEqual(2);
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

test('every grammar point has a formula and an example', () => {
  for (const topic of getTodayEnglishContext(new Date(2026, 10, 15)).topics) {
    expect(topic.grammar.length).toBeGreaterThanOrEqual(4);
    for (const item of topic.grammar) {
      expect(item.formula.length).toBeGreaterThan(0);
      expect(item.example.length).toBeGreaterThan(0);
    }
  }
});
