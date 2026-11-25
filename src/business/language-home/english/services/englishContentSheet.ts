import type { EnglishContentBank, EnglishTopic } from '../content/englishContentTypes';
import { BUNDLED_ENGLISH_CONTENT } from '../content/englishContentStore';
import { parseEnglishContent } from '../content/englishContentValidation';

const SHEET_TABS = ['meta', 'topics', 'vocabulary', 'grammar', 'quizzes', 'dialogue'] as const;
type SheetTab = (typeof SHEET_TABS)[number];

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 1; }
        else inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      field = '';
      if (row.some((c) => c.length > 0)) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.some((c) => c.length > 0)) rows.push(row);
  return rows;
}

function rowsToObjects(rows: string[][]): Record<string, string>[] {
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = (r[i] ?? '').trim(); });
    return obj;
  });
}

export function isGoogleSheetUrl(url: string): boolean {
  return /docs\.google\.com\/spreadsheets\/d\/e\//.test(url);
}

function sheetCsvUrl(base: string, gid: string): string {
  const match = base.match(/(https:\/\/docs\.google\.com\/spreadsheets\/d\/e\/[^/]+)/);
  const root = match ? match[1] : base.replace(/\/pubhtml.*$/, '').replace(/\/pub.*$/, '');
  return `${root}/pub?output=csv&gid=${gid}`;
}

async function fetchText(url: string, signal: AbortSignal): Promise<string | null> {
  try {
    const res = await fetch(url, { cache: 'no-store', signal });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

const FALLBACK_GIDS: Record<string, string> = {
  meta: '337341217',
  topics: '202384027',
  vocabulary: '93934149',
  grammar: '915515135',
  quizzes: '1070773186',
  dialogue: '139617548',
};

async function discoverGids(pubhtmlUrl: string, signal: AbortSignal): Promise<Record<string, string> | null> {
  const html = await fetchText(pubhtmlUrl, signal);
  if (!html) return FALLBACK_GIDS;
  const gids: Record<string, string> = {};
  const re = /name:\s*"([^"]+)"[^}]*?gid=(\d+)|gid=(\d+)[^}]*?name:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const name = (m[1] || m[4] || '').trim();
    const gid = (m[2] || m[3] || '').trim();
    if (name && gid) gids[name] = gid;
  }
  if (Object.keys(gids).length === 0) {
    const names = [...html.matchAll(/name:\s*"([^"]+)"/g)].map((x) => x[1]);
    const gidMatches = [...html.matchAll(/gid=(\d+)/g)].map((x) => x[1]);
    for (let i = 0; i < names.length && i < gidMatches.length; i += 1) gids[names[i]] = gidMatches[i];
  }
  return Object.keys(gids).length > 0 ? gids : FALLBACK_GIDS;
}

