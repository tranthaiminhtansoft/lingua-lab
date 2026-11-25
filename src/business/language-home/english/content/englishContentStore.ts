import { useSyncExternalStore } from 'react';
import bundledContent from './englishContent.json';
import type { EnglishContentBank } from './englishContentTypes';
import { parseEnglishContent } from './englishContentValidation';

/** Content compiled into the application; always available offline. */
export const BUNDLED_ENGLISH_CONTENT = bundledContent as EnglishContentBank;
const CACHED_CONTENT_KEY = 'lingua-english-content-cache';

function readCachedContent(): EnglishContentBank | null {
  try {
    const raw = localStorage.getItem(CACHED_CONTENT_KEY);
    if (!raw) return null;
    const result = parseEnglishContent(JSON.parse(raw));
    if (!result.content) return null;
    if (result.content.version === BUNDLED_ENGLISH_CONTENT.version) return null;
    return result.content;
  } catch {
    return null;
  }
}

function writeCachedContent(content: EnglishContentBank): void {
  try {
    if (content.version === BUNDLED_ENGLISH_CONTENT.version) {
      localStorage.removeItem(CACHED_CONTENT_KEY);
      return;
    }
    localStorage.setItem(CACHED_CONTENT_KEY, JSON.stringify(content));
  } catch {
    // ignore
  }
}

let activeContent: EnglishContentBank = readCachedContent() ?? BUNDLED_ENGLISH_CONTENT;
const listeners = new Set<() => void>();

export function getActiveEnglishContent(): EnglishContentBank {
  return activeContent;
}

/**
 * Replaces the active bank only when the version changes so components that
 * subscribe to the store do not re-render on every check.
 */
export function setActiveEnglishContent(content: EnglishContentBank, force = false): boolean {
  if (!force && content.version === activeContent.version) return false;
  activeContent = content;
  writeCachedContent(content);
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
