import { PDFDocument } from 'pdf-lib';
import type { UploadedFileRecord } from './models';

export const MAX_FILE_COUNT = 30;
export const MAX_TOTAL_BYTES = 50 * 1024 * 1024; // 50 MB

export interface FileProcessSuccess {
  ok: true;
  record: UploadedFileRecord;
}

export interface FileProcessFailure {
  ok: false;
  fileName: string;
  errorCode: 'not_a_pdf' | 'file_empty' | 'corrupt_or_encrypted' | 'exceeds_size_limit' | 'exceeds_count_limit';
}

export type ProcessFileResult = FileProcessSuccess | FileProcessFailure;

export function isPdfMagicBytes(bytes: Uint8Array): boolean {
  if (bytes.length < 5) return false;
  // %PDF- is 0x25, 0x50, 0x44, 0x46, 0x2D
  return (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
}

export async function computeSha256(bytes: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes.buffer as ArrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function inspectPdfFile(
  file: File,
  currentTotalFiles: number,
  currentTotalBytes: number
): Promise<ProcessFileResult> {
  const fileName = file.name;
  const isPdfExtension = fileName.toLowerCase().endsWith('.pdf');

  if (currentTotalFiles >= MAX_FILE_COUNT) {
    return { ok: false, fileName, errorCode: 'exceeds_count_limit' };
  }

  if (currentTotalBytes + file.size > MAX_TOTAL_BYTES) {
    return { ok: false, fileName, errorCode: 'exceeds_size_limit' };
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  if (bytes.length === 0) {
    return { ok: false, fileName, errorCode: 'file_empty' };
  }

  if (!isPdfExtension || !isPdfMagicBytes(bytes)) {
    return { ok: false, fileName, errorCode: 'not_a_pdf' };
  }

  let pageCount = 0;
  let fileError: string | undefined = undefined;

  try {
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    pageCount = doc.getPageCount();
    if (pageCount <= 0) {
      fileError = 'corrupt_or_encrypted';
    }
  } catch {
    fileError = 'corrupt_or_encrypted';
  }

  const hash = await computeSha256(bytes);
  const id = `f_${hash.slice(0, 10)}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  return {
    ok: true,
    record: {
      id,
      name: fileName,
      size: file.size,
      pageCount: pageCount || 0,
      hash,
      bytes,
      isDuplicate: false,
      error: fileError,
    },
  };
}

/**
 * Re-evaluates duplicate status across all uploaded files based on identical SHA-256 hashes.
 */
export function recalculateDuplicates(files: UploadedFileRecord[]): UploadedFileRecord[] {
  const hashMap = new Map<string, UploadedFileRecord[]>();

  for (const f of files) {
    const group = hashMap.get(f.hash) || [];
    group.push(f);
    hashMap.set(f.hash, group);
  }

  return files.map((f) => {
    const group = hashMap.get(f.hash) || [];
    if (group.length > 1) {
      const primary = group[0];
      return {
        ...f,
        isDuplicate: true,
        duplicateGroupId: f.hash,
        duplicateOfName: f.id !== primary.id ? primary.name : undefined,
      };
    }
    return {
      ...f,
      isDuplicate: false,
      duplicateGroupId: undefined,
      duplicateOfName: undefined,
    };
  });
}
