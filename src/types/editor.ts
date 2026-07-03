export const OpKind = {
  Crop: 'crop',
  Adjust: 'adjust',
  Filter: 'filter',
} as const;

export type OpKind = (typeof OpKind)[keyof typeof OpKind];

export interface CropOp {
  kind: typeof OpKind.Crop;
  x: number;
  y: number;
  width: number;
  height: number;
  aspectId?: string;
}

export interface AdjustOp {
  kind: typeof OpKind.Adjust;
  brightness: number;
  contrast: number;
  saturation: number;
}

export interface FilterOp {
  kind: typeof OpKind.Filter;
  name: FilterName;
}

export type Op = CropOp | AdjustOp | FilterOp;

export type FilterName = 'none' | 'greyscale' | 'sepia' | 'invert' | 'warm' | 'cool';

export const FILTER_NAMES: FilterName[] = [
  'none',
  'greyscale',
  'sepia',
  'invert',
  'warm',
  'cool',
];

export const FREE_ASPECT_ID = 'free';

export const ADJUSTMENT_LIMIT = 100;

export interface AdjustmentValues {
  brightness: number;
  contrast: number;
  saturation: number;
}

export interface PrintSize {
  label: string;
  widthMm: number;
  heightMm: number;
  dpi: number;
  status: 'ready' | 'acceptable' | 'low';
}
