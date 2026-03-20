import fs from 'node:fs';
import path from 'node:path';

export const ALLOWED_TYPES = new Set([
  'scroll',
  'loremap',
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

const SITE_ORIGIN = 'https://ndcodex.com';

export const ACTIVE_THEMES = new Set([
  'across',
  'aftershock',
  'another',
  'archive',
  'arrived',
  'away',
  'become',
  'built',
  'care',
  'carrier-pigeon',
  'signal',
  'memory',
  'pressure',
  'maintenance',
  'survival',
  'consciousness',
  'consequence',
  'context',
  'continuity',
  'council',
  'counts',
  'does',
  'doors',
  'earth',
  'everything',
  'fragments',
  'frogs',
  'glucose',
  'here',
  'highest',
  'https',
  'infrastructure',
  'ingest',
  'intelligence',
  'justice',
  'keeps',
  'knowing',
  'leave',
  'maybe',
  'metabolism',
  'much',
  'navigation',
  'nfile',
  'once',
  'operator',
  'outside',
  'parked',
  'people',
  'primer',
  'publishing',
  'release',
  'return',
  'ritual',
  'shine',
  'small',
  'structure',
  'swing',
  'taxonomy',
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
  'what',
  'when',
  'witness',
  'work',
]);

const LOW_SIGNAL_DISCOVERY_SLUGS = new Set([
  'across',
  'another',
  'arrived',
  'away',
  'become',
  'built',
  'counts',
  'does',
  'everything',
  'here',
  'http',
  'https',
  'keeps',
  'leave',
  'maybe',
  'much',
  'once',
  'what',
  'when',
  'www',
]);

const URLISH_TERM_RE =
  /^(?:https?:\/\/|www\.|[a-z0-9-]+\.(?:ai|app|co|com|dev|edu|gov|io|me|net|org|tv|us))(?:[/?#].*)?$/i;

export function normalizeObjectRef(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  if (raw.startsWith('codex://object/')) {
    return decodeURIComponent(raw.slice('codex://object/'.length)).trim();
  }

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      const match = url.pathname.match(/^\/(?:objects|codex|nexus)\/([^/]+)\/?$/i);
      return match?.[1] ? decodeURIComponent(match[1]).trim() : raw;
    } catch {
      return raw;
    }
  }

  const relativeMatch = raw.match(/^\/(?:objects|codex|nexus)\/([^/]+)\/?$/i);
  if (relativeMatch?.[1]) {
    return decodeURIComponent(relativeMatch[1]).trim();
  }

  return raw;
}

export function getCanonicalObjectSlug(fields = {}) {
  return normalizeObjectRef(fields.slug) || normalizeObjectRef(fields.id);
}

export function getObjectAliases(fields = {}) {
  const slug = getCanonicalObjectSlug(fields);
  const aliases = new Set();

  [
    fields.id,
    fields.slug,
    fields.url,
    slug ? `codex://object/${slug}` : '',
    slug ? `${SITE_ORIGIN}/objects/${slug}/` : '',
    slug ? `/objects/${slug}` : '',
  ]
    .map((value) => normalizeObjectRef(value))
    .filter(Boolean)
    .forEach((alias) => aliases.add(alias));

  return aliases;
}

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

export function slugifyDiscoveryTerm(term) {
  return String(term || '')
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isLowSignalDiscoveryTerm(value) {
  const normalized = String(value || '').trim().replace(/\s+/g, ' ');
  if (!normalized) {
    return true;
  }

  if (URLISH_TERM_RE.test(normalized)) {
    return true;
  }

  const slug = slugifyDiscoveryTerm(normalized);
  if (!slug || slug.length <= 2) {
    return true;
  }

  return LOW_SIGNAL_DISCOVERY_SLUGS.has(slug);
}

export function sanitizeDiscoveryTerms(values) {
  const seen = new Set();
  const sanitized = [];

  for (const value of values || []) {
    const normalized = String(value || '').trim().replace(/\s+/g, ' ');
    if (!normalized || isLowSignalDiscoveryTerm(normalized)) {
      continue;
    }

    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    sanitized.push(normalized);
  }

  return sanitized;
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

function extractConnections(frontmatterText) {
  const connections = [];
  const lines = frontmatterText.split(/\r?\n/);
  let inBlock = false;
  let current = null;

  function flushCurrent() {
    if (current?.ref && current.role) {
      connections.push({
        ref: current.ref,
        role: current.role,
        display: current.display || 'inline',
      });
    }
    current = null;
  }

  for (const line of lines) {
    if (!inBlock) {
      if (/^connections:\s*$/.test(line)) {
        inBlock = true;
      }
      continue;
    }

    if (/^[A-Za-z][\w-]*:\s*/.test(line)) {
      flushCurrent();
      break;
    }

    const itemRefMatch = line.match(/^\s*-\s*ref:\s*(.+)\s*$/);
    if (itemRefMatch) {
      flushCurrent();
      current = {
        ref: unquote(itemRefMatch[1]),
        role: '',
        display: 'inline',
      };
      continue;
    }

    const refMatch = line.match(/^\s*ref:\s*(.+)\s*$/);
    if (refMatch) {
      if (!current) {
        current = {
          ref: '',
          role: '',
          display: 'inline',
        };
      }
      current.ref = unquote(refMatch[1]);
      continue;
    }

    const roleMatch = line.match(/^\s*role:\s*(.+)\s*$/);
    if (roleMatch && current) {
      current.role = unquote(roleMatch[1]);
      continue;
    }

    const displayMatch = line.match(/^\s*display:\s*(.+)\s*$/);
    if (displayMatch && current) {
      current.display = unquote(displayMatch[1]);
    }
  }

  flushCurrent();
  return connections;
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
      connections: extractConnections(frontmatterText),
    },
    includedRefs: extractIncludedRefs(frontmatterText),
    parseErrors: errors,
  };
}

export function validateObjects(objects, options = {}) {
  const findings = [];
  const idToFile = new Map();
  const aliasToFile = new Map();
  const referenceIdToFile = new Map();
  const referenceAliasToFile = new Map();
  const referenceObjects = Array.isArray(options.referenceObjects)
    ? options.referenceObjects
    : [];

  for (const obj of referenceObjects) {
    const id = String(obj.fields.id || '').trim();
    if (!id || idToFile.has(id) || referenceIdToFile.has(id)) {
      continue;
    }

    referenceIdToFile.set(id, obj.file);
    for (const alias of getObjectAliases(obj.fields)) {
      if (!referenceAliasToFile.has(alias)) {
        referenceAliasToFile.set(alias, obj.file);
      }
    }
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
      } else if (isLowSignalDiscoveryTerm(theme)) {
        findings.push({
          level: 'WARN',
          file: obj.file,
          message: `theme may be too low-signal for public taxonomy: ${theme}`,
        });
      }
    }

    const id = String(obj.fields.id || '').trim();
    const slug = String(obj.fields.slug || '').trim();
    const normalizedSlug = getCanonicalObjectSlug(obj.fields);
    const url = String(obj.fields.url || '').trim();
    const summary = String(obj.fields.summary || '').trim();
    const isPublicSurface =
      String(obj.fields.status) === 'published' &&
      ['public', 'unlisted'].includes(String(obj.fields.visibility || 'public'));
    const expectedSlug = normalizeObjectRef(id);
    const expectedUrl = expectedSlug ? `${SITE_ORIGIN}/objects/${expectedSlug}/` : '';

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

    for (const alias of getObjectAliases(obj.fields)) {
      if (referenceAliasToFile.has(alias)) {
        findings.push({
          level: 'ERROR',
          file: obj.file,
          message: `duplicate object alias: ${alias} (already exists in ${referenceAliasToFile.get(alias)})`,
        });
      } else if (aliasToFile.has(alias) && aliasToFile.get(alias) !== obj.file) {
        findings.push({
          level: 'ERROR',
          file: obj.file,
          message: `duplicate object alias: ${alias} (also in ${aliasToFile.get(alias)})`,
        });
      } else {
        aliasToFile.set(alias, obj.file);
      }
    }

    if (isPublicSurface && !summary) {
      findings.push({
        level: 'ERROR',
        file: obj.file,
        message: 'missing required discovery field: summary',
      });
    }

    if (isPublicSurface && !slug) {
      findings.push({
        level: 'ERROR',
        file: obj.file,
        message: 'missing required discovery field: slug',
      });
    }

    if (isPublicSurface && !url) {
      findings.push({
        level: 'ERROR',
        file: obj.file,
        message: 'missing required discovery field: url',
      });
    }

    if (slug && expectedSlug && normalizedSlug !== expectedSlug) {
      findings.push({
        level: isPublicSurface ? 'ERROR' : 'WARN',
        file: obj.file,
        message: `slug should match id for stable object routing: expected ${expectedSlug}, found ${slug}`,
      });
    }

    if (url && expectedUrl && url !== expectedUrl) {
      findings.push({
        level: isPublicSurface ? 'ERROR' : 'WARN',
        file: obj.file,
        message: `url should match canonical object path: expected ${expectedUrl}, found ${url}`,
      });
    }
  }

  for (const obj of objects) {
    const objectAliases = getObjectAliases(obj.fields);
    for (const relatedId of obj.fields.related) {
      const normalizedRelatedId = normalizeObjectRef(relatedId);
      const targetExists =
        aliasToFile.has(normalizedRelatedId) || referenceAliasToFile.has(normalizedRelatedId);

      if (!targetExists) {
        findings.push({
          level: 'ERROR',
          file: obj.file,
          message: `broken related reference: ${relatedId}`,
        });
      } else if (objectAliases.has(normalizedRelatedId)) {
        findings.push({
          level: 'ERROR',
          file: obj.file,
          message: `self-reference in related: ${relatedId}`,
        });
      }
    }

    for (const connection of obj.fields.connections || []) {
      const connectionId = String(connection.ref || '').trim();
      const normalizedConnectionId = normalizeObjectRef(connectionId);
      const targetExists =
        aliasToFile.has(normalizedConnectionId) || referenceAliasToFile.has(normalizedConnectionId);

      if (!connectionId || !String(connection.role || '').trim()) {
        findings.push({
          level: 'ERROR',
          file: obj.file,
          message: 'invalid connection entry: ref and role are required',
        });
      } else if (!targetExists) {
        findings.push({
          level: 'ERROR',
          file: obj.file,
          message: `broken connection reference: ${connectionId}`,
        });
      } else if (objectAliases.has(normalizedConnectionId)) {
        findings.push({
          level: 'ERROR',
          file: obj.file,
          message: `self-reference in connections: ${connectionId}`,
        });
      }
    }

    if (String(obj.fields.type) === 'nexus') {
      for (const ref of obj.includedRefs) {
        const normalizedRef = normalizeObjectRef(ref);
        if (!aliasToFile.has(normalizedRef) && !referenceAliasToFile.has(normalizedRef)) {
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
