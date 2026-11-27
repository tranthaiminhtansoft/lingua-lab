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

async function discoverGids(pubhtmlUrl: string, signal: AbortSignal): Promise<{ gids: Record<string, string>; usedFallback: boolean }> {
  const html = await fetchText(pubhtmlUrl, signal);
  if (!html) return { gids: FALLBACK_GIDS, usedFallback: true };
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
  if (Object.keys(gids).length > 0) return { gids, usedFallback: false };
  return { gids: FALLBACK_GIDS, usedFallback: true };
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
  const discovery = await discoverGids(url, signal);
  const { gids, usedFallback } = discovery;
  if (usedFallback) {
    errors.push("⚠️ Không tải được trang Google Sheet (có thể do CORS hoặc link sai). Đang dùng danh sách tab mặc định.");
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

  // Detect completely unreachable sheet
  const fetchedTabs = SHEET_TABS.filter((tab) => tabs[tab] !== null);
  if (fetchedTabs.length === 0) {
    errors.push("❌ Không thể kết nối đến Google Sheet. Vui lòng kiểm tra link Publish-to-web và quyền truy cập.");
    return { content: null, errors };
  }

  // Header validation
  const REQUIRED_HEADERS: Record<SheetTab, string[]> = {
    meta: ['version', 'updatedAt'],
    topics: ['id', 'title', 'description', 'frequency', 'startDate', 'endDate'],
    vocabulary: ['topicId', 'term', 'meaning', 'pronunciation', 'score'],
    grammar: ['topicId', 'title', 'category', 'formula', 'example'],
    quizzes: ['topicId', 'question', 'options', 'answerIndex', 'explanation'],
    dialogue: ['topicId', 'variantIndex', 'sentences'],
  };

  for (const tab of SHEET_TABS) {
    const data = tabs[tab];
    if (!data) continue;
    if (data.length === 0) {
      errors.push(`Tab '${tab}': Tab bị trống (không có dữ liệu).`);
      tabs[tab] = null;
      continue;
    }
    const headers = Object.keys(data[0]);
    let required = REQUIRED_HEADERS[tab];
    if (tab === 'grammar') {
      required = headers.includes('items')
        ? ['topicId', 'items']
        : ['topicId', 'title', 'category', 'formula', 'example'];
    }
    const missing = required.filter((h) => !headers.includes(h));
    if (missing.length > 0) {
      errors.push(`Tab '${tab}': Thiếu cột bắt buộc: ${missing.join(', ')}.`);
      tabs[tab] = null;
    }
  }

  return parseEnglishSheetTabs(tabs, BUNDLED_ENGLISH_CONTENT, errors);
}

export function parseEnglishSheetTabs(
  tabs: Record<SheetTab, Record<string, string>[] | null>,
  bundled: EnglishContentBank = BUNDLED_ENGLISH_CONTENT,
  errors: string[] = [],
): { content: EnglishContentBank | null; errors: string[] } {
  const meta = tabs.meta?.[0];
  const topicRows = tabs.topics;
  if (!meta || !topicRows) {
    if (!meta) errors.push("Tab 'meta' bị trống hoặc không tồn tại.");
    if (!topicRows) errors.push("Tab 'topics' bị trống hoặc không tồn tại.");
    return { content: null, errors };
  }

  const bundledById = new Map(bundled.topics.map((t) => [t.id, t]));
  const grammarHeaders = Object.keys(tabs.grammar?.[0] ?? {});
  const grammarHasUsage = grammarHeaders.includes('usage');
  const grammarHasAlternatives = grammarHeaders.includes('context1');
  const isMultiLineGrammarFormat = grammarHeaders.includes('formula') && grammarHeaders.includes('example') && !grammarHeaders.includes('title');

  const topics: EnglishTopic[] = topicRows.map((row) => {
    const id = row.id?.trim();
    const bundledTopic = id ? bundledById.get(id) : undefined;
    const vocab = (tabs.vocabulary ?? [])
      .filter((v) => v.topicId === id)
      .map((v) => ({
        term: v.term ?? '',
        meaning: v.meaning ?? '',
        pronunciation: v.pronunciation ?? '',
        ...((v.synonyms ?? '').trim() ? { synonyms: v.synonyms } : {}),
        score: toNumber(v.score, 0),
      }));
    const isNewGrammarFormat = grammarHeaders.includes('items');
    const bundledGrammarByTitle = new Map((bundledTopic?.grammar ?? []).map((g) => [g.title, g]));
    let grammar: EnglishTopic['grammar'][number][] = [];
    if (isNewGrammarFormat) {
      const grammarRowsForTopic = (tabs.grammar ?? []).filter((g) => g.topicId === id);
      for (const g of grammarRowsForTopic) {
        const text = g.items ?? '';
        const chunks = text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
        for (const chunk of chunks) {
          const fields = chunk.split(/\s*\|\s*/);
          if (fields.length < 4) {
            errors.push(`Tab 'grammar': Chủ đề '${id}': mục ngữ pháp thiếu trường bắt buộc (title | category | formula | example).`);
            continue;
          }
          const [rawTitle, rawCategory, rawFormula, rawExample, rawPronunciation] = fields;
          const formulaLines = (rawFormula ?? '').split('\n').map((line) => line.trim()).filter(Boolean);
          const formula = formulaLines[0] ?? '';
          let usage: string | undefined;
          for (const line of formulaLines.slice(1)) {
            const match = line.match(/^\((.*)\)$/);
            if (match) usage = match[1].trim();
          }
          const exampleLines = (rawExample ?? '').split('\n').map((line) => line.trim()).filter(Boolean);
          const exampleMain = exampleLines[0] ?? '';
          const exampleTranslation = exampleLines.slice(1).filter((line) => /^\(.*\)$/.test(line)).join(' ');
          const example = exampleTranslation ? `${exampleMain} ${exampleTranslation}` : exampleMain;
          const item: EnglishTopic['grammar'][number] = {
            title: (rawTitle ?? '').trim(),
            category: (rawCategory ?? '').trim(),
            formula,
            example,
          };
          if (rawPronunciation) item.pronunciation = rawPronunciation.trim();
          if (usage) item.usage = usage;
          const bundledItem = bundledGrammarByTitle.get(item.title);
          if (bundledItem) {
            if (!item.usage && bundledItem.usage) item.usage = bundledItem.usage;
            if (!item.alternatives && bundledItem.alternatives) item.alternatives = bundledItem.alternatives;
          }
          grammar.push(item);
        }
      }
    } else if (isMultiLineGrammarFormat) {
      const grammarRowsForTopic = (tabs.grammar ?? []).filter((g) => g.topicId === id);
      for (const g of grammarRowsForTopic) {
        const formulaChunks = (g.formula ?? '').split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
        const exampleChunks = (g.example ?? '').split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
        const pronChunks = (g.pronunciation ?? '').split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
        for (let i = 0; i < formulaChunks.length; i += 1) {
          const formulaLines = formulaChunks[i].split('\n').map((line) => line.trim()).filter(Boolean);
          const formula = formulaLines[0] ?? '';
          let usage: string | undefined;
          for (const line of formulaLines.slice(1)) {
            const match = line.match(/^\((.*)\)$/);
            if (match) usage = match[1].trim();
          }
          const exampleLines = (exampleChunks[i] ?? '').split('\n').map((line) => line.trim()).filter(Boolean);
          const exampleMain = exampleLines[0] ?? '';
          const exampleTranslation = exampleLines.slice(1).filter((line) => /^\(.*\)$/.test(line)).join(' ');
          const example = exampleTranslation ? `${exampleMain} ${exampleTranslation}` : exampleMain;
          const item: EnglishTopic['grammar'][number] = { formula, example };
          if (pronChunks[i]) item.pronunciation = pronChunks[i];
          if (usage) item.usage = usage;
          // fallback by index
          const bundledByIndex = bundledTopic?.grammar?.[i];
          if (bundledByIndex) {
            if (!item.title && bundledByIndex.title) item.title = bundledByIndex.title;
            if (!item.category && bundledByIndex.category) item.category = bundledByIndex.category;
            if (!item.usage && bundledByIndex.usage) item.usage = bundledByIndex.usage;
            if (!item.alternatives && bundledByIndex.alternatives) item.alternatives = bundledByIndex.alternatives;
          }
          grammar.push(item);
        }
      }
    } else {
      grammar = (tabs.grammar ?? [])
        .filter((g) => g.topicId === id)
        .map((g) => {
          const item: EnglishTopic['grammar'][number] = {
            title: g.title ?? '',
            category: g.category ?? '',
            formula: g.formula ?? '',
            example: g.example ?? '',
          };
          if (g.pronunciation) item.pronunciation = g.pronunciation;
          if (grammarHasUsage && g.usage) item.usage = g.usage;
          if (grammarHasAlternatives) {
            item.alternatives = [
              { formula: g.formula ?? '', context: g.context1 ?? '', example: g.example ?? '' },
              { formula: g.formula2 ?? '', context: g.context2 ?? '', example: g.example2 ?? '' },
              { formula: g.formula3 ?? '', context: g.context3 ?? '', example: g.example3 ?? '' },
            ];
          }
          const bundledItem = bundledGrammarByTitle.get(item.title);
          if (bundledItem) {
            if (!item.usage && bundledItem.usage) item.usage = bundledItem.usage;
            if (!item.alternatives && bundledItem.alternatives) item.alternatives = bundledItem.alternatives;
          }
          return item;
        });
    }
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
      vocab: vocab.length > 0 ? vocab : (bundledTopic?.vocab ?? []),
      grammar: grammar.length > 0 ? grammar : (bundledTopic?.grammar ?? []),
      examples: bundledTopic?.examples?.length ? bundledTopic.examples : ['Practice this topic in a short conversation.'],
      quizzes: quizzes.length > 0 ? quizzes : (bundledTopic?.quizzes ?? []),
      readExpected: (row.readExpected ?? '').trim() || bundledTopic?.readExpected || dialogue[0] || 'Practice reading aloud.',
      dialogue: dialogue.length > 0 ? dialogue : (bundledTopic?.dialogue ?? []),
      ...(dialogueVariants.length > 0 ? { dialogueVariants } : bundledTopic?.dialogueVariants ? { dialogueVariants: bundledTopic.dialogueVariants } : {}),
      ...(bundledTopic?.dialogueGuides ? { dialogueGuides: bundledTopic.dialogueGuides } : {}),
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
  return { content: result.content, errors: [...errors] };
}
