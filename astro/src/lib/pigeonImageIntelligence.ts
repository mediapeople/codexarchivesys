import exifr from 'exifr';
import sharp from 'sharp';
import { classifyMediaShape, type MediaShape } from './mediaAsset.ts';

export type PigeonMediaCaptureGeo = {
  latitude: number;
  longitude: number;
  altitude?: number;
};

export type PigeonMediaCapture = {
  width?: number;
  height?: number;
  shape?: MediaShape;
  format?: string;
  originalFilename?: string;
  uploadedAt?: string;
  capturedAt?: string;
  camera?: string;
  geo?: PigeonMediaCaptureGeo;
};

export type PigeonVisionMediaSuggestion = {
  index: number;
  src: string;
  originalFilename?: string;
  alt?: string;
  caption?: string;
};

export type PigeonVisionAxesSuggestion = {
  scale?: 'micro' | 'meso' | 'macro';
  depth?: 'surface' | 'structural' | 'recursive';
  focus?: 'moment' | 'character' | 'system' | 'witness';
  function?: 'diagnostic' | 'therapeutic' | 'revelatory' | 'comparative';
};

export type PigeonVisionSuggestion = {
  source: 'openai';
  model: string;
  generatedAt: string;
  summary?: string;
  artifactType?: string;
  location?: string;
  tags: string[];
  axes?: PigeonVisionAxesSuggestion;
  media: PigeonVisionMediaSuggestion[];
};

type VisionImageInput = {
  index: number;
  src: string;
  originalFilename?: string;
  buffer: Buffer;
  contentType: string;
};

type VisionSuggestionDraft = {
  summary?: string;
  artifactType?: string;
  location?: string;
  tags?: string[];
  axes?: Record<string, unknown>;
  media?: Array<Record<string, unknown>>;
};

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_VISION_MODEL = 'gpt-4.1-mini';
const MAX_VISION_IMAGES = 3;
const VISION_TIMEOUT_MS = 8_000;
const SCALE_VALUES = new Set(['micro', 'meso', 'macro']);
const DEPTH_VALUES = new Set(['surface', 'structural', 'recursive']);
const FOCUS_VALUES = new Set(['moment', 'character', 'system', 'witness']);
const FUNCTION_VALUES = new Set(['diagnostic', 'therapeutic', 'revelatory', 'comparative']);

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((item) => normalizeString(item)).filter(Boolean) as string[])];
}

function normalizeFiniteNumber(value: unknown, digits = 6): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined;
  }

  return Number(value.toFixed(digits));
}

function normalizeDateString(value: unknown): string | undefined {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return undefined;
  }

  return value.toISOString();
}

function combineCameraLabel(make: unknown, model: unknown): string | undefined {
  const normalizedMake = normalizeString(make);
  const normalizedModel = normalizeString(model);

  if (normalizedMake && normalizedModel) {
    const modelLower = normalizedModel.toLowerCase();
    const makeLower = normalizedMake.toLowerCase();
    return modelLower.startsWith(makeLower)
      ? normalizedModel
      : `${normalizedMake} ${normalizedModel}`;
  }

  return normalizedMake || normalizedModel;
}

function normalizeImageFormat(value: string | undefined, contentType: string): string | undefined {
  const normalizedValue = normalizeString(value)?.toLowerCase();
  if (normalizedValue) {
    return normalizedValue === 'jpeg' ? 'jpg' : normalizedValue;
  }

  const subtype = contentType.split('/')[1]?.trim().toLowerCase();
  if (!subtype) {
    return undefined;
  }

  return subtype === 'jpeg' ? 'jpg' : subtype === 'svg+xml' ? 'svg' : subtype;
}

function omitUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}

function normalizeAxisValue<T extends string>(value: unknown, allowed: Set<T>): T | undefined {
  const normalized = normalizeString(value)?.toLowerCase() as T | undefined;
  return normalized && allowed.has(normalized) ? normalized : undefined;
}

