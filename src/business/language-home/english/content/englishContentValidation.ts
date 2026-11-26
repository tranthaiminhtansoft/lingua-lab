import type {
  EnglishContentBank,
  EnglishFrequency,
  EnglishGrammarAlternative,
  EnglishGrammarItem,
  EnglishQuiz,
  EnglishTheme,
  EnglishTopic,
  EnglishVocabularyItem,
} from './englishContentTypes';

const THEMES: EnglishTheme[] = ['devops', 'neighbor', 'meals', 'weekend'];
const MAX_VERSION_LENGTH = 40;

export type ValidationResult = {
  content: EnglishContentBank | null;
  errors: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function parseArray<T>(value: unknown, parser: (item: unknown, context: string, errors: string[]) => T | null, context: string, errors: string[]): T[] | null {
  if (!Array.isArray(value)) return null;
  const result: T[] = [];
  for (let i = 0; i < value.length; i++) {
    const parsed = parser(value[i], `${context}, mục #${i + 1}`, errors);
    if (parsed === null) return null;
    result.push(parsed);
  }
  return result;
}

function parseStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  if (!value.every(isText)) return null;
  return [...value];
}

function parseVocabularyItem(value: unknown, context: string, errors: string[]): EnglishVocabularyItem | null {
  if (!isRecord(value)) { errors.push(`${context}: Dữ liệu từ vựng không hợp lệ.`); return null; }
  const { term, meaning, pronunciation, score } = value;
  if (!isText(term)) { errors.push(`${context}: Thiếu từ vựng (cột 'term').`); return null; }
  if (!isText(meaning)) { errors.push(`${context}: Thiếu nghĩa (cột 'meaning').`); return null; }
  if (!isText(pronunciation)) { errors.push(`${context}: Thiếu phiên âm (cột 'pronunciation').`); return null; }
  if (typeof score !== 'number' || !Number.isFinite(score)) { errors.push(`${context}: Cột 'score' (điểm) phải là số.`); return null; }
  return { term, meaning, pronunciation, score };
}

function parseGrammarAlternative(value: unknown, context: string, errors: string[]): EnglishGrammarAlternative | null {
  if (!isRecord(value)) { errors.push(`${context}: Dữ liệu công thức thay thế không hợp lệ.`); return null; }
  const { formula, context: usageContext, example } = value;
  if (!isText(formula)) { errors.push(`${context}: Thiếu công thức (cột 'formula').`); return null; }
  if (!isText(usageContext)) { errors.push(`${context}: Thiếu ngữ cảnh sử dụng (cột 'context').`); return null; }
  if (!isText(example)) { errors.push(`${context}: Thiếu câu ví dụ (cột 'example').`); return null; }
  return { formula, context: usageContext, example };
}

function parseGrammarItem(value: unknown, context: string, errors: string[]): EnglishGrammarItem | null {
  if (!isRecord(value)) { errors.push(`${context}: Dữ liệu ngữ pháp không hợp lệ.`); return null; }
  const { title, category, formula, example, pronunciation, usage, alternatives } = value;
  if (title !== undefined && !isText(title)) { errors.push(`${context}: Cột 'title' (tiêu đề) không hợp lệ.`); return null; }
  if (category !== undefined && !isText(category)) { errors.push(`${context}: Cột 'category' (loại) không hợp lệ.`); return null; }
  if (!isText(formula)) { errors.push(`${context}: Thiếu công thức (cột 'formula').`); return null; }
  if (!isText(example)) { errors.push(`${context}: Thiếu ví dụ (cột 'example').`); return null; }
  if (pronunciation !== undefined && !isText(pronunciation)) { errors.push(`${context}: Cột 'pronunciation' (phiên âm) không hợp lệ.`); return null; }
  if (usage !== undefined && !isText(usage)) { errors.push(`${context}: Cột 'usage' (khi nào dùng) không được để trống.`); return null; }

  let parsedAlternatives: EnglishGrammarAlternative[] | undefined;
  if (alternatives !== undefined) {
    if (!Array.isArray(alternatives) || alternatives.length !== 3) {
      errors.push(`${context}: Cột 'alternatives' phải có đúng 3 công thức cùng nghĩa.`);
      return null;
    }
    const parsed = parseArray(alternatives, parseGrammarAlternative, `${context}, công thức thay thế`, errors);
    if (!parsed) return null;
    parsedAlternatives = parsed;
  }

  return {
    title,
    category,
    formula,
    example,
    ...(pronunciation === undefined ? {} : { pronunciation }),
    ...(usage === undefined ? {} : { usage }),
    ...(parsedAlternatives === undefined ? {} : { alternatives: parsedAlternatives }),
  };
}

