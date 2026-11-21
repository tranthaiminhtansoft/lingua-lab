export type VocabularyProgress = {
  score: number;
  completed: boolean;
};

export type TopicProgress = {
  progress: number;
  completed: boolean;
  vocabulary: Record<string, VocabularyProgress>;
  grammar: Record<string, VocabularyProgress>;
  dialogue: Record<string, VocabularyProgress>;
};

export type EnglishProgressState = {
  version: string;
  /** Progress is scoped to this local date; a new day starts fresh. */
  date: string;
  topics: Record<string, TopicProgress>;
};

const STORAGE_KEY = 'lingua-english-today-progress';
const VOCAB_THRESHOLD = 85;

function meetsPronunciationThreshold(score: number): boolean {
  return score > VOCAB_THRESHOLD;
}

export function createEmptyProgress(version = '2026.11.15', date = dateKey(new Date())): EnglishProgressState {
  return { version, date, topics: {} };
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function readProgress(): EnglishProgressState {
  const today = dateKey(new Date());
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyProgress('2026.11.15', today);
    const parsed = JSON.parse(raw) as EnglishProgressState;
    if (!parsed || typeof parsed !== 'object' || !parsed.topics) return createEmptyProgress('2026.11.15', today);
    // A new day starts with a fresh progress slate.
    if (parsed.date !== today) return createEmptyProgress(parsed.version ?? '2026.11.15', today);
    if (!parsed.date) parsed.date = today;
    // Backfill grammar for older saved topics.
    for (const topic of Object.values(parsed.topics)) {
      if (!topic.grammar) topic.grammar = {};
    }
    return parsed;
  } catch {
    return createEmptyProgress('2026.11.15', today);
  }
}

export function writeProgress(state: EnglishProgressState): void {
  try {
    if (!state.date) state.date = dateKey(new Date());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Keep the page usable when storage is unavailable.
  }
}

export function getTopicProgress(
  state: EnglishProgressState,
  topicId: string,
  vocabTerms: string[],
  grammarExamples: string[] = [],
  dialogueSentences: string[] = [],
): TopicProgress {
  const existing = state.topics[topicId];
  if (existing) {
    if (!existing.dialogue) existing.dialogue = {};
    if (!existing.grammar) existing.grammar = {};
    for (const term of vocabTerms) {
      if (!existing.vocabulary[term]) existing.vocabulary[term] = { score: 0, completed: false };
    }
    for (const example of grammarExamples) {
      if (!existing.grammar[example]) existing.grammar[example] = { score: 0, completed: false };
    }
    for (const sentence of dialogueSentences) {
      if (!existing.dialogue[sentence]) existing.dialogue[sentence] = { score: 0, completed: false };
    }
    for (const record of [
      ...Object.values(existing.vocabulary),
      ...Object.values(existing.grammar),
      ...Object.values(existing.dialogue),
    ]) {
      record.completed = record.score > VOCAB_THRESHOLD;
    }
    recalculateTopic(existing, vocabTerms, grammarExamples, dialogueSentences);
    return existing;
  }
  const vocabulary: Record<string, VocabularyProgress> = {};
  for (const term of vocabTerms) vocabulary[term] = { score: 0, completed: false };
  const grammar: Record<string, VocabularyProgress> = {};
  for (const example of grammarExamples) grammar[example] = { score: 0, completed: false };
  const dialogue: Record<string, VocabularyProgress> = {};
  for (const sentence of dialogueSentences) dialogue[sentence] = { score: 0, completed: false };
  return { progress: 0, completed: false, vocabulary, grammar, dialogue };
}

function recalculateTopic(
  topic: TopicProgress,
  vocabTerms: string[],
  grammarExamples: string[],
  dialogueSentences: string[],
) {
  const vocabCompleted = vocabTerms.filter((item) => topic.vocabulary[item]?.completed).length;
  const grammarCompleted = grammarExamples.filter((item) => topic.grammar[item]?.completed).length;
  const dialogueCompleted = dialogueSentences.filter((item) => topic.dialogue[item]?.completed).length;
  const allItems = [...vocabTerms, ...grammarExamples, ...dialogueSentences];
  const averageScore = allItems.length === 0
    ? 0
    : Math.round(allItems.reduce((sum, item) => {
        const record = vocabTerms.includes(item)
          ? topic.vocabulary[item]
          : grammarExamples.includes(item)
            ? topic.grammar[item]
            : topic.dialogue[item];
        return sum + (record?.score ?? 0);
      }, 0) / allItems.length);
  topic.progress = averageScore;
  topic.completed = allItems.length > 0
    && vocabCompleted === vocabTerms.length
    && grammarCompleted === grammarExamples.length
    && dialogueCompleted === dialogueSentences.length;
}

export function updateVocabularyScore(
  state: EnglishProgressState,
  topicId: string,
  term: string,
  score: number,
  vocabTerms: string[],
  grammarExamples: string[] = [],
  dialogueSentences: string[] = [],
): EnglishProgressState {
  const topic = getTopicProgress(state, topicId, vocabTerms, grammarExamples, dialogueSentences);
  topic.vocabulary[term] = { score, completed: meetsPronunciationThreshold(score) };
  recalculateTopic(topic, vocabTerms, grammarExamples, dialogueSentences);
  return {
    ...state,
    topics: { ...state.topics, [topicId]: topic },
  };
}

export function updateGrammarScore(
  state: EnglishProgressState,
  topicId: string,
  example: string,
  score: number,
  vocabTerms: string[],
  grammarExamples: string[] = [],
  dialogueSentences: string[] = [],
): EnglishProgressState {
  const topic = getTopicProgress(state, topicId, vocabTerms, grammarExamples, dialogueSentences);
  topic.grammar[example] = { score, completed: meetsPronunciationThreshold(score) };
  recalculateTopic(topic, vocabTerms, grammarExamples, dialogueSentences);
  return {
    ...state,
    topics: { ...state.topics, [topicId]: topic },
  };
}

export function updateDialogueScore(
  state: EnglishProgressState,
  topicId: string,
  sentence: string,
  score: number,
  vocabTerms: string[],
  grammarExamples: string[] = [],
  dialogueSentences: string[] = [],
): EnglishProgressState {
  const topic = getTopicProgress(state, topicId, vocabTerms, grammarExamples, dialogueSentences);
  topic.dialogue[sentence] = { score, completed: meetsPronunciationThreshold(score) };
  recalculateTopic(topic, vocabTerms, grammarExamples, dialogueSentences);
  return {
    ...state,
    topics: { ...state.topics, [topicId]: topic },
  };
}

export function isOverallComplete(state: EnglishProgressState, availableTopicIds: string[]): boolean {
  return availableTopicIds.length > 0 && availableTopicIds.every((id) => state.topics[id]?.completed === true);
}

export function resetTopicProgress(state: EnglishProgressState, topicId: string): EnglishProgressState {
  const topics = { ...state.topics };
  delete topics[topicId];
  return { ...state, topics };
}

export { VOCAB_THRESHOLD };
