export type RespawnEntry = {
  key: string;
  label: string;
  value: string;
};

function normalizeCopy(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function toLabel(key: string): string {
  const normalized = key.trim().toUpperCase();
  if (normalized === 'ATMOS') return 'Atmosphere';
  if (normalized === 'NOTES') return 'Carry Forward';
  return `${normalized.slice(0, 1)}${normalized.slice(1).toLowerCase()}`;
}

function formatNotesValue(value: string): string {
  return value
    .split('|')
    .map((part) => normalizeCopy(part))
    .filter(Boolean)
    .map((part) => part.replace(/^([a-z0-9 _-]+)=/i, (_, label: string) => `${label.trim()}: `))
    .join(' · ');
}

function formatRespawnValue(key: string, value: string): string {
  const normalized = normalizeCopy(value);
  if (!normalized) return '';
  if (key === 'NOTES') {
    return formatNotesValue(normalized);
  }
  return normalized;
}

export function parseRespawnSummary(respawn: string | null | undefined): RespawnEntry[] {
  if (typeof respawn !== 'string') {
    return [];
  }

  return respawn
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex === -1) {
        const value = normalizeCopy(line);
        return value ? { key: 'NOTE', label: 'Note', value } : null;
      }

      const key = line.slice(0, separatorIndex).trim().toUpperCase();
      const value = formatRespawnValue(key, line.slice(separatorIndex + 1));
      if (!value) return null;
      return {
        key,
        label: toLabel(key),
        value,
      };
    })
    .filter((entry): entry is RespawnEntry => Boolean(entry));
}

function getEntry(entries: RespawnEntry[], key: string): RespawnEntry | undefined {
  return entries.find((entry) => entry.key === key);
}

export function buildRespawnLead(entries: RespawnEntry[]): string {
  const mode = getEntry(entries, 'MODE')?.value;
  const signal = getEntry(entries, 'SIGNAL')?.value;
  const atmosphere = getEntry(entries, 'ATMOS')?.value;

  if (mode) {
    return `Resume with ${mode} mode active.`;
  }

  if (signal) {
    return `Resume from the stored signal cue.`;
  }

  if (atmosphere) {
    return `Resume from the stored field conditions.`;
  }

  return entries[0]?.value || '';
}

export function buildRespawnSupport(entries: RespawnEntry[]): string {
  const atmosphere = getEntry(entries, 'ATMOS')?.value;
  const watch = getEntry(entries, 'WATCH')?.value;
  const shadow = getEntry(entries, 'SHADOW')?.value;
  const carry = getEntry(entries, 'NOTES')?.value;

  return [atmosphere ? `Atmosphere ${atmosphere}` : '', watch && watch !== 'NONE' ? `Watch ${watch}` : '', shadow && shadow !== 'NONE / CLEAR' ? `Shadow ${shadow}` : '', carry ? `Carry forward ${carry}` : '']
    .filter(Boolean)
    .join('. ');
}
