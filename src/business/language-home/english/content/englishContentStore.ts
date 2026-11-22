import { useSyncExternalStore } from 'react';
import bundledContent from './englishContent.json';
import type { EnglishContentBank } from './englishContentTypes';

/** Content compiled into the application; always available offline. */
export const BUNDLED_ENGLISH_CONTENT = bundledContent as EnglishContentBank;

let activeContent: EnglishContentBank = BUNDLED_ENGLISH_CONTENT;
const listeners = new Set<() => void>();

export function getActiveEnglishContent(): EnglishContentBank {
  return activeContent;
}

/**
 * Replaces the active bank only when the version changes so components that
 * subscribe to the store do not re-render on every check.
 */
export function setActiveEnglishContent(content: EnglishContentBank): boolean {
  if (content.version === activeContent.version) return false;
  activeContent = content;
  for (const listener of listeners) listener();
  return true;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Subscribes a component to the active content bank. */
export function useEnglishContent(): EnglishContentBank {
  return useSyncExternalStore(subscribe, getActiveEnglishContent, getActiveEnglishContent);
}
