export interface ColorPipeline {
  tone: Uint8ClampedArray;
  matrix: ColorMatrix;
}

export interface ColorMatrix {
  rr: number;
  rg: number;
  rb: number;
  ro: number;
  gr: number;
  gg: number;
  gb: number;
  go: number;
  br: number;
  bg: number;
  bb: number;
  bo: number;
}

export const IDENTITY_MATRIX: ColorMatrix = {
  rr: 1,
  rg: 0,
  rb: 0,
  ro: 0,
  gr: 0,
  gg: 1,
  gb: 0,
  go: 0,
  br: 0,
  bg: 0,
  bb: 1,
  bo: 0,
};

const FULL_GRAYSCALE: ColorMatrix = {
  rr: 0.2126,
  rg: 0.7152,
  rb: 0.0722,
  ro: 0,
  gr: 0.2126,
  gg: 0.7152,
  gb: 0.0722,
  go: 0,
  br: 0.2126,
  bg: 0.7152,
  bb: 0.0722,
  bo: 0,
};

const FULL_SEPIA: ColorMatrix = {
  rr: 0.393,
  rg: 0.769,
  rb: 0.189,
  ro: 0,
  gr: 0.349,
  gg: 0.686,
  gb: 0.168,
  go: 0,
  br: 0.272,
  bg: 0.534,
  bb: 0.131,
  bo: 0,
};

const FULL_INVERT: ColorMatrix = {
  rr: -1,
  rg: 0,
  rb: 0,
  ro: 255,
  gr: 0,
  gg: -1,
  gb: 0,
  go: 255,
  br: 0,
  bg: 0,
  bb: -1,
  bo: 255,
};

const SATURATE_LUMA: ColorMatrix = {
  rr: 0.213,
  rg: 0.715,
  rb: 0.072,
  ro: 0,
  gr: 0.213,
  gg: 0.715,
  gb: 0.072,
  go: 0,
  br: 0.213,
  bg: 0.715,
  bb: 0.072,
  bo: 0,
};

function lerpMatrix(from: ColorMatrix, to: ColorMatrix, t: number): ColorMatrix {
  return {
    rr: from.rr + (to.rr - from.rr) * t,
    rg: from.rg + (to.rg - from.rg) * t,
    rb: from.rb + (to.rb - from.rb) * t,
    ro: from.ro + (to.ro - from.ro) * t,
    gr: from.gr + (to.gr - from.gr) * t,
    gg: from.gg + (to.gg - from.gg) * t,
    gb: from.gb + (to.gb - from.gb) * t,
    go: from.go + (to.go - from.go) * t,
    br: from.br + (to.br - from.br) * t,
    bg: from.bg + (to.bg - from.bg) * t,
    bb: from.bb + (to.bb - from.bb) * t,
    bo: from.bo + (to.bo - from.bo) * t,
  };
}

export function grayscaleMatrix(amount: number): ColorMatrix {
  return lerpMatrix(IDENTITY_MATRIX, FULL_GRAYSCALE, amount);
}

export function sepiaMatrix(amount: number): ColorMatrix {
  return lerpMatrix(IDENTITY_MATRIX, FULL_SEPIA, amount);
}

export function invertMatrix(amount: number): ColorMatrix {
  return lerpMatrix(IDENTITY_MATRIX, FULL_INVERT, amount);
}

export function saturateMatrix(amount: number): ColorMatrix {
  return lerpMatrix(SATURATE_LUMA, IDENTITY_MATRIX, amount);
}

export function scaleMatrix(matrix: ColorMatrix, factor: number): ColorMatrix {
  return {
    rr: matrix.rr * factor,
    rg: matrix.rg * factor,
    rb: matrix.rb * factor,
    ro: matrix.ro * factor,
    gr: matrix.gr * factor,
    gg: matrix.gg * factor,
    gb: matrix.gb * factor,
    go: matrix.go * factor,
    br: matrix.br * factor,
    bg: matrix.bg * factor,
    bb: matrix.bb * factor,
    bo: matrix.bo * factor,
  };
}

export function composeMatrices(outer: ColorMatrix, inner: ColorMatrix): ColorMatrix {
  return {
    rr: outer.rr * inner.rr + outer.rg * inner.gr + outer.rb * inner.br,
    rg: outer.rr * inner.rg + outer.rg * inner.gg + outer.rb * inner.bg,
    rb: outer.rr * inner.rb + outer.rg * inner.gb + outer.rb * inner.bb,
    ro: outer.rr * inner.ro + outer.rg * inner.go + outer.rb * inner.bo + outer.ro,
    gr: outer.gr * inner.rr + outer.gg * inner.gr + outer.gb * inner.br,
    gg: outer.gr * inner.rg + outer.gg * inner.gg + outer.gb * inner.bg,
    gb: outer.gr * inner.rb + outer.gg * inner.gb + outer.gb * inner.bb,
    go: outer.gr * inner.ro + outer.gg * inner.go + outer.gb * inner.bo + outer.go,
    br: outer.br * inner.rr + outer.bg * inner.gr + outer.bb * inner.br,
    bg: outer.br * inner.rg + outer.bg * inner.gg + outer.bb * inner.bg,
    bb: outer.br * inner.rb + outer.bg * inner.gb + outer.bb * inner.bb,
    bo: outer.br * inner.ro + outer.bg * inner.go + outer.bb * inner.bo + outer.bo,
  };
}

const IDENTITY_TONE = buildIdentityTone();

function buildIdentityTone(): Uint8ClampedArray {
  const tone = new Uint8ClampedArray(256);

  for (let i = 0; i < 256; i += 1) {
    tone[i] = i;
  }

  return tone;
}

export function identityTone(): Uint8ClampedArray {
  return IDENTITY_TONE;
}

export function buildToneCurve(brightness: number, contrast: number): Uint8ClampedArray {
  const slope = brightness * contrast;
  const intercept = 128 * (1 - contrast);
  const tone = new Uint8ClampedArray(256);

  for (let i = 0; i < 256; i += 1) {
    tone[i] = i * slope + intercept;
  }

  return tone;
}

export function applyColorPipeline(imageData: ImageData, tone: Uint8ClampedArray, matrix: ColorMatrix): void {
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    const r = tone[data[i]];
    const g = tone[data[i + 1]];
    const b = tone[data[i + 2]];

    data[i] = matrix.rr * r + matrix.rg * g + matrix.rb * b + matrix.ro;
    data[i + 1] = matrix.gr * r + matrix.gg * g + matrix.gb * b + matrix.go;
    data[i + 2] = matrix.br * r + matrix.bg * g + matrix.bb * b + matrix.bo;
  }
}
