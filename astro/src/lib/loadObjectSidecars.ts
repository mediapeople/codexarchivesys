import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { normalizeMythmechSidecar, normalizePlatePrompt } from './mythmech';

export interface ObjectSidecars {
  packet: unknown | null;
  respawn: string | null;
  mythmech: Record<string, unknown> | null;
  platePrompt: string | null;
}

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
    return { packet: null, respawn: null, mythmech: null, platePrompt: null };
  }

  const bases = getCandidatePaths(filePath).map((candidate) => candidate.replace(/\.md$/i, ''));

  return {
    packet: await readPacket(bases.map((base) => `${base}.packet.json`)),
    respawn: await readRespawn(bases.map((base) => `${base}.respawn.txt`)),
    mythmech: await readMythmech(bases.map((base) => `${base}.mythmech.sidecar`)),
    platePrompt: await readPlatePrompt(bases.map((base) => `${base}.plate-prompt.txt`)),
  };
}
