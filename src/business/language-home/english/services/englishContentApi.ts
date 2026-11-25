import type { EnglishTopic, TodayEnglishContext } from '../content/todayEnglish';
import type { EnglishContentBank } from '../content/englishContentTypes';
import { getTodayEnglishContext, isTopicAvailable } from '../content/todayEnglish';
import { getActiveEnglishContent, setActiveEnglishContent } from '../content/englishContentStore';
import { parseEnglishContent } from '../content/englishContentValidation';
import { fetchEnglishContentFromSheet, isGoogleSheetUrl } from './englishContentSheet';

export type EnglishContentVersion = {
  version: string;
  updatedAt: string;
};

export type EnglishContentCheckStatus = 'updated' | 'current' | 'fallback' | 'skipped';

export type EnglishContentCheckResult = EnglishContentVersion & {
  status: EnglishContentCheckStatus;
  errors?: string[];
};

const DEFAULT_CONTENT_PATH = 'content/english-content.json';
const CONTENT_CHECK_STORAGE_KEY = 'lingua-english-content-check';
/** Automatic checks run once per local day; Refresh bypasses this. */
export const CONTENT_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
const CONTENT_FETCH_TIMEOUT_MS = 8_000;
/** Guards against unexpectedly large or malicious responses. */
const MAX_CONTENT_LENGTH = 2 * 1024 * 1024;
const CACHED_CONTENT_KEY = 'lingua-english-content-cache';

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

function checkedToday(now: number): boolean {
  const last = readLastCheck();
  if (!last) return false;
  const lastDate = new Date(last);
  const current = new Date(now);
  return lastDate.getFullYear() === current.getFullYear()
    && lastDate.getMonth() === current.getMonth()
    && lastDate.getDate() === current.getDate();
}

function resultFor(status: EnglishContentCheckStatus, errors?: string[]): EnglishContentCheckResult {
  const active = getActiveEnglishContent();
  return { status, version: active.version, updatedAt: active.updatedAt, errors };
}

/**
 * Fetches the JSON content bank and activates it when its version changes.
 * Any network, parsing, or validation failure keeps the bundled/current bank.
 */
export async function checkEnglishContentApi(
  options: { force?: boolean } = {},
): Promise<EnglishContentCheckResult> {
  const now = Date.now();
  if (options.force) {
    try {
      localStorage.removeItem(CONTENT_CHECK_STORAGE_KEY);
      localStorage.removeItem(CACHED_CONTENT_KEY);
    } catch { /* ignore */ }
  } else if (checkedToday(now)) {
    return resultFor('skipped');
  }
  markChecked(now);

  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), CONTENT_FETCH_TIMEOUT_MS);
  try {
    const url = contentUrl();
    let content: EnglishContentBank | null = null;
    let errors: string[] = [];

    if (isGoogleSheetUrl(url)) {
      const result = await fetchEnglishContentFromSheet(url, controller.signal);
      content = result.content;
      errors = result.errors;
    } else {
      const response = await fetch(withCacheBuster(url), {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!response.ok) return resultFor('fallback', [`Không tải được file JSON (HTTP ${response.status}).`]);

      const text = await response.text();
      if (text.length > MAX_CONTENT_LENGTH) return resultFor('fallback', [`File JSON quá lớn (>${MAX_CONTENT_LENGTH} bytes).`]);

      let payload: unknown;
      try {
        payload = JSON.parse(text);
      } catch {
        return resultFor('fallback', [`File JSON không hợp lệ (lỗi cú pháp).`]);
      }
      const result = parseEnglishContent(payload, "File JSON");
      content = result.content;
      errors = result.errors;
    }

    if (!content) return resultFor('fallback', errors.length > 0 ? errors : ['Dữ liệu không hợp lệ.']);
    if (!setActiveEnglishContent(content, options.force)) return resultFor('current');
    return { status: 'updated', version: content.version, updatedAt: content.updatedAt, errors: [] };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi không xác định.";
    return resultFor('fallback', [`Lỗi mạng: ${msg}`]);
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
