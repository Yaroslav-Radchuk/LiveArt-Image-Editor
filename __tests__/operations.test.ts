import { describe, it, expect } from 'vitest';
import { isOp, isValidPayload } from '@/utils/operations';

describe('isOp', () => {
  it('accepts a valid crop op', () => {
    expect(isOp({
      kind: 'crop',
      x: 0.1,
      y: 0.2,
      width: 0.5,
      height: 0.5,
    })).toBe(true);
  });

  it('accepts a crop op with an aspect preset id', () => {
    expect(isOp({
      kind: 'crop',
      x: 0.1,
      y: 0.2,
      width: 0.5,
      height: 0.5,
      aspectId: 'a3',
    })).toBe(true);
  });

  it('rejects a crop op with a non-string aspect preset id', () => {
    expect(isOp({
      kind: 'crop',
      x: 0.1,
      y: 0.2,
      width: 0.5,
      height: 0.5,
      aspectId: 3,
    })).toBe(false);
  });

  it('accepts a valid adjust op', () => {
    expect(isOp({
      kind: 'adjust',
      brightness: 10,
      contrast: -5,
      saturation: 0,
    })).toBe(true);
  });

  it('accepts known filter names only', () => {
    expect(isOp({ kind: 'filter', name: 'sepia' })).toBe(true);
    expect(isOp({ kind: 'filter', name: 'blur' })).toBe(false);
  });

  it('rejects a crop op with a missing field', () => {
    expect(isOp({
      kind: 'crop',
      x: 0,
      y: 0,
      width: 0.5,
    })).toBe(false);
  });

  it('rejects a crop op with a non-numeric field', () => {
    expect(isOp({
      kind: 'crop',
      x: '0',
      y: 0,
      width: 0.5,
      height: 0.5,
    })).toBe(false);
  });

  it('rejects unknown kinds and non-objects', () => {
    expect(isOp({ kind: 'rotate', angle: 90 })).toBe(false);
    expect(isOp(null)).toBe(false);
    expect(isOp('crop')).toBe(false);
  });
});

describe('isValidPayload', () => {
  const ops = [
    {
      kind: 'crop',
      x: 0.1,
      y: 0.05,
      width: 0.8,
      height: 0.9,
    },
    {
      kind: 'adjust',
      brightness: 10,
      contrast: -5,
      saturation: 20,
    },
    { kind: 'filter', name: 'sepia' },
  ];

  it('accepts a well-formed payload', () => {
    expect(isValidPayload({ version: '1', operations: ops })).toBe(true);
  });

  it('accepts an empty operations list', () => {
    expect(isValidPayload({ version: '1', operations: [] })).toBe(true);
  });

  it('rejects a wrong version', () => {
    expect(isValidPayload({ version: '2', operations: ops })).toBe(false);
  });

  it('rejects a payload without operations array', () => {
    expect(isValidPayload({ version: '1', operations: 'none' })).toBe(false);
  });

  it('rejects a payload containing one invalid op', () => {
    expect(isValidPayload({ version: '1', operations: [...ops, { kind: 'crop' }] })).toBe(false);
  });

  it('rejects non-object roots', () => {
    expect(isValidPayload(null)).toBe(false);
    expect(isValidPayload([])).toBe(false);
    expect(isValidPayload('{}')).toBe(false);
  });
});
