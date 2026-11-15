import { getDailyTopics, getTodayEnglishContext, isTopicAvailable } from './todayEnglish';

test('daily topics are deterministic for the same date', () => {
  const date = new Date(2026, 10, 15);
  expect(getDailyTopics(date).map((topic) => topic.id)).toEqual(getDailyTopics(date).map((topic) => topic.id));
});

test('each daily theme contributes exactly one topic', () => {
  const topics = getDailyTopics(new Date(2026, 10, 15));
  expect(topics).toHaveLength(3);
  expect(topics.map((topic) => topic.theme).sort()).toEqual(['devops', 'meals', 'neighbor']);
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
