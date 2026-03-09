import fs from 'node:fs';
import path from 'node:path';

export const ALLOWED_TYPES = new Set([
  'scroll',
  'artifact',
  'fieldlog',
  'codex',
  'fragment',
  'nexus',
  'signal',
]);

export const ALLOWED_STATUS = new Set([
  'draft',
  'review',
  'published',
  'archived',
]);

export const ALLOWED_VISIBILITY = new Set([
  'public',
  'private',
  'internal',
  'unlisted',
]);

export const ACTIVE_THEMES = new Set([
  'signal',
  'memory',
  'pressure',
  'maintenance',
  'survival',
  'structure',
  'crystallization',
  'transmission',
  'observation',
  'place',
  'morning',
  'systems',
  'architecture',
  'methodology',
  'collage',
  'comics',
]);

function walkMarkdownFiles(rootDir) {
  if (!fs.existsSync(rootDir)) {
    return [];
  }

  const files = [];

  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }

  walk(rootDir);
  files.sort();
  return files;
}

function unquote(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseInlineArray(value) {
  const inner = value.slice(1, -1).trim();
  if (!inner) {
    return [];
  }
  return inner.split(',').map((part) => unquote(part)).filter(Boolean);
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed === '[]') {
    return [];
  }
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return parseInlineArray(trimmed);
  }
  if (trimmed === 'true') {
    return true;
  }
  if (trimmed === 'false') {
    return false;
  }
  if (/^-?\d+$/.test(trimmed)) {
    return Number(trimmed);
  }
  return unquote(trimmed);
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (value === undefined || value === null) {
    return [];
  }
  if (typeof value === 'string') {
    const v = value.trim();
    if (!v || v === '[]') {
      return [];
    }
    if (v.includes(',')) {
      return v.split(',').map((item) => item.trim()).filter(Boolean);
    }
    return [v];
  }
  return [];
}

function parseFrontmatter(raw) {
  const lines = raw.split(/\r?\n/);
  const fields = {};
  const errors = [];

  if (lines[0]?.trim() !== '---') {
    return {
      fields,
      errors: ['missing opening frontmatter delimiter'],
      frontmatterText: '',
    };
  }

  let i = 1;
  let closeIndex = -1;
  let activeArrayKey = null;
  const fmLines = [];

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '---') {
      closeIndex = i;
      break;
    }

    fmLines.push(line);

    if (activeArrayKey && /^\s*-\s+/.test(line)) {
      const item = line.replace(/^\s*-\s+/, '').trim();
      fields[activeArrayKey].push(parseScalar(item));
      i += 1;
      continue;
    }

    if (activeArrayKey && /^\s+\w[\w-]*:\s+/.test(line)) {
      i += 1;
      continue;
    }

    const keyMatch = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (keyMatch) {
      const key = keyMatch[1];
      const rest = keyMatch[2];
      if (rest === '') {
        fields[key] = [];
        activeArrayKey = key;
      } else {
        fields[key] = parseScalar(rest);
        activeArrayKey = null;
      }
      i += 1;
      continue;
    }

    if (line.trim() === '') {
      i += 1;
      continue;
    }

    activeArrayKey = null;
    i += 1;
  }

  if (closeIndex === -1) {
    errors.push('missing closing frontmatter delimiter');
  }

  return { fields, errors, frontmatterText: fmLines.join('\n') };
}

function extractIncludedRefs(frontmatterText) {
  const refs = [];
  const lines = frontmatterText.split(/\r?\n/);
  let inBlock = false;

  for (const line of lines) {
    if (!inBlock) {
      if (/^includedObjects:\s*$/.test(line)) {
        inBlock = true;
      }
      continue;
    }

    if (/^[A-Za-z][\w-]*:\s*/.test(line)) {
      break;
    }

    const dashMatch = line.match(/^\s*-\s*ref:\s*(.+)\s*$/);
    const refMatch = line.match(/^\s*ref:\s*(.+)\s*$/);
    const value = dashMatch?.[1] ?? refMatch?.[1];
    if (value) {
      refs.push(unquote(value));
    }
  }

  return refs;
}

export function loadObjects(rootDir = 'objects') {
  const files = walkMarkdownFiles(rootDir);
  return files.map((file) => loadObjectFile(file));
}