function extractJsonPayload(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return '';
  }

  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  if (unfenced.startsWith('{') && unfenced.endsWith('}')) {
    return unfenced;
  }

  const start = unfenced.indexOf('{');
  const end = unfenced.lastIndexOf('}');
  return start >= 0 && end > start ? unfenced.slice(start, end + 1) : unfenced;
}

function normalizeVisionSuggestion(
  draft: VisionSuggestionDraft,
  images: VisionImageInput[],
  model: string
): PigeonVisionSuggestion | null {
  const mediaSuggestions = Array.isArray(draft.media)
    ? draft.media
        .map((item) => {
          const indexValue = typeof item.index === 'number' ? Math.trunc(item.index) : NaN;
          if (!Number.isFinite(indexValue) || indexValue < 1 || indexValue > images.length) {
            return null;
          }

          const image = images[indexValue - 1];
          return omitUndefined({
            index: image.index,
            src: image.src,
            originalFilename: image.originalFilename,
            alt: normalizeString(item.alt),
            caption: normalizeString(item.caption),
          });
        })
        .filter((item): item is PigeonVisionMediaSuggestion => Boolean(item))
    : [];

  const axesDraft = draft.axes && typeof draft.axes === 'object' ? draft.axes : null;
  const axes = axesDraft
    ? omitUndefined({
        scale: normalizeAxisValue(axesDraft.scale, SCALE_VALUES),
        depth: normalizeAxisValue(axesDraft.depth, DEPTH_VALUES),
        focus: normalizeAxisValue(axesDraft.focus, FOCUS_VALUES),
        function: normalizeAxisValue(axesDraft.function, FUNCTION_VALUES),
      })
    : undefined;

  const suggestion = omitUndefined({
    source: 'openai' as const,
    model,
    generatedAt: new Date().toISOString(),
    summary: normalizeString(draft.summary),
    artifactType: normalizeString(draft.artifactType),
    location: normalizeString(draft.location),
    tags: normalizeStringArray(draft.tags).slice(0, 8),
    axes: axes && Object.keys(axes).length > 0 ? axes : undefined,
    media: mediaSuggestions,
  });

  const hasPayload =
    Boolean(suggestion.summary) ||
    Boolean(suggestion.artifactType) ||
    Boolean(suggestion.location) ||
    suggestion.tags.length > 0 ||
    (suggestion.axes && Object.keys(suggestion.axes).length > 0) ||
    suggestion.media.length > 0;

  return hasPayload ? suggestion : null;
}

function buildVisionPrompt(params: {
  objectType: string;
  title: string;
  body: string;
  imageCount: number;
}): string {
  const titleLine = normalizeString(params.title) ? `Current title: ${params.title}\n` : '';
  const bodyLine = normalizeString(params.body)
    ? `Authored body context:\n${params.body.trim().slice(0, 1200)}\n`
    : 'Authored body context: none\n';

  return [
    'You are generating provisional metadata suggestions for an archive object built from uploaded image files.',
    'Treat these as suggestions only, not canonical truth.',
    `Object type: ${params.objectType}`,
    titleLine.trimEnd(),
    bodyLine.trimEnd(),
    `Image count: ${params.imageCount}`,
    'Return JSON only with this exact shape:',
    '{',
    '  "summary": string | null,',
    '  "artifactType": string | null,',
    '  "location": string | null,',
    '  "tags": string[],',
    '  "axes": {',
    '    "scale": "micro" | "meso" | "macro" | null,',
    '    "depth": "surface" | "structural" | "recursive" | null,',
    '    "focus": "moment" | "character" | "system" | "witness" | null,',
    '    "function": "diagnostic" | "therapeutic" | "revelatory" | "comparative" | null',
    '  },',
    '  "media": [',
    '    { "index": 1, "alt": string | null, "caption": string | null }',
    '  ]',
    '}',
    'Rules:',
    '- Prefer null instead of guessing.',
    '- Keep summary to one sentence and under 160 characters.',
    '- Keep artifactType short and lowercase, like "photograph", "document", or "screenshot".',
    '- Tags should be short, lowercase, and specific to visible content.',
    '- Use only the allowed axis enum values or null.',
    '- Write alt text and captions only for the supplied images and keep them factual.',
  ]
    .filter(Boolean)
    .join('\n');
}

