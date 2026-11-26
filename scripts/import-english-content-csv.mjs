import { mkdir, readFile, writeFile } from 'node:fs/promises';

const sourceDirectory = new URL('../content-source/english/', import.meta.url);
const outputUrl = new URL(
  '../src/business/language-home/english/content/englishContent.json',
  import.meta.url,
);

function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += char;
      i += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (char === ',') {
      row.push(field);
      field = '';
      i += 1;
      continue;
    }
    if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i += 1;
      continue;
    }
    if (char === '\r') {
      i += 1;
      continue;
    }
    field += char;
    i += 1;
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  if (rows.length > 0 && rows[rows.length - 1].every((value) => value === '')) {
    rows.pop();
  }
  return rows;
}

async function readCsv(name, { optional = false } = {}) {
  let text;
  try {
    text = await readFile(new URL(name, sourceDirectory), 'utf8');
  } catch (error) {
    if (optional && error.code === 'ENOENT') return [];
    throw error;
  }
  const rows = parseCsv(text);
  const [header, ...body] = rows;
  return body
    .filter((row) => row.some((value) => value.trim() !== ''))
    .map((row) => Object.fromEntries(header.map((key, index) => [key.trim(), (row[index] ?? '').trim()])));
}

function toBoolean(value) {
  if (value === '') return undefined;
  return value.toUpperCase() === 'TRUE';
}

function toNumber(value) {
  if (value === '') return undefined;
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`Invalid number: ${value}`);
  return number;
}

const metaRows = await readCsv('meta.csv');
if (metaRows.length !== 1) throw new Error('meta.csv must contain exactly one row.');
const { version, updatedAt } = metaRows[0];
if (!version || !updatedAt) throw new Error('meta.csv must contain version and updatedAt.');

const topicRows = await readCsv('topics.csv');
const vocabRows = await readCsv('vocabulary.csv');
const grammarRows = await readCsv('grammar.csv');
const grammarCsvIsNewFormat = grammarRows.length > 0 && Object.prototype.hasOwnProperty.call(grammarRows[0], 'items');
const grammarCsvIsMultiLineFormat = grammarRows.length > 0 && !grammarCsvIsNewFormat && Object.prototype.hasOwnProperty.call(grammarRows[0], 'formula') && Object.prototype.hasOwnProperty.call(grammarRows[0], 'example') && !Object.prototype.hasOwnProperty.call(grammarRows[0], 'title');

let existingBank = null;
try {
  existingBank = JSON.parse(await readFile(new URL('../src/business/language-home/english/content/englishContent.json', import.meta.url), 'utf8'));
} catch {}
const existingGrammarByTitle = new Map();
for (const topic of existingBank?.topics ?? []) {
  for (const grammarItem of topic.grammar ?? []) {
    existingGrammarByTitle.set(`${topic.id}::${grammarItem.title}`, grammarItem);
  }
}
const quizRows = await readCsv('quizzes.csv');
const dialogueRows = await readCsv('dialogue.csv');
const guideRows = await readCsv('dialogue-guides.csv', { optional: true });

