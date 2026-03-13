import fs from 'node:fs';
import path from 'node:path';

export const IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.heic',
  '.heif',
]);

export const VIDEO_EXTENSIONS = new Set([
  '.mp4',
  '.mov',
  '.m4v',
]);

export function readFileSignature(filePath, byteLength = 32) {
  const handle = fs.openSync(filePath, 'r');

  try {
    const buffer = Buffer.alloc(byteLength);
    const bytesRead = fs.readSync(handle, buffer, 0, byteLength, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    fs.closeSync(handle);
  }
}

export function isIsoBaseMedia(buffer) {
  return buffer.length >= 12 && buffer.subarray(4, 8).toString('ascii') === 'ftyp';
}

export function getIsoBrand(buffer) {
  if (!isIsoBaseMedia(buffer)) {
    return '';
  }

  return buffer.subarray(8, 12).toString('ascii').trim();
}

export function detectActualMediaFormat(filePath) {
  const fallbackExtension = path.extname(filePath).toLowerCase();
  const signature = readFileSignature(filePath, 32);

  if (
    signature.length >= 8 &&
    signature[0] === 0x89 &&
    signature[1] === 0x50 &&
    signature[2] === 0x4e &&
    signature[3] === 0x47
  ) {
    return 'png';
  }

  if (signature.length >= 3 && signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff) {
    return 'jpeg';
  }

  if (
    signature.length >= 12 &&
    signature.subarray(0, 4).toString('ascii') === 'RIFF' &&
    signature.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp';
  }

  if (signature.length >= 12 && signature.subarray(0, 4).toString('ascii') === 'GIF8') {
    return 'gif';
  }

  const isoBrand = getIsoBrand(signature);
  if (['heic', 'heix', 'hevc', 'heim', 'heis', 'hevm', 'mif1', 'msf1'].includes(isoBrand)) {
    return 'heif';
  }

  if (['mp41', 'mp42', 'isom', 'iso2', 'avc1', 'M4V '].includes(isoBrand)) {
    return 'mp4';
  }

  if (fallbackExtension === '.jpg' || fallbackExtension === '.jpeg') {
    return 'jpeg';
  }
  if (fallbackExtension === '.png') {
    return 'png';
  }
  if (fallbackExtension === '.webp') {
    return 'webp';
  }
  if (fallbackExtension === '.gif') {
    return 'gif';
  }
  if (fallbackExtension === '.mov') {
    return 'mov';
  }
  if (fallbackExtension === '.mp4' || fallbackExtension === '.m4v') {
    return 'mp4';
  }
  if (fallbackExtension === '.heic' || fallbackExtension === '.heif') {
    return 'heif';
  }

  return 'unknown';
}

export function getMediaKind(filePath) {
  const format = detectActualMediaFormat(filePath);
  if (format === 'mp4' || format === 'mov') {
    return 'video';
  }

  return 'image';
}

export function getDeliveryExtension(filePath) {
  const format = detectActualMediaFormat(filePath);

  if (format === 'jpeg' || format === 'heif') {
    return '.jpg';
  }

  if (format === 'png') {
    return '.png';
  }

  if (format === 'webp') {
    return '.webp';
  }

  if (format === 'gif') {
    return '.gif';
  }

  if (format === 'mov' || format === 'mp4') {
    return '.mp4';
  }

  const fallbackExtension = path.extname(filePath).toLowerCase();
  if (fallbackExtension) {
    return fallbackExtension;
  }

  return '.bin';
}
