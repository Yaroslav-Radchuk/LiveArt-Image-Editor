export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
export const MAX_IMAGE_SIZE_MB = 25;
export type FileValidationError = 'unsupportedFormat' | 'fileTooLarge';

const BYTES_PER_MB = 1024 * 1024;

export function validateImageFile(file: File): FileValidationError | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'unsupportedFormat';
  }

  if (file.size > MAX_IMAGE_SIZE_MB * BYTES_PER_MB) {
    return 'fileTooLarge';
  }

  return null;
}