async function toVisionDataUrl(buffer: Buffer): Promise<string> {
  const optimized = await sharp(buffer)
    .rotate()
    .resize({
      width: 1600,
      height: 1600,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 82,
      mozjpeg: true,
    })
    .toBuffer();

  return `data:image/jpeg;base64,${optimized.toString('base64')}`;
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return await Promise.race([
    promise.finally(() => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }),
    new Promise<T>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(`Timed out after ${ms}ms.`)), ms);
    }),
  ]);
}

export async function extractUploadedImageCapture(params: {
  buffer: Buffer;
  contentType: string;
  originalFilename: string;
  uploadedAt?: string;
}): Promise<PigeonMediaCapture | undefined> {
  const [metadata, exifData] = await Promise.all([
    sharp(params.buffer).metadata(),
    exifr.parse(params.buffer, [
      'DateTimeOriginal',
      'CreateDate',
      'Make',
      'Model',
      'latitude',
      'longitude',
      'altitude',
    ]).catch(() => null),
  ]);

  const width = typeof metadata.width === 'number' ? metadata.width : undefined;
  const height = typeof metadata.height === 'number' ? metadata.height : undefined;
  const capture = omitUndefined({
    width,
    height,
    shape: width && height ? classifyMediaShape(width, height) : undefined,
    format: normalizeImageFormat(metadata.format, params.contentType),
    originalFilename: normalizeString(params.originalFilename),
    uploadedAt: normalizeString(params.uploadedAt),
    capturedAt: normalizeDateString(exifData?.DateTimeOriginal ?? exifData?.CreateDate),
    camera: combineCameraLabel(exifData?.Make, exifData?.Model),
    geo:
      normalizeFiniteNumber(exifData?.latitude) !== undefined &&
      normalizeFiniteNumber(exifData?.longitude) !== undefined
        ? omitUndefined({
            latitude: normalizeFiniteNumber(exifData?.latitude)!,
            longitude: normalizeFiniteNumber(exifData?.longitude)!,
            altitude: normalizeFiniteNumber(exifData?.altitude, 2),
          })
        : undefined,
  });

  return Object.keys(capture).length > 0 ? capture : undefined;
}

export async function inferPigeonVisionSuggestion(params: {
  objectType: string;
  title: string;
  body: string;
  images: VisionImageInput[];
}): Promise<PigeonVisionSuggestion | null> {
  const apiKey = normalizeString(process.env.OPENAI_API_KEY);
  if (!apiKey || params.images.length === 0) {
    return null;
  }

  const model = normalizeString(process.env.PIGEON_VISION_MODEL) || DEFAULT_VISION_MODEL;
  const images = params.images.slice(0, MAX_VISION_IMAGES);
  const prompt = buildVisionPrompt({
    objectType: params.objectType,
    title: params.title,
    body: params.body,
    imageCount: images.length,
  });

  const content = [
    { type: 'input_text', text: prompt },
    ...(await Promise.all(
      images.map(async (image) => ({
        type: 'input_image' as const,
        image_url: await toVisionDataUrl(image.buffer),
      }))
    )),
  ];

  const request = fetch(OPENAI_RESPONSES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'user',
          content,
        },
      ],
      max_output_tokens: 900,
    }),
  });

  const response = await withTimeout(request, VISION_TIMEOUT_MS);
  const payload = (await response.json().catch(() => null)) as
    | {
        output_text?: string;
        error?: { message?: string };
      }
    | null;

  if (!response.ok) {
    const detail = normalizeString(payload?.error?.message) || `OpenAI responded with ${response.status}.`;
    throw new Error(detail);
  }

  const outputText = normalizeString(payload?.output_text);
  if (!outputText) {
    return null;
  }

  const jsonPayload = extractJsonPayload(outputText);
  if (!jsonPayload) {
    return null;
  }

  try {
    const parsed = JSON.parse(jsonPayload) as VisionSuggestionDraft;
    return normalizeVisionSuggestion(parsed, images, model);
  } catch {
    return null;
  }
}
