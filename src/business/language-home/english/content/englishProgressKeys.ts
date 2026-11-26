import type { EnglishTopic } from './englishContentTypes';

/**
 * Strip a trailing Vietnamese translation in parentheses so progress keys and
 * speech-scoring keys stay stable when translations are added to the sheet.
 * Example: "Hello. (Xin chào.)" -> "Hello."
 */
export function stripTranslation(text: string): string {
  return text.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

export type TopicProgressKeys = {
  vocabTerms: string[];
  grammarExamples: string[];
  dialogueSentences: string[];
};

/** Build the exact keys used by progress storage for a topic. */
export function getTopicProgressKeys(topic: EnglishTopic): TopicProgressKeys {
  return {
    vocabTerms: topic.vocab.map((item) => item.term),
    grammarExamples: topic.grammar.map((item) => stripTranslation(item.example)),
    dialogueSentences: topic.dialogue.map(stripTranslation),
  };
}