export function loadObjectFile(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const { fields, errors, frontmatterText } = parseFrontmatter(raw);
  return {
    file,
    fields: {
      ...fields,
      themes: normalizeArray(fields.themes),
      constellations: normalizeArray(fields.constellations),
      related: normalizeArray(fields.related),
    },
    includedRefs: extractIncludedRefs(frontmatterText),
    parseErrors: errors,
  };
}

export function validateObjects(objects, options = {}) {
  const findings = [];
  const idToFile = new Map();
  const referenceIdToFile = new Map();
  const referenceObjects = Array.isArray(options.referenceObjects)
    ? options.referenceObjects
    : [];

  for (const obj of referenceObjects) {
    const id = String(obj.fields.id || '').trim();
    if (!id || idToFile.has(id) || referenceIdToFile.has(id)) {
      continue;
    }

    referenceIdToFile.set(id, obj.file);
  }

  for (const obj of objects) {
    for (const parseError of obj.parseErrors) {
      findings.push({
        level: 'ERROR',
        file: obj.file,
        message: `frontmatter parse issue: ${parseError}`,
      });
    }

    for (const key of ['id', 'type', 'title', 'date', 'status']) {
      const value = obj.fields[key];
      if (value === undefined || value === null || String(value).trim() === '') {
        findings.push({
          level: 'ERROR',
          file: obj.file,
          message: `missing required field: ${key}`,
        });
      }
    }

    if (obj.fields.type && !ALLOWED_TYPES.has(String(obj.fields.type))) {
      findings.push({
        level: 'ERROR',
        file: obj.file,
        message: `invalid type: ${obj.fields.type}`,
      });
    }

    if (obj.fields.status && !ALLOWED_STATUS.has(String(obj.fields.status))) {
      findings.push({
        level: 'ERROR',
        file: obj.file,
        message: `invalid status: ${obj.fields.status}`,
      });
    }

    if (
      obj.fields.visibility &&
      !ALLOWED_VISIBILITY.has(String(obj.fields.visibility))
    ) {
      findings.push({
        level: 'ERROR',
        file: obj.file,
        message: `invalid visibility: ${obj.fields.visibility}`,
      });
    }

    for (const theme of obj.fields.themes) {
      if (!ACTIVE_THEMES.has(theme)) {
        findings.push({
          level: 'ERROR',
          file: obj.file,
          message: `theme not in active registry: ${theme}`,
        });
      }
    }

    const id = String(obj.fields.id || '').trim();
    if (id) {
      if (referenceIdToFile.has(id)) {
        findings.push({
          level: 'ERROR',
          file: obj.file,
          message: `duplicate id: ${id} (already exists in ${referenceIdToFile.get(id)})`,
        });
      } else if (idToFile.has(id)) {
        findings.push({
          level: 'ERROR',
          file: obj.file,
          message: `duplicate id: ${id} (also in ${idToFile.get(id)})`,
        });
      } else {
        idToFile.set(id, obj.file);
      }
    }
  }

  for (const obj of objects) {
    const id = String(obj.fields.id || '').trim();
    for (const relatedId of obj.fields.related) {
      const targetExists =
        idToFile.has(relatedId) || referenceIdToFile.has(relatedId);

      if (!targetExists) {
        findings.push({
          level: 'ERROR',
          file: obj.file,
          message: `broken related reference: ${relatedId}`,
        });
      } else if (relatedId === id) {
        findings.push({
          level: 'ERROR',
          file: obj.file,
          message: `self-reference in related: ${relatedId}`,
        });
      }
    }

    if (String(obj.fields.type) === 'nexus') {
      for (const ref of obj.includedRefs) {
        if (!idToFile.has(ref) && !referenceIdToFile.has(ref)) {
          findings.push({
            level: 'ERROR',
            file: obj.file,
            message: `broken nexus includedObjects ref: ${ref}`,
          });
        }
      }
    }
  }

  findings.sort((a, b) => {
    if (a.file === b.file) {
      return a.message.localeCompare(b.message);
    }
    return a.file.localeCompare(b.file);
  });

  const errors = findings.filter((f) => f.level === 'ERROR');
  const warnings = findings.filter((f) => f.level === 'WARN');

  return {
    findings,
    errorCount: errors.length,
    warningCount: warnings.length,
    idSet: new Set(idToFile.keys()),
  };
}
