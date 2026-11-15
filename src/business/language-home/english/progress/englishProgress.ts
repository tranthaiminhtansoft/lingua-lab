export type VocabularyProgress = {
  score: number;
  completed: boolean;
};

export type TopicProgress = {
  progress: number;
  completed: boolean;
  vocabulary: Record<string, VocabularyProgress>;
};

export type EnglishProgressState = {
  version: string;
  topics: Record<string, TopicProgress>;
};

const STORAGE_KEY = 'lingua-english-today-progress';
const VOCAB_THRESHOLD = 80;

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

export function getTopicProgress(state: EnglishProgressState, topicId: string, vocabTerms: string[]): TopicProgress {
  const existing = state.topics[topicId];
  if (existing) {
    for (const term of vocabTerms) {
      if (!existing.vocabulary[term]) existing.vocabulary[term] = { score: 0, completed: false };
    }
    return existing;
  }
  const vocabulary: Record<string, VocabularyProgress> = {};
  for (const term of vocabTerms) vocabulary[term] = { score: 0, completed: false };
  return { progress: 0, completed: false, vocabulary };
}

export function updateVocabularyScore(
  state: EnglishProgressState,
  topicId: string,
  term: string,
  score: number,
  vocabTerms: string[],
): EnglishProgressState {
  const topic = getTopicProgress(state, topicId, vocabTerms);
  const completed = score >= VOCAB_THRESHOLD;
  topic.vocabulary[term] = { score, completed };
  const completedCount = vocabTerms.filter((item) => topic.vocabulary[item]?.completed).length;
  topic.progress = vocabTerms.length === 0 ? 0 : Math.round((completedCount / vocabTerms.length) * 100);
  topic.completed = topic.progress === 100;
  return {
    ...state,
    topics: { ...state.topics, [topicId]: topic },
  };
}

export function isOverallComplete(state: EnglishProgressState, availableTopicIds: string[]): boolean {
  return availableTopicIds.length > 0 && availableTopicIds.every((id) => state.topics[id]?.completed === true);
}

export { VOCAB_THRESHOLD };
