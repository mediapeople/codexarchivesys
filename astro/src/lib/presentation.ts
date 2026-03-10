import type { ArchiveEntry } from './archive';
import type { CodexMediaItem } from './media';

function asText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function firstText(...values: unknown[]): string {
  for (const value of values) {
    const text = asText(value);
    if (text) {
      return text;
    }
  }
  return '';
}

function summarize(text: string, maxLength = 96): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  const clipped = normalized.slice(0, maxLength).replace(/\s+\S*$/, '');
  return `${clipped}...`;
}

function buildFieldLogLead(entry: ArchiveEntry): string {
  const data = entry.data as Record<string, unknown>;
  const project = asText(data.project);
  const phase = asText(data.phase);
  const context = asText(data.context);

  if (project && phase) {
    return `${project} / ${phase}`;
  }
  return firstText(context, project, phase);
}

function buildArtifactLead(entry: ArchiveEntry): string {
  const data = entry.data as Record<string, unknown>;
  const artifactType = asText(data.artifactType);
  const materials = asText(data.materials);
  if (artifactType && materials) {
    return `${artifactType} in ${materials}`;
  }
  return firstText(artifactType, materials, data.location, data.source);
}

function buildCodexLead(entry: ArchiveEntry): string {
  const data = entry.data as Record<string, unknown>;
  const version = asText(data.version);
  const scope = asText(data.scope);
  const systemArea = asText(data.systemArea);
  if (version && scope) {
    return `${version} / ${scope}`;
  }
  return firstText(version, scope, systemArea, data.changeType);
}

function buildScrollLead(entry: ArchiveEntry): string {
  const data = entry.data as Record<string, unknown>;
  return firstText(data.series, data.tone, data.cadence, data.dedication);
}

function buildLoremapLead(entry: ArchiveEntry): string {
  const data = entry.data as Record<string, unknown>;
  return firstText(data.terrain, data.location, data.geo, data.excerpt);
}

function buildFragmentLead(entry: ArchiveEntry): string {
  const data = entry.data as Record<string, unknown>;
  return firstText(data.voice, data.origin, data.lengthClass);
}

function buildNexusLead(entry: ArchiveEntry): string {
  const data = entry.data as Record<string, unknown>;
  return firstText(data.themeStatement, data.releaseType, data.lead);
}

function buildSignalLead(entry: ArchiveEntry): string {
  const data = entry.data as Record<string, unknown>;
  const markers = Array.isArray(data.markers)
    ? data.markers.map((item) => asText(item)).filter(Boolean)
    : [];
  if (markers.length > 0) {
    return markers.slice(0, 2).join(' / ');
  }
  return firstText(data.origin, data.excerpt);
}

export function getPresentationMode(
  entry: ArchiveEntry,
  primaryMedia: CodexMediaItem | null
): string {
  if (primaryMedia?.kind === 'image') {
    return 'visual lead';
  }
  if (primaryMedia?.kind === 'video') {
    return 'motion lead';
  }
  if (primaryMedia?.kind === 'audio') {
    return 'audio lead';
  }

  const map: Record<string, string> = {
    scroll: 'text lead',
    loremap: 'terrain lead',
    artifact: 'object lead',
    fieldlog: 'field lead',
    codex: 'system lead',
    fragment: 'fragment lead',
    nexus: 'sequence lead',
    signal: 'signal lead',
  };
  return map[entry.collection] || 'text lead';
}

export function getPresentationLead(entry: ArchiveEntry): string | null {
  const leadByType: Record<string, () => string> = {
    scroll: () => buildScrollLead(entry),
    loremap: () => buildLoremapLead(entry),
    artifact: () => buildArtifactLead(entry),
    fieldlog: () => buildFieldLogLead(entry),
    codex: () => buildCodexLead(entry),
    fragment: () => buildFragmentLead(entry),
    nexus: () => buildNexusLead(entry),
    signal: () => buildSignalLead(entry),
  };

  const byType = leadByType[entry.collection]?.();
  if (byType) {
    return summarize(byType);
  }

  const excerpt = firstText(entry.data.excerpt);
  return excerpt ? summarize(excerpt) : null;
}