function parseQuiz(value: unknown, context: string, errors: string[]): EnglishQuiz | null {
  if (!isRecord(value)) { errors.push(`${context}: Dữ liệu câu hỏi không hợp lệ.`); return null; }
  const { question, options, answerIndex, explanation } = value;
  const parsedOptions = parseStringArray(options);
  if (!isText(question)) { errors.push(`${context}: Thiếu câu hỏi (cột 'question').`); return null; }
  if (!parsedOptions || parsedOptions.length < 2) { errors.push(`${context}: Thiếu đáp án (cột 'options', cần ít nhất 2 đáp án, mỗi đáp án 1 dòng).`); return null; }
  if (typeof answerIndex !== 'number' || !Number.isInteger(answerIndex)) { errors.push(`${context}: Cột 'answerIndex' (đáp án đúng) phải là số nguyên (0, 1, 2...).`); return null; }
  if (answerIndex < 0 || answerIndex >= parsedOptions.length) { errors.push(`${context}: Cột 'answerIndex' (đáp án đúng) vượt quá số đáp án.`); return null; }
  if (!isText(explanation)) { errors.push(`${context}: Thiếu giải thích (cột 'explanation').`); return null; }
  return { question, options: parsedOptions, answerIndex, explanation };
}

function parseDialogueGuides(
  value: unknown,
  context: string,
  errors: string[],
): Record<string, { pronunciation: string; meaning: string }> | null {
  if (!isRecord(value)) { errors.push(`${context}: Dữ liệu hướng dẫn hội thoại không hợp lệ.`); return null; }
  const guides: Record<string, { pronunciation: string; meaning: string }> = {};
  for (const [message, guide] of Object.entries(value)) {
    if (!isText(message) || !isRecord(guide)) { errors.push(`${context}: Dữ liệu hướng dẫn không hợp lệ.`); return null; }
    if (!isText(guide.pronunciation) || !isText(guide.meaning)) { errors.push(`${context}: Thiếu phiên âm hoặc nghĩa trong hướng dẫn.`); return null; }
    guides[message] = { pronunciation: guide.pronunciation, meaning: guide.meaning };
  }
  return guides;
}

