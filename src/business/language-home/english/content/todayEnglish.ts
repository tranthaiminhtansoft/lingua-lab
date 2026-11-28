import type {
  EnglishContentBank,
  EnglishQuiz,
  EnglishTopic,
  EnglishVocabularyItem,
  TodayEnglishContext,
} from './englishContentTypes';
import { getActiveEnglishContent } from './englishContentStore';

export type {
  EnglishGrammarItem,
  EnglishQuiz,
  EnglishTheme,
  EnglishTopic,
  EnglishVocabularyItem,
  TodayEnglishContext,
} from './englishContentTypes';

const SEASONS_BY_MONTH: Record<number, string> = {
  0: 'Winter',
  1: 'Winter',
  2: 'Spring',
  3: 'Spring',
  4: 'Spring',
  5: 'Summer',
  6: 'Summer',
  7: 'Summer',
  8: 'Autumn',
  9: 'Autumn',
  10: 'Autumn',
  11: 'Winter',
};

const FIXED_HOLIDAYS: Record<string, string> = {
  '01-01': 'New Year’s Day',
  '04-30': 'Reunification Day (Vietnam)',
  '05-01': 'International Workers’ Day',
  '09-02': 'National Day (Vietnam)',
  '12-25': 'Christmas',
};

function seasonFor(date: Date): string {
  return SEASONS_BY_MONTH[date.getMonth()] ?? 'Season';
}

function holidayFor(date: Date): string {
  const key = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return FIXED_HOLIDAYS[key] ?? 'No special holiday today';
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}



function dayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

function hashText(value: string): number {
  let hash = 7;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) % 1_000_003;
  return hash;
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const result = [...items];
  let value = Math.abs(seed) + 1;
  for (let i = result.length - 1; i > 0; i -= 1) {
    value = (value * 1_103_515_245 + 12_345) % 2_147_483_648;
    const j = value % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function rotate<T>(items: T[], offset: number): T[] {
  if (items.length === 0) return items;
  const start = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(start), ...items.slice(0, start)];
}

function pickDailyVocab(topic: EnglishTopic, seed: number, size = 9): EnglishVocabularyItem[] {
  const ordered = rotate(topic.vocab, seed);
  return ordered.slice(0, Math.min(size, ordered.length));
}

function pickDailyDialogue(topic: EnglishTopic, seed: number): string[] {
  const variants = [topic.dialogue, ...(topic.dialogueVariants ?? [])];
  return [...variants[Math.abs(seed) % variants.length]];
}

function shuffleQuizOptions(quiz: EnglishQuiz, seed: number): EnglishQuiz {
  const correctIndices = quiz.answerIndices && quiz.answerIndices.length > 0
    ? quiz.answerIndices
    : [quiz.answerIndex];
  const correctValues = new Set(correctIndices.map((i) => quiz.options[i]));
  const options = seededShuffle(quiz.options, seed);
  const nextIndices = options
    .map((option, index) => (correctValues.has(option) ? index : -1))
    .filter((index) => index >= 0);
  return {
    ...quiz,
    options,
    answerIndex: nextIndices[0] ?? 0,
    ...(nextIndices.length > 1 ? { answerIndices: nextIndices } : { answerIndices: undefined }),
  };
}

function buildDailyQuizzes(
  topic: EnglishTopic,
  vocab: EnglishVocabularyItem[],
  seed: number,
): EnglishQuiz[] {
  const target = vocab[Math.abs(seed) % vocab.length];
  const distractors = seededShuffle(
    vocab.filter((item) => item.term !== target.term),
    seed + 13,
  ).slice(0, 2).map((item) => item.term);
  const options = seededShuffle([target.term, ...distractors], seed + 29);
  const vocabularyQuiz: EnglishQuiz = {
    question: `Which word means “${target.meaning}”?`,
    options,
    answerIndex: Math.max(0, options.indexOf(target.term)),
    explanation: `${target.term} means ${target.meaning}.`,
  };
  const curated = seededShuffle(topic.quizzes, seed + 41).slice(0, 3);
  return seededShuffle([...curated, vocabularyQuiz], seed + 53)
    .map((quiz, index) => shuffleQuizOptions(quiz, seed + index));
}

function isRotatingTopic(topic: EnglishTopic): boolean {
  return topic.frequency !== 'limitedTime' && topic.theme !== undefined;
}

function isAvailableOnDay(topic: EnglishTopic, date: Date): boolean {
  const day = date.getDay(); // 0=Sun..6=Sat
  const dayNames = ['everySun', 'everyMon', 'everyTue', 'everyWed', 'everyThu', 'everyFri', 'everySat'];
  const flag = topic.frequency;
  if (flag === 'daily') return true;
  if (flag === 'everyWeekend') return day === 0 || day === 6;
  if (flag.startsWith('every')) return flag === dayNames[day];
  // limitedTime: available every day within the window
  return true;
}

