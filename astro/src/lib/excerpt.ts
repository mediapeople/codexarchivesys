const ELLIPSIS = '…';

function normalizeNewlines(value: string): string {
  return value.replace(/\r\n?/g, '\n');
}

function stripFencedCodeBlocks(value: string): string {
  const lines = normalizeNewlines(value).split('\n');
  const kept: string[] = [];
  let activeFence: '```' | '~~~' | null = null;

  for (const line of lines) {
    const trimmed = line.trimStart();

    if (!activeFence) {
      if (trimmed.startsWith('```')) {
        activeFence = '```';
        continue;
      }

      if (trimmed.startsWith('~~~')) {
        activeFence = '~~~';
        continue;
      }

      kept.push(line);
      continue;
    }

    if (trimmed.startsWith(activeFence)) {
      activeFence = null;
    }
  }

  return kept.join('\n');
}

function stripMarkdownSyntax(value: string): string {
  return value
    .replace(/!\[\[[^\]]+\]\]/g, ' ')
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/u, '')
    .replace(/^\s*>\s?/u, '')
    .replace(/^\s*[-*+]\s+/u, '')
    .replace(/^\s*\d+\.\s+/u, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripLeadingDecoration(value: string): string {
  return value.replace(/^[^\p{L}\p{N}]+/gu, '').trim();
}

function stripTrailingDecoration(value: string): string {
  return value.replace(/[^\p{L}\p{N}\p{M}.?!,:;'"”’)\]]+$/gu, '').trim();
}

function normalizeComparableText(value: string): string {
  return stripMarkdownSyntax(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .toLowerCase();
}

function isMostlyUppercase(value: string): boolean {
  const letters = value.match(/[A-Za-z]/g) || [];
  if (letters.length === 0) {
    return false;
  }

  const uppercaseLetters = letters.filter((char) => char === char.toUpperCase()).length;
  return uppercaseLetters / letters.length >= 0.72;
}

function isDividerLine(value: string): boolean {
  return /^(\s*[-*_]\s*){3,}$/.test(value.trim());
}

function isNoisySectionLabel(rawLine: string, plainText: string): boolean {
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  return /^\s{0,3}#{1,6}\s+/u.test(rawLine) && wordCount <= 5 && isMostlyUppercase(plainText);
}

function trimToLength(value: string, max: number): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= max) {
    return normalized;
  }

  const clipped = normalized
    .slice(0, max)
    .replace(/\s+\S*$/, '')
    .replace(/[.?!,:;]+$/, '')
    .trim();

  return `${clipped}${ELLIPSIS}`;
}

function appendExcerptLine(current: string, next: string): string {
  if (!current) {
    return next;
  }

  const separator = /[.!?…:;]["'”’)\]]*$/.test(current) ? ' ' : '. ';
  return `${current}${separator}${next}`;
}

function buildLeadingTitleRegex(title: string): RegExp | null {
  const titleParts = normalizeComparableText(title)
    .split(' ')
    .filter(Boolean)
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (titleParts.length === 0) {
    return null;
  }

  return new RegExp(
    `^[^\\p{L}\\p{N}]*${titleParts.join('[^\\p{L}\\p{N}]+')}(?:[^\\p{L}\\p{N}]+)?`,
    'iu'
  );
}

function cleanProvidedExcerpt(title: string, excerpt: string, max: number): string {
  let cleaned = excerpt.replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    return '';
  }

  cleaned = stripLeadingDecoration(cleaned);
  const titlePattern = buildLeadingTitleRegex(title);
  if (titlePattern) {
    cleaned = cleaned.replace(titlePattern, '').trim();
  }

  cleaned = stripLeadingDecoration(cleaned);
  cleaned = stripTrailingDecoration(cleaned);

  return cleaned ? trimToLength(cleaned, max) : '';
}

export function deriveExcerptFromMarkdown(title: string, body: string, max = 220): string {
  const titleComparable = normalizeComparableText(title);
  const sourceLines = stripFencedCodeBlocks(body).split('\n');
  const seen = new Set<string>();
  let excerpt = '';
  let sawContent = false;

  for (const rawLine of sourceLines) {
    if (!rawLine.trim() || isDividerLine(rawLine)) {
      continue;
    }

    let plainText = stripMarkdownSyntax(rawLine);
    if (!plainText) {
      continue;
    }

    plainText = stripTrailingDecoration(stripLeadingDecoration(plainText));
    if (!plainText) {
      continue;
    }

    const comparable = normalizeComparableText(plainText);
    if (!comparable) {
      continue;
    }

    if (!sawContent && comparable === titleComparable) {
      continue;
    }

    if (isNoisySectionLabel(rawLine, plainText)) {
      continue;
    }

    if (seen.has(comparable)) {
      continue;
    }

    seen.add(comparable);
    const nextExcerpt = appendExcerptLine(excerpt, plainText);
    if (nextExcerpt.length > max) {
      return trimToLength(nextExcerpt, max);
    }

    excerpt = nextExcerpt;
    sawContent = true;
  }

  return excerpt;
}

export function resolveExcerpt({
  title,
  excerpt,
  body,
  max = 220,
}: {
  title: string;
  excerpt?: string;
  body?: string;
  max?: number;
}): string {
  const provided = typeof excerpt === 'string' ? excerpt.trim() : '';
  const cleanedProvided = provided ? cleanProvidedExcerpt(title, provided, max) : '';
  const derived = typeof body === 'string' && body.trim() ? deriveExcerptFromMarkdown(title, body, max) : '';
  const titleComparable = normalizeComparableText(title);
  const providedComparable = normalizeComparableText(provided);

  const preferDerived =
    Boolean(derived) &&
    (
      !cleanedProvided ||
      providedComparable.startsWith(titleComparable) ||
      /^[#>*_`~\s\-–—|•·✦✧◆◇◈○●▪▸▹►➤➜➢➣⬩]/u.test(provided) ||
      (/(?:\.\.\.|…)$/.test(cleanedProvided) && derived.length > cleanedProvided.length + 12)
    );

  if (preferDerived) {
    return derived;
  }

  return cleanedProvided || derived;
}

export function bodyStartsWithDuplicateTitleHeading(title: string, body: string): boolean {
  const titleComparable = normalizeComparableText(title);
  const sourceLines = stripFencedCodeBlocks(body).split('\n');

  for (const rawLine of sourceLines) {
    if (!rawLine.trim() || isDividerLine(rawLine)) {
      continue;
    }

    if (!/^\s{0,3}#{1,6}\s+/u.test(rawLine)) {
      return false;
    }

    const headingText = stripTrailingDecoration(stripLeadingDecoration(stripMarkdownSyntax(rawLine)));
    return normalizeComparableText(headingText) === titleComparable;
  }

  return false;
}