function toNumber(value: string, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export async function fetchEnglishContentFromSheet(
  url: string,
  signal: AbortSignal,
): Promise<{ content: EnglishContentBank | null; errors: string[] }> {
  const errors: string[] = [];
  const gids = await discoverGids(url, signal);
  if (!gids) {
    errors.push("Không tìm thấy các tab (meta, topics, vocabulary, grammar, quizzes, dialogue) trong Google Sheet. Vui lòng kiểm tra link Publish-to-web.");
    return { content: null, errors };
  }

  const tabEntries = await Promise.all(SHEET_TABS.map(async (tab) => {
    const gid = gids[tab];
    if (!gid) {
      errors.push(`Tab '${tab}' không tồn tại trong Google Sheet.`);
      return [tab, null] as const;
    }
    const text = await fetchText(sheetCsvUrl(url, gid), signal);
    if (!text) {
      errors.push(`Tab '${tab}': Không tải được dữ liệu (lỗi mạng hoặc quyền truy cập).`);
      return [tab, null] as const;
    }
    return [tab, rowsToObjects(parseCsv(text))] as const;
  }));

  const tabs = Object.fromEntries(tabEntries) as Record<SheetTab, Record<string, string>[] | null>;
  const meta = tabs.meta?.[0];
  const topicRows = tabs.topics;
  if (!meta || !topicRows) {
    if (!meta) errors.push("Tab 'meta' bị trống hoặc không tồn tại.");
    if (!topicRows) errors.push("Tab 'topics' bị trống hoặc không tồn tại.");
    return { content: null, errors };
  }

  const bundledById = new Map(BUNDLED_ENGLISH_CONTENT.topics.map((t) => [t.id, t]));

  const topics: EnglishTopic[] = topicRows.map((row) => {
    const id = row.id?.trim();
    const bundled = id ? bundledById.get(id) : undefined;
    const vocab = (tabs.vocabulary ?? [])
      .filter((v) => v.topicId === id)
      .map((v) => ({
        term: v.term ?? '',
        meaning: v.meaning ?? '',
        pronunciation: v.pronunciation ?? '',
        score: toNumber(v.score, 0),
      }));
    const grammar = (tabs.grammar ?? [])
      .filter((g) => g.topicId === id)
      .map((g) => {
        const item: EnglishTopic['grammar'][number] = {
          title: g.title ?? '',
          category: g.category ?? '',
          formula: g.formula ?? '',
          example: g.example ?? '',
        };
        if (g.pronunciation) item.pronunciation = g.pronunciation;
        return item;
      });
    const quizzes = (tabs.quizzes ?? [])
      .filter((q) => q.topicId === id)
      .map((q) => ({
        question: q.question ?? '',
        options: (q.options ?? '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean),
        answerIndex: toNumber(q.answerIndex, 0),
        explanation: q.explanation ?? '',
      }));
    const dialogueRows = (tabs.dialogue ?? []).filter((d) => d.topicId === id);
    const sortedDialogue = [...dialogueRows].sort((a, b) => toNumber(a.variantIndex, 0) - toNumber(b.variantIndex, 0));
    const mainDialogueRow = sortedDialogue.find((d) => toNumber(d.variantIndex, 0) === 0) ?? sortedDialogue[0];
    const dialogue = (mainDialogueRow?.sentences ?? '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    const dialogueVariants = sortedDialogue
      .filter((d) => d !== mainDialogueRow)
      .map((d) => (d.sentences ?? '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean))
      .filter((arr) => arr.length > 0);

    const themeValue = (row.theme ?? row.rotationGroup ?? '').trim();
    const timeLimitRaw = (row.timeLimit ?? '').trim();
    const endDate = (row.endDate ?? 'none').trim() || 'none';

    const topic: EnglishTopic = {
      id: id ?? '',
      title: row.title ?? '',
      description: row.description ?? '',
      startDate: row.startDate ?? '',
      endDate,
      frequency: (row.frequency ?? 'daily') as EnglishTopic['frequency'],
      ...(timeLimitRaw ? { timeLimit: toNumber(timeLimitRaw, 0) } : {}),
      ...(themeValue ? { theme: themeValue as EnglishTopic['theme'] } : {}),
      vocab: vocab.length > 0 ? vocab : (bundled?.vocab ?? []),
      grammar: grammar.length > 0 ? grammar : (bundled?.grammar ?? []),
      examples: bundled?.examples?.length ? bundled.examples : ['Practice this topic in a short conversation.'],
      quizzes: quizzes.length > 0 ? quizzes : (bundled?.quizzes ?? []),
      readExpected: (row.readExpected ?? '').trim() || bundled?.readExpected || dialogue[0] || 'Practice reading aloud.',
      dialogue: dialogue.length > 0 ? dialogue : (bundled?.dialogue ?? []),
      ...(dialogueVariants.length > 0 ? { dialogueVariants } : bundled?.dialogueVariants ? { dialogueVariants: bundled.dialogueVariants } : {}),
      ...(bundled?.dialogueGuides ? { dialogueGuides: bundled.dialogueGuides } : {}),
    };
    return topic;
  });

  const bank = {
    version: (meta.version ?? '').trim(),
    updatedAt: (meta.updatedAt ?? '').trim(),
    topics,
  };

  const result = parseEnglishContent(bank, "Google Sheet");
  if (!result.content) {
    return { content: null, errors: [...errors, ...result.errors] };
  }
  return { content: result.content, errors: [] };
}
