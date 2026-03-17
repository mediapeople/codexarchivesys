export const AXIS_SCALE_VALUES = ['micro', 'meso', 'macro'] as const;
export const AXIS_DEPTH_VALUES = ['surface', 'structural', 'recursive'] as const;
export const AXIS_FOCUS_VALUES = ['moment', 'character', 'system', 'witness'] as const;
export const AXIS_FUNCTION_VALUES = ['diagnostic', 'therapeutic', 'revelatory', 'comparative'] as const;

export type AxisScale = (typeof AXIS_SCALE_VALUES)[number];
export type AxisDepth = (typeof AXIS_DEPTH_VALUES)[number];
export type AxisFocus = (typeof AXIS_FOCUS_VALUES)[number];
export type AxisFunction = (typeof AXIS_FUNCTION_VALUES)[number];

export type ArchiveAxes = {
  scale?: AxisScale;
  depth?: AxisDepth;
  focus?: AxisFocus;
  function?: AxisFunction;
};

type AxisField = keyof ArchiveAxes;

type AxisScoreMap<T extends string> = Map<T, number>;

type AxisCue<T extends string> = {
  pattern: RegExp;
  weights: Partial<Record<T, number>>;
};

type AxisKeywordConfig = {
  scale: AxisCue<AxisScale>[];
  depth: AxisCue<AxisDepth>[];
  focus: AxisCue<AxisFocus>[];
  function: AxisCue<AxisFunction>[];
};

const SCALE_SET = new Set<string>(AXIS_SCALE_VALUES);
const DEPTH_SET = new Set<string>(AXIS_DEPTH_VALUES);
const FOCUS_SET = new Set<string>(AXIS_FOCUS_VALUES);
const FUNCTION_SET = new Set<string>(AXIS_FUNCTION_VALUES);

const SCALE_LABELS: Record<AxisScale, string> = {
  micro: 'Micro',
  meso: 'Meso',
  macro: 'Macro',
};

const DEPTH_LABELS: Record<AxisDepth, string> = {
  surface: 'Surface',
  structural: 'Structural',
  recursive: 'Recursive',
};

const FOCUS_LABELS: Record<AxisFocus, string> = {
  moment: 'Moment',
  character: 'Character',
  system: 'System',
  witness: 'Witness',
};

const FUNCTION_LABELS: Record<AxisFunction, string> = {
  diagnostic: 'Diagnostic',
  therapeutic: 'Therapeutic',
  revelatory: 'Revelatory',
  comparative: 'Comparative',
};

const SCALE_TIE_BREAK: AxisScale[] = ['micro', 'meso', 'macro'];
const DEPTH_TIE_BREAK: AxisDepth[] = ['surface', 'structural', 'recursive'];
const FOCUS_TIE_BREAK: AxisFocus[] = ['moment', 'character', 'system', 'witness'];
const FUNCTION_TIE_BREAK: AxisFunction[] = ['diagnostic', 'therapeutic', 'revelatory', 'comparative'];

