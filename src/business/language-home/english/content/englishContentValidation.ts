import type {
  EnglishContentBank,
  EnglishGrammarItem,
  EnglishQuiz,
  EnglishTheme,
  EnglishTopic,
  EnglishVocabularyItem,
} from './englishContentTypes';

const THEMES: EnglishTheme[] = ['devops', 'neighbor', 'meals', 'weekend'];
const MAX_VERSION_LENGTH = 40;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function parseArray<T>(value: unknown, parser: (item: unknown) => T | null): T[] | null {
  if (!Array.isArray(value)) return null;
  const result: T[] = [];
  for (const item of value) {
    const parsed = parser(item);
    if (parsed === null) return null;
    result.push(parsed);
  }
  return result;
}

function parseStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  if (!value.every(isText)) return null;
  return [...value];
}

function parseVocabularyItem(value: unknown): EnglishVocabularyItem | null {
  if (!isRecord(value)) return null;
  const { term, meaning, pronunciation, score } = value;
  if (!isText(term) || !isText(meaning) || !isText(pronunciation)) return null;
  if (typeof score !== 'number' || !Number.isFinite(score)) return null;
  return { term, meaning, pronunciation, score };
}

function parseGrammarItem(value: unknown): EnglishGrammarItem | null {
  if (!isRecord(value)) return null;
  const { title, category, formula, example, pronunciation } = value;
  if (!isText(title) || !isText(category) || !isText(formula) || !isText(example)) return null;
  if (pronunciation !== undefined && !isText(pronunciation)) return null;
  return pronunciation === undefined
    ? { title, category, formula, example }
    : { title, category, formula, example, pronunciation };
}

function parseQuiz(value: unknown): EnglishQuiz | null {
  if (!isRecord(value)) return null;
  const { question, options, answerIndex, explanation } = value;
  const parsedOptions = parseStringArray(options);
  if (!isText(question) || !parsedOptions || parsedOptions.length < 2) return null;
  if (typeof answerIndex !== 'number' || !Number.isInteger(answerIndex)) return null;
  if (answerIndex < 0 || answerIndex >= parsedOptions.length) return null;
  if (!isText(explanation)) return null;
  return { question, options: parsedOptions, answerIndex, explanation };
}

function parseDialogueGuides(
  value: unknown,
): Record<string, { pronunciation: string; meaning: string }> | null {
  if (!isRecord(value)) return null;
  const guides: Record<string, { pronunciation: string; meaning: string }> = {};
  for (const [message, guide] of Object.entries(value)) {
    if (!isText(message) || !isRecord(guide)) return null;
    if (!isText(guide.pronunciation) || !isText(guide.meaning)) return null;
    guides[message] = { pronunciation: guide.pronunciation, meaning: guide.meaning };
  }
  return guides;
}

function parseTopic(value: unknown): EnglishTopic | null {
  if (!isRecord(value)) return null;
  const {
    id,
    title,
    description,
    availableFrom,
    daily,
    mondayOnly,
    timeLimit,
    theme,
    vocab,
    grammar,
    examples,
    quizzes,
    readExpected,
    dialogue,
    dialogueVariants,
    dialogueGuides,
  } = value;

  if (!isText(id) || !isText(title) || !isText(description) || !isIsoDate(availableFrom)) return null;
  if (!isText(readExpected)) return null;
  if (daily !== undefined && typeof daily !== 'boolean') return null;
  if (mondayOnly !== undefined && typeof mondayOnly !== 'boolean') return null;
  if (timeLimit !== undefined && (typeof timeLimit !== 'number' || !Number.isFinite(timeLimit) || timeLimit <= 0)) return null;
  if (theme !== undefined && !THEMES.includes(theme as EnglishTheme)) return null;

  const parsedVocab = parseArray(vocab, parseVocabularyItem);
  const parsedGrammar = parseArray(grammar, parseGrammarItem);
  const parsedExamples = parseStringArray(examples);
  const parsedQuizzes = parseArray(quizzes, parseQuiz);
  const parsedDialogue = parseStringArray(dialogue);
  if (!parsedVocab || parsedVocab.length === 0) return null;
  if (!parsedGrammar || parsedGrammar.length === 0) return null;
  if (!parsedExamples) return null;
  if (!parsedQuizzes || parsedQuizzes.length === 0) return null;
  if (!parsedDialogue) return null;

  let parsedVariants: string[][] | undefined;
  if (dialogueVariants !== undefined) {
    const variants = parseArray(dialogueVariants, parseStringArray);
    if (!variants) return null;
    parsedVariants = variants;
  }

  let parsedGuides: Record<string, { pronunciation: string; meaning: string }> | undefined;
  if (dialogueGuides !== undefined) {
    const guides = parseDialogueGuides(dialogueGuides);
    if (!guides) return null;
    parsedGuides = guides;
  }

  return {
    id,
    title,
    description,
    availableFrom,
    ...(daily === undefined ? {} : { daily }),
    ...(mondayOnly === undefined ? {} : { mondayOnly }),
    ...(timeLimit === undefined ? {} : { timeLimit }),
    ...(theme === undefined ? {} : { theme: theme as EnglishTheme }),
    vocab: parsedVocab,
    grammar: parsedGrammar,
    examples: parsedExamples,
    quizzes: parsedQuizzes,
    readExpected,
    dialogue: parsedDialogue,
    ...(parsedVariants === undefined ? {} : { dialogueVariants: parsedVariants }),
    ...(parsedGuides === undefined ? {} : { dialogueGuides: parsedGuides }),
  };
}

/** Validates and normalises a content bank fetched from JSON or bundled at build time. */
export function parseEnglishContent(value: unknown): EnglishContentBank | null {
  if (!isRecord(value)) return null;
  const { version, updatedAt, topics } = value;
  if (!isText(version) || version.length > MAX_VERSION_LENGTH) return null;
  if (!isIsoDate(updatedAt)) return null;
  if (!Array.isArray(topics) || topics.length === 0) return null;

  const parsedTopics: EnglishTopic[] = [];
  const ids = new Set<string>();
  for (const item of topics) {
    const topic = parseTopic(item);
    if (topic === null || ids.has(topic.id)) return null;
    ids.add(topic.id);
    parsedTopics.push(topic);
  }
  return { version, updatedAt, topics: parsedTopics };
}
