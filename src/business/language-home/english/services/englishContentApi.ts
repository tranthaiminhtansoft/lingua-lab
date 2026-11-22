import type { EnglishTopic, TodayEnglishContext } from '../content/todayEnglish';
import type { EnglishContentBank } from '../content/englishContentTypes';
import { getTodayEnglishContext, isTopicAvailable } from '../content/todayEnglish';
import { getActiveEnglishContent, setActiveEnglishContent } from '../content/englishContentStore';
import { parseEnglishContent } from '../content/englishContentValidation';

export type EnglishContentVersion = {
  version: string;
  updatedAt: string;
};

export type EnglishContentCheckStatus = 'updated' | 'current' | 'fallback' | 'skipped';

export type EnglishContentCheckResult = EnglishContentVersion & {
  status: EnglishContentCheckStatus;
};

const DEFAULT_CONTENT_PATH = 'content/english-content.json';
const CONTENT_CHECK_STORAGE_KEY = 'lingua-english-content-check';
/** Automatic checks are throttled; the Refresh button bypasses this interval. */
export const CONTENT_CHECK_INTERVAL_MS = 5 * 60 * 1000;
const CONTENT_FETCH_TIMEOUT_MS = 8_000;
/** Guards against unexpectedly large or malicious responses. */
const MAX_CONTENT_LENGTH = 2 * 1024 * 1024;

function contentUrl(): string {
  const configured = import.meta.env.VITE_ENGLISH_CONTENT_URL;
  if (typeof configured === 'string' && configured.trim().length > 0) return configured.trim();
  const base = import.meta.env.BASE_URL || '/';
  return `${base.endsWith('/') ? base : `${base}/`}${DEFAULT_CONTENT_PATH}`;
}

function withCacheBuster(url: string): string {
  return `${url}${url.includes('?') ? '&' : '?'}_=${Date.now()}`;
}

function readLastCheck(): number {
  try {
    const stored = Number(localStorage.getItem(CONTENT_CHECK_STORAGE_KEY));
    return Number.isFinite(stored) ? stored : 0;
  } catch {
    return 0;
  }
}

function markChecked(time: number): void {
  try {
    localStorage.setItem(CONTENT_CHECK_STORAGE_KEY, String(time));
  } catch {
    // Storage may be unavailable; checks then run on every page load.
  }
}

function isCheckDue(now: number): boolean {
  return now - readLastCheck() >= CONTENT_CHECK_INTERVAL_MS;
}

function resultFor(status: EnglishContentCheckStatus): EnglishContentCheckResult {
  const active = getActiveEnglishContent();
  return { status, version: active.version, updatedAt: active.updatedAt };
}

/**
 * Fetches the JSON content bank and activates it when its version changes.
 * Any network, parsing, or validation failure keeps the bundled/current bank.
 */
export async function checkEnglishContentApi(
  options: { force?: boolean } = {},
): Promise<EnglishContentCheckResult> {
  const now = Date.now();
  if (!options.force && !isCheckDue(now)) return resultFor('skipped');
  // Throttle failures too; a manual refresh can bypass the interval.
  markChecked(now);

  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), CONTENT_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(withCacheBuster(contentUrl()), {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) return resultFor('fallback');

    const text = await response.text();
    if (text.length > MAX_CONTENT_LENGTH) return resultFor('fallback');

    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      return resultFor('fallback');
    }

    const content = parseEnglishContent(payload);
    if (!content) return resultFor('fallback');
    if (!setActiveEnglishContent(content)) return resultFor('current');
    return { status: 'updated', version: content.version, updatedAt: content.updatedAt };
  } catch {
    return resultFor('fallback');
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export async function getTodayEnglishContextApi(
  date = new Date(),
  content?: EnglishContentBank,
): Promise<TodayEnglishContext> {
  return Promise.resolve(getTodayEnglishContext(date, content));
}

export async function getContentVersionApi(): Promise<EnglishContentVersion> {
  const active = getActiveEnglishContent();
  return Promise.resolve({ version: active.version, updatedAt: active.updatedAt });
}

export function isTopicAvailableApi(topic: EnglishTopic, date = new Date()): boolean {
  return isTopicAvailable(topic, date);
}
