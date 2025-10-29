/**
 * File upload utilities for assessment file questions
 */

export interface FileUploadResult {
  fileId: number;
  filename: string;
  mimeType: string;
  size: number;
}

export async function uploadFile(
  file: File,
  userId: number
): Promise<FileUploadResult> {
  // Read file as ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // Store in IndexedDB
  const { db } = await import('../db');
  const fileId = await db.uploadedFiles.add({
    filename: file.name,
    mimeType: file.type,
    size: file.size,
    data: arrayBuffer,
    uploadedAt: Date.now(),
    uploadedBy: userId,
  });

  return {
    fileId: fileId as number,
    filename: file.name,
    mimeType: file.type,
    size: file.size,
  };
}

export async function downloadFile(fileId: number): Promise<Blob | null> {
  const { db } = await import('../db');
  const file = await db.uploadedFiles.get(fileId);
  if (!file) return null;

  return new Blob([file.data], { type: file.mimeType });
}

export function validateFile(file: File, maxSizeMB = 10): string | null {
  const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
  if (file.size > maxSize) {
    return `File size exceeds ${maxSizeMB}MB limit`;
  }
  // Add more validation as needed (file type, etc.)
  return null;
}


