import { dirname, join, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

export type MediaShape = 'wide' | 'landscape' | 'square' | 'portrait' | 'tall';

export interface ImageAssetMetadata {
  width: number;
  height: number;
  shape: MediaShape;
  version?: string;
}

const metadataCache = new Map<string, Promise<ImageAssetMetadata | null>>();
const versionCache = new Map<string, Promise<string | null>>();
const publicRoot = normalize(join(dirname(fileURLToPath(import.meta.url)), '../../public'));

export function classifyMediaShape(width: number, height: number): MediaShape {
  const ratio = width / height;

  if (!Number.isFinite(ratio) || ratio <= 0) {
    return 'landscape';
  }

  if (ratio >= 1.45) {
    return 'wide';
  }

  if (ratio >= 1.08) {
    return 'landscape';
  }

  if (ratio >= 0.92) {
    return 'square';
  }

  if (ratio >= 0.72) {
    return 'portrait';
  }

  return 'tall';
}

function resolvePublicAssetPath(src: string): string | null {
  if (typeof src !== 'string' || !src.startsWith('/')) {
    return null;
  }

  const cleanSrc = src.split(/[?#]/, 1)[0];
  if (!cleanSrc) {
    return null;
  }

  const resolvedPath = normalize(join(publicRoot, cleanSrc.replace(/^\/+/, '')));
  const relativePath = relative(publicRoot, resolvedPath);

  if (
    !relativePath ||
    relativePath.startsWith('..') ||
    relativePath.includes('/../') ||
    relativePath.includes('\\..\\')
  ) {
    return null;
  }

  return resolvedPath;
}

function getAssetVersionForPath(assetPath: string): Promise<string | null> {
  const cached = versionCache.get(assetPath);
  if (cached) {
    return cached;
  }

  const versionPromise = (async () => {
    try {
      const buffer = await readFile(assetPath);
      return createHash('sha1').update(buffer).digest('hex').slice(0, 12);
    } catch {
      return null;
    }
  })();

  versionCache.set(assetPath, versionPromise);
  return versionPromise;
}

export async function getPublicAssetVersion(src: string): Promise<string | null> {
  const assetPath = resolvePublicAssetPath(src);
  if (!assetPath) {
    return null;
  }

  return getAssetVersionForPath(assetPath);
}

export async function getImageAssetMetadata(src: string): Promise<ImageAssetMetadata | null> {
  const cached = metadataCache.get(src);
  if (cached) {
    return cached;
  }

  const metadataPromise = (async () => {
    const assetPath = resolvePublicAssetPath(src);
    if (!assetPath) {
      return null;
    }

    try {
      const [metadata, version] = await Promise.all([
        sharp(assetPath).metadata(),
        getAssetVersionForPath(assetPath),
      ]);
      if (!metadata.width || !metadata.height) {
        return null;
      }

      return {
        width: metadata.width,
        height: metadata.height,
        shape: classifyMediaShape(metadata.width, metadata.height),
        version: version ?? undefined,
      };
    } catch {
      return null;
    }
  })();

  metadataCache.set(src, metadataPromise);
  return metadataPromise;
}
