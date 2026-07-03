import { describe, it, expect } from 'vitest';
import { computePrintSizes } from '@/composables/usePrintInfo';

describe('computePrintSizes', () => {
  it('returns an entry for each standard size', () => {
    const result = computePrintSizes(1000, 1000);
    expect(result.map((r) => r.label)).toEqual(['A4', 'A3', 'A2']);
  });

  it('calculates dpi based on pixel width and paper width', () => {
    const result = computePrintSizes(2480, 3508);
    const a4 = result.find((r) => r.label === 'A4');
    expect(a4?.dpi).toBe(300);
  });

  it('marks 300+ dpi as ready', () => {
    const result = computePrintSizes(2480, 3508);
    expect(result.find((r) => r.label === 'A4')?.status).toBe('ready');
  });

  it('marks 150-299 dpi as acceptable', () => {
    const result = computePrintSizes(1240, 1754);
    expect(result.find((r) => r.label === 'A4')?.status).toBe('acceptable');
  });

  it('marks below 150 dpi as low', () => {
    const result = computePrintSizes(620, 877);
    expect(result.find((r) => r.label === 'A4')?.status).toBe('low');
  });

  it('returns zeros when pixelW is 0', () => {
    const result = computePrintSizes(0, 0);
    expect(result.every((r) => r.dpi === 0)).toBe(true);
  });
});
