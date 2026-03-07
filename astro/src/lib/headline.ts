const SMALL_WORDS = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'but',
  'by',
  'for',
  'from',
  'in',
  'into',
  'nor',
  'of',
  'on',
  'or',
  'over',
  'the',
  'to',
  'up',
  'with',
]);

function isMostlyUppercase(value: string): boolean {
  const letters = value.match(/[A-Za-z]/g) || [];
  if (letters.length === 0) {
    return false;
  }
  const uppercaseLetters = letters.filter((char) => char === char.toUpperCase()).length;
  return uppercaseLetters / letters.length >= 0.72;
}

function normalizeWord(word: string, isFirst: boolean, isLast: boolean): string {
  if (!word) {
    return word;
  }

  if (word.includes('-')) {
    const parts = word.split('-');
    return parts
      .map((part, index) =>
        normalizeWord(
          part,
          isFirst && index === 0,
          isLast && index === parts.length - 1
        )
      )
      .join('-');
  }

  if (/^[ivxlcdm]+$/i.test(word)) {
    return word.toUpperCase();
  }

  const lower = word.toLowerCase();
  if (!isFirst && !isLast && SMALL_WORDS.has(lower)) {
    return lower;
  }

  return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
}

function toTitleCase(value: string): string {
  const words = value.match(/[A-Za-z0-9]+(?:['’.-][A-Za-z0-9]+)*/g) || [];
  let index = 0;

  return value.replace(/[A-Za-z0-9]+(?:['’.-][A-Za-z0-9]+)*/g, (word) => {
    const normalized = normalizeWord(word, index === 0, index === words.length - 1);
    index += 1;
    return normalized;
  });
}

export function formatDisplayTitle(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return value;
  }

  if (!isMostlyUppercase(trimmed)) {
    return trimmed;
  }

  return toTitleCase(trimmed);
}
