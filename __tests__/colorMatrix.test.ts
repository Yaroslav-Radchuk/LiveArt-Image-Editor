import { describe, it, expect } from 'vitest';
import {
  IDENTITY_MATRIX,
  grayscaleMatrix,
  sepiaMatrix,
  invertMatrix,
  saturateMatrix,
  composeMatrices,
  scaleMatrix,
  buildToneCurve,
  identityTone,
  applyColorPipeline,
} from '@/utils/colorMatrix';

describe('buildToneCurve', () => {
  it('is a pass-through at neutral brightness and contrast', () => {
    const tone = buildToneCurve(1, 1);

    expect(tone[0]).toBe(0);
    expect(tone[100]).toBe(100);
    expect(tone[255]).toBe(255);
  });

  it('scales linearly with brightness', () => {
    const tone = buildToneCurve(1.5, 1);

    expect(tone[100]).toBe(150);
  });

  it('pivots around mid-grey with contrast', () => {
    const tone = buildToneCurve(1, 0.8);

    expect(tone[128]).toBe(128);
    expect(tone[228]).toBe(Math.round((228 - 128) * 0.8 + 128));
  });

  it('matches identityTone at neutral values', () => {
    const tone = buildToneCurve(1, 1);
    const identity = identityTone();

    expect(Array.from(tone)).toEqual(Array.from(identity));
  });
});

describe('grayscaleMatrix', () => {
  it('is the identity at amount 0', () => {
    expect(grayscaleMatrix(0)).toEqual(IDENTITY_MATRIX);
  });

  it('maps every channel to the same luma weights at amount 1', () => {
    const matrix = grayscaleMatrix(1);

    expect(matrix.rr).toBeCloseTo(0.2126);
    expect(matrix.rg).toBeCloseTo(0.7152);
    expect(matrix.rb).toBeCloseTo(0.0722);
    expect(matrix.gr).toBeCloseTo(matrix.rr);
    expect(matrix.gg).toBeCloseTo(matrix.rg);
    expect(matrix.gb).toBeCloseTo(matrix.rb);
    expect(matrix.br).toBeCloseTo(matrix.rr);
    expect(matrix.bg).toBeCloseTo(matrix.rg);
    expect(matrix.bb).toBeCloseTo(matrix.rb);
  });
});

describe('sepiaMatrix', () => {
  it('is the identity at amount 0', () => {
    expect(sepiaMatrix(0)).toEqual(IDENTITY_MATRIX);
  });
});

describe('invertMatrix', () => {
  it('is the identity at amount 0', () => {
    expect(invertMatrix(0)).toEqual(IDENTITY_MATRIX);
  });

  it('flips a channel through 255 at full amount', () => {
    const imageData = new ImageData(1, 1);
    imageData.data.set([255, 0, 0, 255]);

    applyColorPipeline(imageData, identityTone(), invertMatrix(1));

    expect(Array.from(imageData.data)).toEqual([0, 255, 255, 255]);
  });
});

describe('saturateMatrix', () => {
  it('is the identity at amount 1', () => {
    expect(saturateMatrix(1)).toEqual(IDENTITY_MATRIX);
  });

  it('flattens a colour to grey at amount 0', () => {
    const imageData = new ImageData(1, 1);
    imageData.data.set([200, 50, 10, 255]);

    applyColorPipeline(imageData, identityTone(), saturateMatrix(0));

    const [r, g, b] = Array.from(imageData.data);

    expect(r).toBe(g);
    expect(g).toBe(b);
  });
});

describe('composeMatrices', () => {
  it('composing two identities stays the identity', () => {
    expect(composeMatrices(IDENTITY_MATRIX, IDENTITY_MATRIX)).toEqual(IDENTITY_MATRIX);
  });
});

describe('scaleMatrix', () => {
  it('scales every coefficient by the factor', () => {
    const scaled = scaleMatrix(IDENTITY_MATRIX, 2);

    expect(scaled.rr).toBe(2);
    expect(scaled.gg).toBe(2);
    expect(scaled.bb).toBe(2);
  });
});

describe('applyColorPipeline', () => {
  it('leaves pixels untouched through the identity pipeline', () => {
    const imageData = new ImageData(1, 1);
    imageData.data.set([10, 20, 30, 255]);

    applyColorPipeline(imageData, identityTone(), IDENTITY_MATRIX);

    expect(Array.from(imageData.data)).toEqual([10, 20, 30, 255]);
  });

  it('never touches the alpha channel', () => {
    const imageData = new ImageData(1, 1);
    imageData.data.set([10, 20, 30, 128]);

    applyColorPipeline(imageData, identityTone(), invertMatrix(1));

    expect(imageData.data[3]).toBe(128);
  });
});
