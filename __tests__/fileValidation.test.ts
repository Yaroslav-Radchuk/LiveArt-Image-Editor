import { describe, it, expect } from 'vitest';
import { validateImageFile, MAX_IMAGE_SIZE_MB } from '@/utils/fileValidation';

function makeFile(type: string, sizeBytes = 1024): File {
  return new File([new ArrayBuffer(sizeBytes)], 'test-image', { type });
}

describe('validateImageFile', () => {
  it('accepts jpeg, png, webp, and gif', () => {
    expect(validateImageFile(makeFile('image/jpeg'))).toBeNull();
    expect(validateImageFile(makeFile('image/png'))).toBeNull();
    expect(validateImageFile(makeFile('image/webp'))).toBeNull();
    expect(validateImageFile(makeFile('image/gif'))).toBeNull();
  });

  it('rejects non-image types with a format error code', () => {
    expect(validateImageFile(makeFile('application/pdf'))).toBe('unsupportedFormat');
  });

  it('rejects svg since canvas export would taint', () => {
    expect(validateImageFile(makeFile('image/svg+xml'))).toBe('unsupportedFormat');
  });

  it('accepts a file exactly at the size limit', () => {
    const file = makeFile('image/png', MAX_IMAGE_SIZE_MB * 1024 * 1024);
    expect(validateImageFile(file)).toBeNull();
  });

  it('rejects a file over the size limit with a size error code', () => {
    const file = makeFile('image/png', MAX_IMAGE_SIZE_MB * 1024 * 1024 + 1);
    expect(validateImageFile(file)).toBe('fileTooLarge');
  });
});
