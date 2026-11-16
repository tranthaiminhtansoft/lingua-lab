import type { EnglishTopic, TodayEnglishContext } from '../content/todayEnglish';
import { getTodayEnglishContext, isTopicAvailable } from '../content/todayEnglish';

export type EnglishContentVersion = {
  version: string;
  updatedAt: string;
};

export async function getTodayEnglishContextApi(date = new Date()): Promise<TodayEnglishContext> {
  // Simulated backend boundary: replace this implementation with a real fetch later.
  return Promise.resolve(getTodayEnglishContext(date));
}

export async function getContentVersionApi(): Promise<EnglishContentVersion> {
  return Promise.resolve({ version: '2026.11.15', updatedAt: '2026-11-15' });
}

export function isTopicAvailableApi(topic: EnglishTopic, date = new Date()): boolean {
  return isTopicAvailable(topic, date);
}