const topics = topicRows.map((row) => {
  const id = row.id;
  if (!id) throw new Error('A topic is missing its id.');
  const vocab = vocabRows
    .filter((item) => item.topicId === id)
    .map((item) => ({
      term: item.term,
      meaning: item.meaning,
      pronunciation: item.pronunciation,
      score: item.score === '' ? 0 : Number(item.score),
    }));
  const grammar = grammarRows
    .filter((item) => item.topicId === id)
    .flatMap((item, rowIndex) => {
      if (grammarCsvIsNewFormat) {
        const text = item.items ?? '';
        const chunks = text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
        return chunks.map((chunk, chunkIndex) => {
          const fields = chunk.split(/\s*\|\s*/);
          if (fields.length < 4) {
            throw new Error(`grammar.csv: chủ đề '${id}', mục #${chunkIndex + 1}: thiếu trường bắt buộc (title | category | formula | example).`);
          }
          const [rawTitle, rawCategory, rawFormula, rawExample, rawPronunciation] = fields;
          const formulaLines = rawFormula.split('\n').map((line) => line.trim()).filter(Boolean);
          const formula = formulaLines[0] ?? '';
          let usage;
          for (const line of formulaLines.slice(1)) {
            const match = line.match(/^\\((.*)\\)$/);
            if (match) usage = match[1].trim();
          }
          const exampleLines = rawExample.split('\n').map((line) => line.trim()).filter(Boolean);
          const exampleMain = exampleLines[0] ?? '';
          const exampleTranslation = exampleLines.slice(1).filter((line) => /^\(.*\)$/.test(line)).join(' ');
          const example = exampleTranslation ? `${exampleMain} ${exampleTranslation}` : exampleMain;
          const result = {
            title: (rawTitle ?? '').trim(),
            category: (rawCategory ?? '').trim(),
            formula,
            example,
            ...(rawPronunciation ? { pronunciation: rawPronunciation.trim() } : {}),
            ...(usage ? { usage } : {}),
          };
          const existing = existingGrammarByTitle.get(`${id}::${result.title}`);
          if (existing) {
            if (!result.usage && existing.usage) result.usage = existing.usage;
            if (!result.alternatives && existing.alternatives) result.alternatives = existing.alternatives;
          }
          return result;
        });
      } else if (grammarCsvIsMultiLineFormat) {
        const formulaChunks = (item.formula ?? '').split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
        const exampleChunks = (item.example ?? '').split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
        const pronChunks = (item.pronunciation ?? '').split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
        const existingTopicGrammar = existingBank?.topics?.find((t) => t.id === id)?.grammar ?? [];
        return formulaChunks.map((chunk, chunkIndex) => {
          const formulaLines = chunk.split('\n').map((line) => line.trim()).filter(Boolean);
          const formula = formulaLines[0] ?? '';
          let usage;
          for (const line of formulaLines.slice(1)) {
            const match = line.match(/^\((.*)\)$/);
            if (match) usage = match[1].trim();
          }
          const exampleLines = (exampleChunks[chunkIndex] ?? '').split('\n').map((line) => line.trim()).filter(Boolean);
          const exampleMain = exampleLines[0] ?? '';
          const exampleTranslation = exampleLines.slice(1).filter((line) => /^\(.*\)$/.test(line)).join(' ');
          const example = exampleTranslation ? `${exampleMain} ${exampleTranslation}` : exampleMain;
          const existing = existingTopicGrammar[chunkIndex];
          const result = {
            formula,
            example,
            ...(pronChunks[chunkIndex] ? { pronunciation: pronChunks[chunkIndex] } : {}),
            ...(usage ? { usage } : {}),
            ...(!usage && existing?.usage ? { usage: existing.usage } : {}),
            ...(existing?.title ? { title: existing.title } : {}),
            ...(existing?.category ? { category: existing.category } : {}),
            ...(existing?.alternatives ? { alternatives: existing.alternatives } : {}),
          };
          return result;
        });
      } else {
        const hasAlternatives = ['context1', 'formula2', 'context2', 'example2', 'formula3', 'context3', 'example3']
          .some((column) => item[column] !== undefined);
      const result = {
        title: item.title,
        category: item.category,
        formula: item.formula,
        example: item.example,
        ...(item.pronunciation ? { pronunciation: item.pronunciation } : {}),
        ...(item.usage ? { usage: item.usage } : {}),
        ...(hasAlternatives
          ? {
              alternatives: [
                { formula: item.formula, context: item.context1 ?? '', example: item.example },
                { formula: item.formula2 ?? '', context: item.context2 ?? '', example: item.example2 ?? '' },
                { formula: item.formula3 ?? '', context: item.context3 ?? '', example: item.example3 ?? '' },
              ],
            }
          : {}),
      };
      const existing = existingGrammarByTitle.get(`${id}::${result.title}`);
      if (existing) {
        if (!result.usage && existing.usage) result.usage = existing.usage;
        if (!result.alternatives && existing.alternatives) result.alternatives = existing.alternatives;
      }
      return result;
      }
    });
  const quizzes = quizRows
    .filter((item) => item.topicId === id)
    .map((item) => ({
      question: item.question,
      options: (item.options.includes('\n') ? item.options.split(/\r?\n/) : item.options.split(' | ')).map((value) => value.trim()).filter(Boolean),
      answerIndex: Number(item.answerIndex),
      explanation: item.explanation,
    }));
  const splitSentences = (value) => value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  const topicDialogueRows = dialogueRows.filter((item) => item.topicId === id);
  const isNewFormat = topicDialogueRows.some((item) => item.sentences !== undefined);
  let mainDialogue = [];
  let variants = [];
  if (isNewFormat) {
    const sorted = topicDialogueRows.sort((a, b) => Number(a.variantIndex) - Number(b.variantIndex));
    const mainRow = sorted.find((item) => item.variantIndex === '0');
    mainDialogue = mainRow ? splitSentences(mainRow.sentences ?? '') : [];
    variants = sorted
      .filter((item) => item.variantIndex !== '0')
      .map((item) => splitSentences(item.sentences ?? ''));
  } else {
    mainDialogue = topicDialogueRows
      .filter((item) => item.variantIndex === '0')
      .sort((a, b) => Number(a.sentenceIndex) - Number(b.sentenceIndex))
      .map((item) => item.sentence);
    variants = [...new Set(topicDialogueRows.filter((item) => item.variantIndex !== '0').map((item) => item.variantIndex))]
      .sort((a, b) => Number(a) - Number(b))
      .map((variant) => topicDialogueRows
        .filter((item) => item.variantIndex === variant)
        .sort((a, b) => Number(a.sentenceIndex) - Number(b.sentenceIndex))
        .map((item) => item.sentence));
  }
  const guides = Object.fromEntries(
    guideRows
      .filter((item) => item.topicId === id)
      .map((item) => [item.message, { pronunciation: item.pronunciation, meaning: item.meaning }]),
  );

  const timeLimit = toNumber(row.timeLimit);
  const VALID_THEMES = ['devops', 'neighbor', 'meals', 'weekend'];
  const rawTheme = row.theme || row.rotationGroup || '';
  const theme = VALID_THEMES.includes(rawTheme) ? rawTheme : '';
  const stripTranslation = (value) => value.replace(/\s*\([^)]*\)\s*$/, '').trim();
  const examples = row.examples
    ? row.examples.split(' | ').map((value) => value.trim()).filter(Boolean)
    : grammar.slice(0, 2).map((item) => stripTranslation(item.example)).filter(Boolean);
  const readExpected = row.readExpected
    || stripTranslation(grammar[0]?.example ?? '')
    || stripTranslation(mainDialogue[0] ?? '')
    || 'Practice reading aloud.';

  return {
    id,
    title: row.title,
    description: row.description,
    frequency: row.frequency,
    startDate: row.startDate,
    endDate: row.endDate,
    ...(timeLimit === undefined ? {} : { timeLimit }),
    ...(theme ? { theme } : {}),
    vocab,
    grammar,
    examples,
    quizzes,
    readExpected,
    dialogue: mainDialogue,
    ...(variants.length ? { dialogueVariants: variants } : {}),
    ...(Object.keys(guides).length ? { dialogueGuides: guides } : {}),
  };
});

const bank = { version, updatedAt, topics };
await mkdir(new URL('../src/business/language-home/english/content/', import.meta.url), { recursive: true });
await writeFile(outputUrl, `${JSON.stringify(bank, null, 2)}\n`);
console.log(`Imported ${topics.length} topics from CSV into englishContent.json (version ${version}).`);