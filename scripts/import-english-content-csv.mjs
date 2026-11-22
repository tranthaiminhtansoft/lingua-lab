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

async function readCsv(name) {
  const text = await readFile(new URL(name, sourceDirectory), 'utf8');
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
const quizRows = await readCsv('quizzes.csv');
const dialogueRows = await readCsv('dialogue.csv');
const guideRows = await readCsv('dialogue-guides.csv');

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
    .map((item) => ({
      title: item.title,
      category: item.category,
      formula: item.formula,
      example: item.example,
      ...(item.pronunciation ? { pronunciation: item.pronunciation } : {}),
    }));
  const quizzes = quizRows
    .filter((item) => item.topicId === id)
    .map((item) => ({
      question: item.question,
      options: item.options.split(' | ').map((value) => value.trim()),
      answerIndex: Number(item.answerIndex),
      explanation: item.explanation,
    }));
  const mainDialogue = dialogueRows
    .filter((item) => item.topicId === id && item.variantIndex === '0')
    .sort((a, b) => Number(a.sentenceIndex) - Number(b.sentenceIndex))
    .map((item) => item.sentence);
  const variants = [...new Set(
    dialogueRows
      .filter((item) => item.topicId === id && item.variantIndex !== '0')
      .map((item) => item.variantIndex),
  )]
    .sort((a, b) => Number(a) - Number(b))
    .map((variant) => dialogueRows
      .filter((item) => item.topicId === id && item.variantIndex === variant)
      .sort((a, b) => Number(a.sentenceIndex) - Number(b.sentenceIndex))
      .map((item) => item.sentence));
  const guides = Object.fromEntries(
    guideRows
      .filter((item) => item.topicId === id)
      .map((item) => [item.message, { pronunciation: item.pronunciation, meaning: item.meaning }]),
  );

  const daily = toBoolean(row.daily);
  const mondayOnly = toBoolean(row.mondayOnly);
  const timeLimit = toNumber(row.timeLimit);

  return {
    id,
    title: row.title,
    description: row.description,
    availableFrom: row.availableFrom,
    ...(daily === undefined ? {} : { daily }),
    ...(mondayOnly === undefined ? {} : { mondayOnly }),
    ...(timeLimit === undefined ? {} : { timeLimit }),
    ...(row.theme ? { theme: row.theme } : {}),
    vocab,
    grammar,
    examples: row.examples ? row.examples.split(' | ').map((value) => value.trim()).filter(Boolean) : [],
    quizzes,
    readExpected: row.readExpected,
    dialogue: mainDialogue,
    ...(variants.length ? { dialogueVariants: variants } : {}),
    ...(Object.keys(guides).length ? { dialogueGuides: guides } : {}),
  };
});

// examples are not authored in CSV yet; keep empty array to satisfy schema.

const bank = { version, updatedAt, topics };
await mkdir(new URL('../src/business/language-home/english/content/', import.meta.url), { recursive: true });
await writeFile(outputUrl, `${JSON.stringify(bank, null, 2)}\n`);
console.log(`Imported ${topics.length} topics from CSV into englishContent.json (version ${version}).`);