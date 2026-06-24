/**
 * Sierra Estates — Firebase Storage Helper
 *
 * Production-ready file upload/download utilities with:
 *   - Resumable uploads (handles spotty networks in Egypt)
 *   - Progress tracking (for UI progress bars)
 *   - Path-based organization (listings/, users/, media/)
 *   - File size + type validation
 *   - Secure download URLs
 *
 * Usage:
 *   import { uploadListingImage, getDownloadUrl } from '@/lib/storage';
 *
 *   const { url, path } = await uploadListingImage(file, 'listing-001');
 *   const imageUrl = await getDownloadUrl('listings/listing-001/photo.jpg');
 */

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';
import { storage } from './firebase';

// ─── Constants ──────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
];
const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// ─── Types ──────────────────────────────────────────────────────────────

export interface UploadResult {
  url: string;
  path: string;
  size: number;
  contentType: string;
}

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

// ─── Validation ─────────────────────────────────────────────────────────

function validateFile(file: File, allowedTypes: string[]): void {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Max ${MAX_FILE_SIZE / 1024 / 1024}MB. Got ${(file.size / 1024 / 1024).toFixed(1)}MB.`);
  }
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type "${file.type}" not allowed. Accepted: ${allowedTypes.join(', ')}`);
  }
}

// ─── Upload helpers ─────────────────────────────────────────────────────

/**
 * Upload a file to a specific path with resumable upload + progress tracking.
 * Returns the download URL and storage path.
 */
export function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (onProgress) {
          const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress({
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            percentage: Math.round(percentage),
          });
        }
      },
      (error) => {
        console.error('[storage] Upload failed:', error);
        reject(error);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({
          url,
          path,
          size: file.size,
          contentType: file.type,
        });
      },
    );
  });
}

/**
 * Upload a listing image.
 * Path: listings/{listingId}/{timestamp}-{filename}
 */
export function uploadListingImage(
  file: File,
  listingId: string,
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResult> {
  validateFile(file, ALLOWED_IMAGE_TYPES);
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const path = `listings/${listingId}/${filename}`;
  return uploadFile(file, path, onProgress);
}

/**
 * Upload a user profile image.
 * Path: users/{uid}/profile-{timestamp}
 */
export function uploadProfileImage(
  file: File,
  uid: string,
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResult> {
  validateFile(file, ALLOWED_IMAGE_TYPES);
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `users/${uid}/profile-${Date.now()}.${ext}`;
  return uploadFile(file, path, onProgress);
}

/**
 * Upload a document (PDF, DOCX).
 * Path: documents/{folder}/{timestamp}-{filename}
 */
export function uploadDocument(
  file: File,
  folder: string,
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResult> {
  validateFile(file, ALLOWED_DOC_TYPES);
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const path = `documents/${folder}/${filename}`;
  return uploadFile(file, path, onProgress);
}

// ─── Download helpers ───────────────────────────────────────────────────

/**
 * Get a secure download URL for a file at a given path.
 */
export async function getDownloadUrl(path: string): Promise<string> {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}

/**
 * List all files in a directory (e.g. 'listings/listing-001/').
 */
export async function listFiles(path: string): Promise<string[]> {
  const storageRef = ref(storage, path);
  const result = await listAll(storageRef);
  return result.items.map((item) => item.fullPath);
}

// ─── Delete helpers ─────────────────────────────────────────────────────

/**
 * Delete a file from storage.
 */
export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

// ─── Batch upload helper ────────────────────────────────────────────────

/**
 * Upload multiple images for a listing in parallel.
 * Returns array of upload results (URLs + paths).
 */
export async function uploadListingImages(
  files: File[],
  listingId: string,
  onProgress?: (index: number, progress: UploadProgress) => void,
): Promise<UploadResult[]> {
  const uploads = files.map((file, index) =>
    uploadListingImage(file, listingId, (p) => onProgress?.(index, p)),
  );
  return Promise.all(uploads);
}
