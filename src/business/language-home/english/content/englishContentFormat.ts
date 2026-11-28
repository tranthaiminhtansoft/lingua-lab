/** Shared formatting helpers for the English content pipeline. */

export type EnglishQuizType = 'Single Best Answer' | 'Multiple Choice';

/** Remove an option label such as "A. " or "B) " from a quiz option. */
export function stripQuizOptionPrefix(option: string): string {
  return option.replace(/^\s*[A-Fa-f][.)]\s*/, '').trim();
}

/** Render the label shown in front of a quiz option. */
export function formatQuizOptionLabel(index: number): string {
  return `${String.fromCharCode(65 + index)}.`;
}

/**
 * Normalise the free-text `questionType` column to the two supported values.
 * Unknown values fall back to `Single Best Answer` so old rows keep working.
 */
export function normalizeQuizQuestionType(value: string | undefined): EnglishQuizType | undefined {
  const text = (value ?? '').trim();
  if (!text) return undefined;
  if (/multiple/i.test(text)) return 'Multiple Choice';
  return 'Single Best Answer';
}

/**
 * Parse a dialogue cell into messages. A line that only contains a Vietnamese
 * translation in parentheses is appended to the previous English message.
 * This supports both the `sunday-mass` layout (translation on its own line)
 * and the older inline layout (`English. (Vietnamese.)`).
 */
export function parseDialogueLines(text: string): string[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const messages: string[] = [];
  for (const line of lines) {
    if (/^\(.*\)$/.test(line) && messages.length > 0) {
      messages[messages.length - 1] = `${messages[messages.length - 1]} ${line}`;
      continue;
    }
    messages.push(line);
  }
  return messages;
}

/**
 * Split a message into its English text and a trailing Vietnamese translation.
 * Used when exporting back to the sheet so translations stay on their own line.
 */
export function splitDialogueMessage(message: string): { english: string; translation?: string } {
  const match = message.match(/^(.*?)\s*(\([^()]*\))\s*$/);
  if (!match) return { english: message.trim() };
  const english = match[1].trim();
  if (!english) return { english: message.trim() };
  return { english, translation: match[2].trim() };
}
