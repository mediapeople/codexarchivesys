import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { normalizeMythmechSidecar, normalizePlatePrompt } from './mythmech';

export interface ObjectSidecars {
  packet: unknown | null;
  respawn: string | null;
  mythmech: Record<string, unknown> | null;
  platePrompt: string | null;
  vision: Record<string, unknown> | null;
  capture: Record<string, unknown> | null;
}

const sidecarCache = new Map<string, Promise<ObjectSidecars>>();

function getCandidatePaths(filePath: string): string[] {
  const normalized = filePath.replace(/\\/g, '/');
  const candidates = new Set<string>();

  if (path.isAbsolute(filePath)) {
    candidates.add(filePath);
  } else {
    candidates.add(path.resolve(process.cwd(), filePath));
    candidates.add(path.resolve(process.cwd(), 'astro', filePath));
  }

  if (normalized.startsWith('src/content/')) {
    candidates.add(path.resolve(process.cwd(), 'astro', normalized));
  }

  if (normalized.startsWith('astro/src/content/')) {
    candidates.add(path.resolve(process.cwd(), normalized));
  }

  return [...candidates];
}

async function readPacket(candidates: string[]): Promise<unknown | null> {
  for (const candidate of candidates) {
    try {
      return JSON.parse(await readFile(candidate, 'utf8'));
    } catch {
      // Packet sidecars are optional.
    }
  }

  return null;
}

async function readJsonSidecar(candidates: string[]): Promise<Record<string, unknown> | null> {
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(await readFile(candidate, 'utf8'));
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      // JSON sidecars are optional.
    }
  }

  return null;
}

function readJsonSidecarSync(candidates: string[]): Record<string, unknown> | null {
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(readFileSync(candidate, 'utf8'));
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      // JSON sidecars are optional.
    }
  }

  return null;
}

async function readRespawn(candidates: string[]): Promise<string | null> {
  for (const candidate of candidates) {
    try {
      const content = await readFile(candidate, 'utf8');
      return content.trim() ? content : null;
    } catch {
      // Respawn sidecars are optional.
    }
  }

  return null;
}

async function readMythmech(candidates: string[]): Promise<Record<string, unknown> | null> {
  for (const candidate of candidates) {
    try {
      const content = await readFile(candidate, 'utf8');
      const parsed = normalizeMythmechSidecar(content);
      if (parsed) {
        return parsed;
      }
    } catch {
      // Mythmech sidecars are optional.
    }
  }

  return null;
}

async function readPlatePrompt(candidates: string[]): Promise<string | null> {
  for (const candidate of candidates) {
    try {
      const content = await readFile(candidate, 'utf8');
      const normalized = normalizePlatePrompt(content);
      if (normalized) {
        return normalized;
      }
    } catch {
      // Plate prompts are optional.
    }
  }

  return null;
}

export async function loadObjectSidecars(filePath: string | undefined): Promise<ObjectSidecars> {
  if (!filePath) {
    return { packet: null, respawn: null, mythmech: null, platePrompt: null, vision: null, capture: null };
  }

  const cacheKey = filePath.replace(/\\/g, '/');
  const cached = sidecarCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const pending = (async () => {
    const bases = getCandidatePaths(filePath).map((candidate) => candidate.replace(/\.md$/i, ''));

    return {
      packet: await readPacket(bases.map((base) => `${base}.packet.json`)),
      respawn: await readRespawn(bases.map((base) => `${base}.respawn.txt`)),
      mythmech: await readMythmech(bases.map((base) => `${base}.mythmech.sidecar`)),
      platePrompt: await readPlatePrompt(bases.map((base) => `${base}.plate-prompt.txt`)),
      vision: await readJsonSidecar(bases.map((base) => `${base}.vision.json`)),
      capture: await readJsonSidecar(bases.map((base) => `${base}.capture.json`)),
    };
  })();

  sidecarCache.set(cacheKey, pending);
  return pending;
}

export function loadCaptureSidecarSync(filePath: string | undefined): Record<string, unknown> | null {
  if (!filePath) {
    return null;
  }

  const bases = getCandidatePaths(filePath).map((candidate) => candidate.replace(/\.md$/i, ''));
  return readJsonSidecarSync(bases.map((base) => `${base}.capture.json`));
}