export function getDailyTopics(
  date = new Date(),
  content: EnglishContentBank = getActiveEnglishContent(),
): EnglishTopic[] {
  const seed = dayNumber(date);
  const available = content.topics.filter((topic) => {
    if (!isAvailableOnDay(topic, date)) return false;
    if (isTopicExpired(topic, date)) return false;
    return isTopicVisible(topic, date) && isTopicAvailable(topic, date);
  });

  const groups = new Map<string, EnglishTopic[]>();
  for (const topic of available) {
    const key = topic.theme ? `theme:${topic.theme}` : `id:${topic.id}`;
    const list = groups.get(key) ?? [];
    list.push(topic);
    groups.set(key, list);
  }

  const picked: EnglishTopic[] = [];
  for (const [key, list] of groups) {
    if (list.length === 1) { picked.push(list[0]); continue; }
    const rotated = rotate(list, seed + hashText(key));
    picked.push(rotated[0]);
  }

  // Stable order: keep original content order
  const order = new Map(content.topics.map((t, i) => [t.id, i]));
  picked.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  return picked;
}

export function getTodayEnglishContext(
  date = new Date(),
  content: EnglishContentBank = getActiveEnglishContent(),
): TodayEnglishContext {
  const todayKey = dateKey(date);
  const day = dayNumber(date);
  // Daily themes rotate by date so the same three topics do not repeat every day.
  const dailyPicks = getDailyTopics(date, content);
  const selectedIds = new Set(dailyPicks.map((t) => t.id));
  const ordered = [
    ...dailyPicks,
    ...content.topics.filter((topic) => {
      if (selectedIds.has(topic.id)) return false;
      if (isTopicExpired(topic, date)) return false;
      // Keep coming soon topics visible (not yet available but within window)
      return isTopicVisible(topic, date) && !isTopicAvailable(topic, date);
    }),
  ];
  const topics = ordered.map((topic) => {
    if (!isRotatingTopic(topic)) {
      return { ...topic, vocab: topic.vocab.map((item) => ({ ...item })) };
    }
    // Inside a daily topic, vocabulary, quizzes, and dialogue also rotate by date.
    const seed = day * 97 + hashText(topic.id);
    const vocab = pickDailyVocab(topic, seed);
    return {
      ...topic,
      vocab: vocab.map((item) => ({ ...item })),
      dialogue: pickDailyDialogue(topic, seed),
      quizzes: buildDailyQuizzes(topic, vocab, seed),
    };
  });
  // Keep future topics visible as coming soon, but mark them by availableFrom.
  return {
    date: todayKey,
    season: seasonFor(date),
    holiday: holidayFor(date),
    topics,
  };
}

function parseDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isTopicAvailable(topic: EnglishTopic, date = new Date()): boolean {
  const today = dateKey(date);
  if (topic.startDate > today) return false;
  if (topic.endDate !== 'none' && topic.endDate < today) return false;
  return true;
}

function isTopicExpired(topic: EnglishTopic, date = new Date()): boolean {
  return topic.endDate !== 'none' && topic.endDate < dateKey(date);
}

/** A coming-soon topic is only shown when it is within this many days. */
export const COMING_SOON_WINDOW_DAYS = 60;

export function isTopicVisible(topic: EnglishTopic, date = new Date(), windowDays = COMING_SOON_WINDOW_DAYS): boolean {
  if (isTopicExpired(topic, date)) return false;
  if (isTopicAvailable(topic, date)) return true;
  const today = dateKey(date);
  const diff = Math.round((parseDate(topic.startDate).getTime() - parseDate(today).getTime()) / 86_400_000);
  return diff >= 0 && diff <= windowDays;
}

export function daysUntilAvailable(topic: EnglishTopic, date = new Date()): number {
  if (isTopicAvailable(topic, date)) return 0;
  const todayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.max(0, Math.round((parseDate(topic.startDate).getTime() - todayDate.getTime()) / 86_400_000));
}

export function getTopicTimeLimit(topic: EnglishTopic): number {
  if (typeof topic.timeLimit === 'number' && topic.timeLimit === 0) return 0;
  if (typeof topic.timeLimit === 'number' && topic.timeLimit > 0) return topic.timeLimit;
  const minutes = Math.ceil(topic.vocab.length * 0.4 + topic.grammar.length * 1 + topic.dialogue.length * 0.5);
  return Math.max(5, minutes);
}