function parseTopic(value: unknown, context: string, errors: string[]): EnglishTopic | null {
  if (!isRecord(value)) { errors.push(`${context}: Dữ liệu chủ đề không hợp lệ.`); return null; }
  const {
    id,
    title,
    description,
    startDate,
    endDate,
    frequency,
    timeLimit,
    theme,
    vocab,
    grammar,
    examples,
    quizzes,
    readExpected,
    dialogue,
    dialogueVariants,
    dialogueGuides,
  } = value;

  const FREQUENCIES: EnglishFrequency[] = [
    'daily', 'everyWeekend', 'limitedTime',
    'everyMon', 'everyTue', 'everyWed', 'everyThu', 'everyFri', 'everySat', 'everySun',
  ];

  if (!isText(id)) { errors.push(`${context}: Thiếu mã chủ đề (cột 'id').`); return null; }
  if (!isText(title)) { errors.push(`${context} (mã: ${id}): Thiếu tiêu đề (cột 'title').`); return null; }
  if (!isText(description)) { errors.push(`${context} (mã: ${id}): Thiếu mô tả (cột 'description').`); return null; }
  if (!isIsoDate(startDate)) { errors.push(`${context} (mã: ${id}): Cột 'startDate' (ngày bắt đầu) sai định dạng (cần YYYY-MM-DD).`); return null; }
  if (endDate !== 'none' && !isIsoDate(endDate)) { errors.push(`${context} (mã: ${id}): Cột 'endDate' (ngày kết thúc) sai định dạng (cần YYYY-MM-DD hoặc 'none').`); return null; }
  if (!FREQUENCIES.includes(frequency as EnglishFrequency)) { errors.push(`${context} (mã: ${id}): Cột 'frequency' (tần suất) giá trị '${frequency}' không hợp lệ. Chỉ được chọn: ${FREQUENCIES.join(', ')}.`); return null; }
  if (frequency === 'limitedTime') {
    if (endDate === 'none' || (endDate as string) <= (startDate as string)) { errors.push(`${context} (mã: ${id}): Chủ đề 'limitedTime' phải có 'endDate' sau 'startDate'.`); return null; }
  } else {
    if (endDate !== 'none') { errors.push(`${context} (mã: ${id}): Chủ đề không phải 'limitedTime' phải có 'endDate' = 'none'.`); return null; }
  }
  if (!isText(readExpected)) { errors.push(`${context} (mã: ${id}): Thiếu câu mẫu (cột 'readExpected').`); return null; }
  if (timeLimit !== undefined && (typeof timeLimit !== 'number' || !Number.isFinite(timeLimit) || timeLimit < 0)) { errors.push(`${context} (mã: ${id}): Cột 'timeLimit' (thời gian) phải là số >= 0.`); return null; }
  if (theme !== undefined && !THEMES.includes(theme as EnglishTheme)) { errors.push(`${context} (mã: ${id}): Cột 'theme' (chủ đề) giá trị '${theme}' không hợp lệ. Chỉ được chọn: ${THEMES.join(', ')}.`); return null; }

  const parsedVocab = parseArray(vocab, parseVocabularyItem, `${context} (mã: ${id}), từ vựng`, errors);
  const parsedGrammar = parseArray(grammar, parseGrammarItem, `${context} (mã: ${id}), ngữ pháp`, errors);
  const parsedExamples = parseStringArray(examples);
  const parsedQuizzes = parseArray(quizzes, parseQuiz, `${context} (mã: ${id}), câu hỏi`, errors);
  const parsedDialogue = parseStringArray(dialogue);
  if (!parsedVocab || parsedVocab.length === 0) { errors.push(`${context} (mã: ${id}): Thiếu danh sách từ vựng (cột 'vocab').`); return null; }
  if (!parsedGrammar || parsedGrammar.length === 0) { errors.push(`${context} (mã: ${id}): Thiếu danh sách ngữ pháp (cột 'grammar').`); return null; }
  if (!parsedExamples) { errors.push(`${context} (mã: ${id}): Thiếu danh sách ví dụ (cột 'examples').`); return null; }
  if (!parsedQuizzes || parsedQuizzes.length === 0) { errors.push(`${context} (mã: ${id}): Thiếu danh sách câu hỏi (cột 'quizzes').`); return null; }
  if (!parsedDialogue) { errors.push(`${context} (mã: ${id}): Thiếu danh sách hội thoại (cột 'dialogue').`); return null; }

  let parsedVariants: string[][] | undefined;
  if (dialogueVariants !== undefined) {
    const variants = parseArray(dialogueVariants, parseStringArray, `${context} (mã: ${id}), biến thể hội thoại`, errors);
    if (!variants) { errors.push(`${context} (mã: ${id}): Dữ liệu biến thể hội thoại không hợp lệ.`); return null; }
    parsedVariants = variants;
  }

  let parsedGuides: Record<string, { pronunciation: string; meaning: string }> | undefined;
  if (dialogueGuides !== undefined) {
    const guides = parseDialogueGuides(dialogueGuides, `${context} (mã: ${id}), hướng dẫn hội thoại`, errors);
    if (!guides) { errors.push(`${context} (mã: ${id}): Dữ liệu hướng dẫn hội thoại không hợp lệ.`); return null; }
    parsedGuides = guides;
  }

  return {
    id,
    title,
    description,
    startDate: startDate as string,
    endDate: endDate as string,
    frequency: frequency as EnglishFrequency,
    ...(timeLimit === undefined ? {} : { timeLimit: timeLimit as number }),
    ...(theme === undefined ? {} : { theme: theme as EnglishTheme }),
    vocab: parsedVocab,
    grammar: parsedGrammar,
    examples: parsedExamples,
    quizzes: parsedQuizzes,
    readExpected,
    dialogue: parsedDialogue,
    ...(parsedVariants === undefined ? {} : { dialogueVariants: parsedVariants }),
    ...(parsedGuides === undefined ? {} : { dialogueGuides: parsedGuides }),
  };
}

/** Validates and normalises a content bank fetched from JSON or bundled at build time. */
export function parseEnglishContent(value: unknown, baseContext = 'Dữ liệu'): ValidationResult {
  const errors: string[] = [];
  if (!isRecord(value)) {
    errors.push(`${baseContext}: Dữ liệu không phải object hợp lệ.`);
    return { content: null, errors };
  }
  const { version, updatedAt, topics } = value;
  let hasError = false;

  if (!isText(version) || version.length > MAX_VERSION_LENGTH) {
    errors.push(`${baseContext}: Thiếu hoặc sai cột 'version' (chuỗi, tối đa 40 ký tự).`);
    hasError = true;
  }
  if (!isIsoDate(updatedAt)) {
    errors.push(`${baseContext}: Thiếu hoặc sai cột 'updatedAt' (định dạng YYYY-MM-DD).`);
    hasError = true;
  }
  if (!Array.isArray(topics) || topics.length === 0) {
    errors.push(`${baseContext}: Thiếu danh sách 'topics' (phải có ít nhất 1 chủ đề).`);
    return { content: null, errors };
  }

  const parsedTopics: EnglishTopic[] = [];
  const ids = new Set<string>();
  for (let i = 0; i < topics.length; i++) {
    const item = topics[i];
    const ctx = `${baseContext}, chủ đề #${i + 1}`;
    const topic = parseTopic(item, ctx, errors);
    if (topic === null) {
      hasError = true;
    } else if (ids.has(topic.id)) {
      errors.push(`${ctx} (mã: ${topic.id}): Mã chủ đề bị trùng.`);
      hasError = true;
    } else {
      ids.add(topic.id);
      parsedTopics.push(topic);
    }
  }

  if (hasError) return { content: null, errors };
  return { content: { version: version as string, updatedAt: updatedAt as string, topics: parsedTopics }, errors: [] };
}
