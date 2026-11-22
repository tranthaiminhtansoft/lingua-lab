export type EnglishVocabularyItem = {
  term: string;
  meaning: string;
  pronunciation: string;
  score: number;
};

export type EnglishGrammarItem = {
  title: string;
  /** Grammar group such as Tense, Modal, Conditional, Passive… */
  category: string;
  /** Pattern to memorise, e.g. S + have/has + V3. */
  formula: string;
  example: string;
  /** IPA pronunciation of the example sentence. */
  pronunciation?: string;
};

export type EnglishQuiz = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type EnglishTheme = 'devops' | 'neighbor' | 'meals' | 'weekend';

export type EnglishTopic = {
  id: string;
  title: string;
  description: string;
  availableFrom: string;
  /** Daily essentials stay available every day. */
  daily?: boolean;
  /** Only shown on Mondays. */
  mondayOnly?: boolean;
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