const AXIS_KEYWORDS: AxisKeywordConfig = {
  scale: [
    {
      pattern:
        /\b(moment|breath|glance|touch|gesture|elevator|room|bench|table|hand|line|sentence|today|tonight|morning|afternoon|evening)\b/g,
      weights: { micro: 0.55 },
    },
    {
      pattern:
        /\b(pattern|practice|project|routine|cycle|phase|week|month|relationship|terrain|field|studio|archive|workflow|process)\b/g,
      weights: { meso: 0.55 },
    },
    {
      pattern:
        /\b(society|culture|history|civilization|collective|nation|economy|institution|governance|public|world|cosmos)\b/g,
      weights: { macro: 0.7 },
    },
  ],
  depth: [
    {
      pattern:
        /\b(saw|heard|noticed|looked|felt|found|observed|recorded|captured|status|condition|today|report)\b/g,
      weights: { surface: 0.55 },
    },
    {
      pattern:
        /\b(structure|system|pattern|framework|mechanism|model|schema|architecture|rule|doctrine|infrastructure|workflow|network|classification|contract)\b/g,
      weights: { structural: 0.65 },
    },
    {
      pattern:
        /\b(recursive|recursion|witness|observer|awareness|mirror|loop|feedback|reflection|threshold|consciousness|meta)\b/g,
      weights: { recursive: 0.75 },
    },
  ],
  focus: [
    {
      pattern:
        /\b(scene|moment|when|during|while|suddenly|room|elevator|street|bench|table|bridge|morning|night)\b/g,
      weights: { moment: 0.6 },
    },
    {
      pattern:
        /\b(mother|father|child|friend|operator|citizen|worker|guide|listener|parent|person|people|character)\b/g,
      weights: { character: 0.6 },
    },
    {
      pattern:
        /\b(system|archive|network|process|institution|workflow|schema|infrastructure|machine|publishing|protocol|classification|governance|interface)\b/g,
      weights: { system: 0.7 },
    },
    {
      pattern:
        /\b(witness|awareness|observer|breath|attention|presence|seeing|perception|consciousness)\b/g,
      weights: { witness: 0.75 },
    },
  ],
  function: [
    {
      pattern:
        /\b(issue|constraint|condition|status|problem|bug|failure|diagnos|pressure|signal|observation|report)\b/g,
      weights: { diagnostic: 0.7 },
    },
    {
      pattern:
        /\b(heal|healing|repair|steady|steadiness|calm|comfort|care|maintain|maintenance|continue|survive|soothe|integrat)\b/g,
      weights: { therapeutic: 0.75 },
    },
    {
      pattern:
        /\b(reveal|revealed|realize|realized|learned|discovered|showed|showing|unlocked|clarified|became clear)\b/g,
      weights: { revelatory: 0.8 },
    },
    {
      pattern:
        /\b(vs\.?|versus|unlike|compare|comparison|contrast|between|alongside)\b/g,
      weights: { comparative: 0.8 },
    },
  ],
};

type ObjectTypeKey =
  | 'signal'
  | 'fragment'
  | 'fieldlog'
  | 'artifact'
  | 'scroll'
  | 'codex'
  | 'loremap'
  | 'nexus';

type AxisPrior = {
  scale?: Partial<Record<AxisScale, number>>;
  depth?: Partial<Record<AxisDepth, number>>;
  focus?: Partial<Record<AxisFocus, number>>;
  function?: Partial<Record<AxisFunction, number>>;
};

const OBJECT_TYPE_PRIORS: Partial<Record<ObjectTypeKey, AxisPrior>> = {
  signal: {
    scale: { micro: 2.1, meso: 0.3 },
    depth: { surface: 0.9, recursive: 0.4 },
    focus: { moment: 1.0, system: 0.5 },
    function: { revelatory: 1.2, diagnostic: 1.0 },
  },
  fragment: {
    scale: { micro: 2.2 },
    depth: { recursive: 1.1, surface: 0.4 },
    focus: { witness: 1.0, moment: 0.8 },
    function: { revelatory: 1.0, therapeutic: 0.4 },
  },
  fieldlog: {
    scale: { meso: 1.8, micro: 0.5 },
    depth: { surface: 1.5, structural: 1.2 },
    focus: { system: 1.4, moment: 0.8 },
    function: { diagnostic: 2.0 },
  },
  artifact: {
    scale: { meso: 1.2, micro: 0.8 },
    depth: { surface: 1.2, structural: 1.0 },
    focus: { system: 0.9, moment: 0.8 },
    function: { revelatory: 0.8, diagnostic: 0.8, comparative: 0.5 },
  },
  scroll: {
    scale: { meso: 1.3, micro: 0.6, macro: 0.4 },
    depth: { structural: 1.0, recursive: 0.8 },
    focus: { system: 0.8, moment: 0.8, character: 0.7, witness: 0.4 },
    function: { revelatory: 1.2, therapeutic: 0.8, diagnostic: 0.6 },
  },
  codex: {
    scale: { meso: 1.2, macro: 1.0 },
    depth: { structural: 2.1, recursive: 0.4 },
    focus: { system: 2.1 },
    function: { diagnostic: 1.2, revelatory: 1.0, comparative: 0.4 },
  },
  loremap: {
    scale: { meso: 1.7, macro: 0.6 },
    depth: { structural: 1.3, surface: 1.0 },
    focus: { system: 1.2, moment: 0.4 },
    function: { diagnostic: 1.0, revelatory: 0.8, comparative: 0.4 },
  },
  nexus: {
    scale: { meso: 1.5, macro: 0.7 },
    depth: { structural: 1.5 },
    focus: { system: 1.9 },
    function: { comparative: 1.5, revelatory: 0.8, diagnostic: 0.5 },
  },
};

