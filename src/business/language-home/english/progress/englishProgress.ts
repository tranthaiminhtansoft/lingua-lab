export type VocabularyProgress = {
  score: number;
  completed: boolean;
};

export type TopicProgress = {
  progress: number;
  completed: boolean;
  vocabulary: Record<string, VocabularyProgress>;
  dialogue: Record<string, VocabularyProgress>;
};

export type EnglishProgressState = {
  version: string;
  topics: Record<string, TopicProgress>;
};

const STORAGE_KEY = 'lingua-english-today-progress';
const VOCAB_THRESHOLD = 90;

export function createEmptyProgress(version = '2026.11.15'): EnglishProgressState {
  return { version, topics: {} };
}

export function readProgress(): EnglishProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyProgress();
    const parsed = JSON.parse(raw) as EnglishProgressState;
    if (!parsed || typeof parsed !== 'object' || !parsed.topics) return createEmptyProgress();
    return parsed;
  } catch {
    return createEmptyProgress();
  }
}

export function writeProgress(state: EnglishProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Keep the page usable when storage is unavailable.
  }
}

export function getTopicProgress(
  state: EnglishProgressState,
  topicId: string,
  vocabTerms: string[],
  dialogueSentences: string[] = [],
): TopicProgress {
  const existing = state.topics[topicId];
  if (existing) {
    if (!existing.dialogue) existing.dialogue = {};
    for (const term of vocabTerms) {
      if (!existing.vocabulary[term]) existing.vocabulary[term] = { score: 0, completed: false };
    }
    for (const sentence of dialogueSentences) {
      if (!existing.dialogue[sentence]) existing.dialogue[sentence] = { score: 0, completed: false };
    }
    return existing;
  }
  const vocabulary: Record<string, VocabularyProgress> = {};
  for (const term of vocabTerms) vocabulary[term] = { score: 0, completed: false };
  const dialogue: Record<string, VocabularyProgress> = {};
  for (const sentence of dialogueSentences) dialogue[sentence] = { score: 0, completed: false };
  return { progress: 0, completed: false, vocabulary, dialogue };
}

function recalculateTopic(topic: TopicProgress, vocabTerms: string[], dialogueSentences: string[]) {
  const vocabCompleted = vocabTerms.filter((item) => topic.vocabulary[item]?.completed).length;
  const dialogueCompleted = dialogueSentences.filter((item) => topic.dialogue[item]?.completed).length;
  const allItems = [...vocabTerms, ...dialogueSentences];
  const averageScore = allItems.length === 0
    ? 0
    : Math.round(allItems.reduce((sum, item) => {
        const record = vocabTerms.includes(item) ? topic.vocabulary[item] : topic.dialogue[item];
        return sum + (record?.score ?? 0);
      }, 0) / allItems.length);
  topic.progress = averageScore;
  topic.completed = allItems.length > 0
    && vocabCompleted === vocabTerms.length
    && dialogueCompleted === dialogueSentences.length;
}

export function updateVocabularyScore(
  state: EnglishProgressState,
  topicId: string,
  term: string,
  score: number,
  vocabTerms: string[],
  dialogueSentences: string[] = [],
): EnglishProgressState {
  const topic = getTopicProgress(state, topicId, vocabTerms, dialogueSentences);
  topic.vocabulary[term] = { score, completed: score >= VOCAB_THRESHOLD };
  recalculateTopic(topic, vocabTerms, dialogueSentences);
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
  dialogueSentences: string[],
): EnglishProgressState {
  const topic = getTopicProgress(state, topicId, vocabTerms, dialogueSentences);
  topic.dialogue[sentence] = { score, completed: score >= VOCAB_THRESHOLD };
  recalculateTopic(topic, vocabTerms, dialogueSentences);
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
