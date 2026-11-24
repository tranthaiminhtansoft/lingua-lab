import { mkdir, readFile, writeFile } from 'node:fs/promises';

const sourceUrl = new URL(
  '../src/business/language-home/english/content/englishContent.json',
  import.meta.url,
);
const outputDirectory = new URL('../content-source/english/', import.meta.url);

const bank = JSON.parse(await readFile(sourceUrl, 'utf8'));

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(headers, rows) {
  const lines = [headers.map(csvEscape).join(',')];
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(','));
  }
  return `\uFEFF${lines.join('\r\n')}\r\n`;
}

await mkdir(outputDirectory, { recursive: true });

const topicRows = bank.topics.map((topic) => ({
  id: topic.id,
  title: topic.title,
  description: topic.description,
  frequency: topic.frequency,
  startDate: topic.startDate,
  endDate: topic.endDate,
  timeLimit: topic.timeLimit ?? '',
  theme: topic.theme ?? '',
  examples: topic.examples.join(' | '),
  readExpected: topic.readExpected,
}));

await writeFile(
  new URL('topics.csv', outputDirectory),
  toCsv(['id', 'title', 'description', 'frequency', 'startDate', 'endDate', 'timeLimit', 'theme', 'examples', 'readExpected'], topicRows),
);

const vocabRows = [];
for (const topic of bank.topics) {
  for (const item of topic.vocab) {
    vocabRows.push({
      topicId: topic.id,
      term: item.term,
      meaning: item.meaning,
      pronunciation: item.pronunciation,
      score: item.score,
    });
  }
}
await writeFile(
  new URL('vocabulary.csv', outputDirectory),
  toCsv(['topicId', 'term', 'meaning', 'pronunciation', 'score'], vocabRows),
);

const grammarRows = [];
for (const topic of bank.topics) {
  for (const item of topic.grammar) {
    grammarRows.push({
      topicId: topic.id,
      title: item.title,
      category: item.category,
      formula: item.formula,
      example: item.example,
      pronunciation: item.pronunciation ?? '',
    });
  }
}
await writeFile(
  new URL('grammar.csv', outputDirectory),
  toCsv(['topicId', 'title', 'category', 'formula', 'example', 'pronunciation'], grammarRows),
);

const quizRows = [];
for (const topic of bank.topics) {
  for (const quiz of topic.quizzes) {
    quizRows.push({
      topicId: topic.id,
      question: quiz.question,
      options: quiz.options.join('\n'),
      answerIndex: quiz.answerIndex,
      explanation: quiz.explanation,
    });
  }
}
await writeFile(
  new URL('quizzes.csv', outputDirectory),
  toCsv(['topicId', 'question', 'options', 'answerIndex', 'explanation'], quizRows),
);

const dialogueRows = [];
for (const topic of bank.topics) {
  dialogueRows.push({ topicId: topic.id, variantIndex: 0, sentences: topic.dialogue.join('\n') });
  (topic.dialogueVariants ?? []).forEach((variant, variantOffset) => {
    dialogueRows.push({ topicId: topic.id, variantIndex: variantOffset + 1, sentences: variant.join('\n') });
  });
}
await writeFile(
  new URL('dialogue.csv', outputDirectory),
  toCsv(['topicId', 'variantIndex', 'sentences'], dialogueRows),
);

const guideRows = [];
for (const topic of bank.topics) {
  for (const [message, guide] of Object.entries(topic.dialogueGuides ?? {})) {
    guideRows.push({
      topicId: topic.id,
      message,
      pronunciation: guide.pronunciation,
      meaning: guide.meaning,
    });
  }
}
await writeFile(
  new URL('dialogue-guides.csv', outputDirectory),
  toCsv(['topicId', 'message', 'pronunciation', 'meaning'], guideRows),
);

await writeFile(
  new URL('meta.csv', outputDirectory),
  toCsv(['version', 'updatedAt'], [{ version: bank.version, updatedAt: bank.updatedAt }]),
);

console.log(`Exported ${bank.topics.length} topics to ${outputDirectory.pathname}`);
console.log('Files: topics.csv, vocabulary.csv, grammar.csv, quizzes.csv, dialogue.csv, dialogue-guides.csv, meta.csv');