function normalizeKeywordValue(value: unknown, allowed: Set<string>) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  return allowed.has(normalized) ? normalized : undefined;
}

export function normalizeAxisScale(value: unknown): AxisScale | undefined {
  return normalizeKeywordValue(value, SCALE_SET) as AxisScale | undefined;
}

export function normalizeAxisDepth(value: unknown): AxisDepth | undefined {
  return normalizeKeywordValue(value, DEPTH_SET) as AxisDepth | undefined;
}

export function normalizeAxisFocus(value: unknown): AxisFocus | undefined {
  return normalizeKeywordValue(value, FOCUS_SET) as AxisFocus | undefined;
}

export function normalizeAxisFunction(value: unknown): AxisFunction | undefined {
  return normalizeKeywordValue(value, FUNCTION_SET) as AxisFunction | undefined;
}

export function readAxes(data: Record<string, unknown>): ArchiveAxes {
  return {
    scale: normalizeAxisScale(data.scale),
    depth: normalizeAxisDepth(data.depth),
    focus: normalizeAxisFocus(data.focus),
    function: normalizeAxisFunction(data.function),
  };
}

export function hasAxes(axes: ArchiveAxes): boolean {
  return Boolean(axes.scale || axes.depth || axes.focus || axes.function);
}

export function formatAxisValue(field: AxisField, value: string): string {
  switch (field) {
    case 'scale':
      return SCALE_LABELS[value as AxisScale] || value;
    case 'depth':
      return DEPTH_LABELS[value as AxisDepth] || value;
    case 'focus':
      return FOCUS_LABELS[value as AxisFocus] || value;
    case 'function':
      return FUNCTION_LABELS[value as AxisFunction] || value;
    default:
      return value;
  }
}

export function listAxes(axes: ArchiveAxes) {
  const ordered: AxisField[] = ['scale', 'depth', 'focus', 'function'];

  return ordered.flatMap((field) => {
    const value = axes[field];
    if (!value) {
      return [];
    }

    return [
      {
        field,
        label: field === 'function' ? 'Function' : field.charAt(0).toUpperCase() + field.slice(1),
        value,
        displayValue: formatAxisValue(field, value),
      },
    ];
  });
}

function plainTextFromMarkdown(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/[#*_~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function createScoreMap<T extends string>(values: readonly T[]): AxisScoreMap<T> {
  return new Map(values.map((value) => [value, 0]));
}

function bumpScores<T extends string>(
  scores: AxisScoreMap<T>,
  weights: Partial<Record<T, number>>,
  multiplier = 1
) {
  for (const [value, rawWeight] of Object.entries(weights) as Array<[T, number]>) {
    scores.set(value, (scores.get(value) || 0) + rawWeight * multiplier);
  }
}

function countMatches(pattern: RegExp, source: string): number {
  const matches = source.match(pattern);
  return matches ? matches.length : 0;
}

function scoreFromKeywords<T extends string>(
  scores: AxisScoreMap<T>,
  cues: AxisCue<T>[],
  source: string
) {
  for (const cue of cues) {
    const matches = countMatches(cue.pattern, source);
    if (matches > 0) {
      bumpScores(scores, cue.weights, matches);
    }
  }
}

function pickTopValue<T extends string>(
  scores: AxisScoreMap<T>,
  fallback: T,
  tieBreak: readonly T[]
): T {
  const ranked = [...scores.entries()]
    .map(([value, score]) => ({ value, score }))
    .sort((left, right) => {
      if (left.score === right.score) {
        return tieBreak.indexOf(left.value) - tieBreak.indexOf(right.value);
      }
      return right.score - left.score;
    });

  const best = ranked[0];
  return best && best.score > 0 ? best.value : fallback;
}

function normalizeObjectType(value: unknown): ObjectTypeKey | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (
    normalized === 'signal' ||
    normalized === 'fragment' ||
    normalized === 'fieldlog' ||
    normalized === 'artifact' ||
    normalized === 'scroll' ||
    normalized === 'codex' ||
    normalized === 'loremap' ||
    normalized === 'nexus'
  ) {
    return normalized;
  }

  return undefined;
}

