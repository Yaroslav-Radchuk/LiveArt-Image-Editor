import { MM_PER_INCH } from '@/utils/units';
import type { PrintSize } from '@/types/editor';

const PAPER_SIZES = [
  {
    label: 'A4',
    widthMm: 210,
    heightMm: 297,
  },
  {
    label: 'A3',
    widthMm: 297,
    heightMm: 420,
  },
  {
    label: 'A2',
    widthMm: 420,
    heightMm: 594,
  },
] as const;

const PRINT_READY_DPI = 300;
const PRINT_ACCEPTABLE_DPI = 150;

type PaperSize = (typeof PAPER_SIZES)[number];

function printStatus(dpi: number): PrintSize['status'] {
  if (dpi >= PRINT_READY_DPI) {
    return 'ready';
  }

  if (dpi >= PRINT_ACCEPTABLE_DPI) {
    return 'acceptable';
  }

  return 'low';
}

function toPrintSize(size: PaperSize, pixelW: number, pixelH: number): PrintSize {
  const dpiW = pixelW / (size.widthMm / MM_PER_INCH);
  const dpiH = pixelH / (size.heightMm / MM_PER_INCH);
  const dpi = Math.round(Math.min(dpiW, dpiH));

  return {
    label: size.label,
    widthMm: size.widthMm,
    heightMm: size.heightMm,
    dpi,
    status: printStatus(dpi),
  };
}

export function computePrintSizes(pixelW: number, pixelH: number): PrintSize[] {
  return PAPER_SIZES.map((size) => toPrintSize(size, pixelW, pixelH));
}
