export type EnglishVocabularyItem = {
  term: string;
  meaning: string;
  pronunciation: string;
  score: number;
};

export type EnglishGrammarAlternative = {
  /** Pattern for this alternative, e.g. S + tend to + V. */
  formula: string;
  /** Vietnamese description of when this alternative is used. */
  context: string;
  /** English example with the Vietnamese translation in parentheses. */
  example: string;
};

export type EnglishGrammarItem = {
  /** Optional heading; derived from the formula when missing. */
  title?: string;
  /** Grammar group such as Tense, Modal, Conditional, Passive… */
  category?: string;
  /** Pattern to memorise, e.g. S + have/has + V3. */
  formula: string;
  example: string;
  /** IPA pronunciation of the example sentence. */
  pronunciation?: string;
  /** Vietnamese explanation of when and where to use this grammar point. */
  usage?: string;
  /**
   * Three formulas with the same communicative purpose but different
   * situations, formality, or nuance. The first entry mirrors `formula` and
   * `example` and adds its usage context.
   */
  alternatives?: EnglishGrammarAlternative[];
};

export type EnglishQuiz = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type EnglishTheme = 'devops' | 'neighbor' | 'meals' | 'weekend';

/**
 * How often a topic is featured in the daily rotation, or whether it is a
 * one-off event with a fixed availability window.
 * - `daily`: available every day.
 * - `everyWeekend`: available on Saturday and Sunday.
 * - `everyMon`..`everySun`: available on that weekday only.
 * - `limitedTime`: available only between `startDate` and `endDate`.
 */
export type EnglishFrequency =
  | 'daily'
  | 'everyWeekend'
  | 'limitedTime'
  | 'everyMon'
  | 'everyTue'
  | 'everyWed'
  | 'everyThu'
  | 'everyFri'
  | 'everySat'
  | 'everySun';

export type EnglishTopic = {
  id: string;
  title: string;
  description: string;
  /** When the topic first becomes available (ISO YYYY-MM-DD). */
  startDate: string;
  /** Last day the topic is available, or "none" for recurring topics. */
  endDate: string;
  /** Recurrence pattern for the topic. */
  frequency: EnglishFrequency;
  /** Suggested time limit in minutes for this topic. */
  timeLimit?: number;
  /** Daily topics rotate within their theme. */
  theme?: EnglishTheme;
  vocab: EnglishVocabularyItem[];
  grammar: EnglishGrammarItem[];
  examples: string[];
  quizzes: EnglishQuiz[];
  readExpected: string;
  dialogue: string[];
  /** Extra dialogue variants that rotate by date. */
  dialogueVariants?: string[][];
  /** Pronunciation and Vietnamese translation for dialogue messages, keyed by the full message. */
  dialogueGuides?: Record<string, { pronunciation: string; meaning: string }>;
};

export type TodayEnglishContext = {
  date: string;
  season: string;
  holiday: string;
  topics: EnglishTopic[];
};

/** A versioned bundle of English topics, either bundled at build time or fetched remotely. */
export type EnglishContentBank = {
  version: string;
  updatedAt: string;
  topics: EnglishTopic[];
};