export function inferAxes({
  objectType,
  title = '',
  body = '',
  existing = {},
}: {
  objectType?: string;
  title?: string;
  body?: string;
  existing?: ArchiveAxes;
}): Required<ArchiveAxes> {
  const normalizedType = normalizeObjectType(objectType);
  const source = `${title}\n${body}`.toLowerCase();
  const plain = plainTextFromMarkdown(source);
  const wordCount = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
  const headingCount = (body.match(/^\s{0,3}#{1,6}\s+/gm) || []).length;
  const firstPersonCount = countMatches(/\b(i|me|my|mine)\b/g, plain);

  const scaleScores = createScoreMap(AXIS_SCALE_VALUES);
  const depthScores = createScoreMap(AXIS_DEPTH_VALUES);
  const focusScores = createScoreMap(AXIS_FOCUS_VALUES);
  const functionScores = createScoreMap(AXIS_FUNCTION_VALUES);

  const priors = normalizedType ? OBJECT_TYPE_PRIORS[normalizedType] : undefined;
  if (priors?.scale) {
    bumpScores(scaleScores, priors.scale);
  }
  if (priors?.depth) {
    bumpScores(depthScores, priors.depth);
  }
  if (priors?.focus) {
    bumpScores(focusScores, priors.focus);
  }
  if (priors?.function) {
    bumpScores(functionScores, priors.function);
  }

  scoreFromKeywords(scaleScores, AXIS_KEYWORDS.scale, plain);
  scoreFromKeywords(depthScores, AXIS_KEYWORDS.depth, plain);
  scoreFromKeywords(focusScores, AXIS_KEYWORDS.focus, plain);
  scoreFromKeywords(functionScores, AXIS_KEYWORDS.function, plain);

  if (wordCount > 420 || headingCount > 2) {
    bumpScores(scaleScores, { meso: 0.5, macro: 0.25 });
    bumpScores(depthScores, { structural: 0.3 });
  }

  if (wordCount < 120 && headingCount === 0) {
    bumpScores(scaleScores, { micro: 0.35 });
  }

  if (/\b(what this revealed|it became clear|this revealed|i realized)\b/.test(source)) {
    bumpScores(functionScores, { revelatory: 1.2 });
  }

  if (/\b(versus|vs\.?|compare|comparison|contrast|between|alongside)\b/.test(source)) {
    bumpScores(functionScores, { comparative: 1.0 });
  }

  if (/\b(maintenance|care|repair|steady|steadiness|survive|keep going)\b/.test(source)) {
    bumpScores(functionScores, { therapeutic: 0.9 });
  }

  if (/\b(issue|constraint|bug|condition|status|report)\b/.test(source)) {
    bumpScores(functionScores, { diagnostic: 0.9 });
  }

  if (firstPersonCount >= 4) {
    bumpScores(depthScores, { recursive: 0.4 });
    bumpScores(focusScores, { witness: 0.4 });
  }

  const inferred: Required<ArchiveAxes> = {
    scale: pickTopValue(scaleScores, normalizedType === 'signal' || normalizedType === 'fragment' ? 'micro' : 'meso', SCALE_TIE_BREAK),
    depth: pickTopValue(
      depthScores,
      normalizedType === 'fieldlog' || normalizedType === 'artifact' || normalizedType === 'signal'
        ? 'surface'
        : normalizedType === 'fragment'
          ? 'recursive'
          : 'structural',
      DEPTH_TIE_BREAK
    ),
    focus: pickTopValue(
      focusScores,
      normalizedType === 'codex' || normalizedType === 'nexus' || normalizedType === 'loremap'
        ? 'system'
        : normalizedType === 'fragment'
          ? 'witness'
          : 'moment',
      FOCUS_TIE_BREAK
    ),
    function: pickTopValue(
      functionScores,
      normalizedType === 'fieldlog' || normalizedType === 'codex' || normalizedType === 'loremap'
        ? 'diagnostic'
        : normalizedType === 'nexus'
          ? 'comparative'
          : 'revelatory',
      FUNCTION_TIE_BREAK
    ),
  };

  return {
    scale: existing.scale || inferred.scale,
    depth: existing.depth || inferred.depth,
    focus: existing.focus || inferred.focus,
    function: existing.function || inferred.function,
  };
}
