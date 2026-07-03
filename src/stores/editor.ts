import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { computePrintSizes } from '@/composables/usePrintInfo';
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
} from '@/utils/colorMatrix';
import type { ColorMatrix, ColorPipeline } from '@/utils/colorMatrix';
import { ADJUSTMENT_LIMIT, FREE_ASPECT_ID, OpKind } from '@/types/editor';
import type {
  Op,
  CropOp,
  FilterName,
  AdjustmentValues,
  PrintSize,
} from '@/types/editor';

const MAX_HISTORY = 20;

const COOL_TINT: ColorMatrix = {
  ...IDENTITY_MATRIX,
  ro: -4,
  bo: 6,
};

const FILTER_MATRIX: Record<FilterName, ColorMatrix> = {
  none: IDENTITY_MATRIX,
  greyscale: grayscaleMatrix(1),
  sepia: sepiaMatrix(1),
  invert: invertMatrix(1),
  warm: composeMatrices(saturateMatrix(1.4), sepiaMatrix(0.35)),
  cool: scaleMatrix(composeMatrices(COOL_TINT, saturateMatrix(0.85)), 1.05),
};

interface EditorSnapshot {
  crop: CropOp | null;
  cropAspectId: string;
  adjustments: AdjustmentValues;
  filter: FilterName;
}

function sameCrop(a: CropOp | null, b: CropOp | null) {
  if (a === null || b === null) {
    return a === b;
  }

  const samePosition = a.x === b.x && a.y === b.y;
  const sameSize = a.width === b.width && a.height === b.height;

  return samePosition && sameSize;
}

function sameSnapshot(a: EditorSnapshot, b: EditorSnapshot) {
  const sameMeta = a.filter === b.filter && a.cropAspectId === b.cropAspectId;
  const sameAdjustments =
    a.adjustments.brightness === b.adjustments.brightness &&
    a.adjustments.contrast === b.adjustments.contrast &&
    a.adjustments.saturation === b.adjustments.saturation;

  return sameMeta && sameAdjustments && sameCrop(a.crop, b.crop);
}

export const useEditorStore = defineStore('editor', () => {
  const originalFile = ref<File | null>(null);
  const originalUrl = ref<string | null>(null);
  const naturalWidth = ref(0);
  const naturalHeight = ref(0);
  const cropConfig = ref<CropOp | null>(null);
  const cropAspectId = ref(FREE_ASPECT_ID);
  const adjustments = ref<AdjustmentValues>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
  });
  const activeFilter = ref<FilterName>('none');
  const isCropMode = ref(false);
  const isShowingOriginal = ref(false);

  const history = ref<EditorSnapshot[]>([]);
  const canUndo = computed(() => history.value.length > 0);

  const hasEdits = computed(() => {
    const {
      brightness,
      contrast,
      saturation,
    } = adjustments.value;

    const hasAdjustments = brightness !== 0 || contrast !== 0 || saturation !== 0;

    return cropConfig.value !== null || hasAdjustments || activeFilter.value !== 'none';
  });

  const pipelineColor = computed<ColorPipeline>(() => {
    const {
      brightness,
      contrast,
      saturation,
    } = adjustments.value;

    const tone = buildToneCurve(
      1 + brightness / ADJUSTMENT_LIMIT,
      1 + contrast / ADJUSTMENT_LIMIT,
    );
    const matrix = composeMatrices(
      FILTER_MATRIX[activeFilter.value],
      saturateMatrix(1 + saturation / ADJUSTMENT_LIMIT),
    );

    return {
      tone,
      matrix,
    };
  });

  const previewColor = computed<ColorPipeline>(() => (
    isShowingOriginal.value
      ? {
        tone: identityTone(),
        matrix: IDENTITY_MATRIX,
      }
      : pipelineColor.value
  ));

  const pipeline = computed<Op[]>(() => {
    const ops: Op[] = [];

    if (cropConfig.value) {
      ops.push(cropConfig.value);
    }

    ops.push({
      kind: OpKind.Adjust,
      brightness: adjustments.value.brightness,
      contrast: adjustments.value.contrast,
      saturation: adjustments.value.saturation,
    });

    if (activeFilter.value !== 'none') {
      ops.push({ kind: OpKind.Filter, name: activeFilter.value });
    }

    return ops;
  });

  const printInfo = computed<PrintSize[]>(() => {
    const w = cropConfig.value
      ? Math.round(cropConfig.value.width * naturalWidth.value)
      : naturalWidth.value;

    const h = cropConfig.value
      ? Math.round(cropConfig.value.height * naturalHeight.value)
      : naturalHeight.value;

    return computePrintSizes(w, h);
  });

  function currentSnapshot(): EditorSnapshot {
    return {
      crop: cropConfig.value ? { ...cropConfig.value } : null,
      cropAspectId: cropAspectId.value,
      adjustments: { ...adjustments.value },
      filter: activeFilter.value,
    };
  }

  function pushHistory() {
    const snap = currentSnapshot();
    const last = history.value[history.value.length - 1];
    const isDuplicate = last !== undefined && sameSnapshot(last, snap);

    if (isDuplicate) {
      return;
    }

    history.value = [...history.value.slice(-(MAX_HISTORY - 1)), snap];
  }

  function undo() {
    const current = currentSnapshot();
    let stack = history.value;
    const top = stack[stack.length - 1];
    const topIsCurrent = top !== undefined && sameSnapshot(top, current);

    if (topIsCurrent) {
      stack = stack.slice(0, -1);
    }

    const prev = stack[stack.length - 1];

    if (!prev) {
      history.value = stack;
      return;
    }

    history.value = stack.slice(0, -1);
    cropConfig.value = prev.crop;
    cropAspectId.value = prev.cropAspectId;
    adjustments.value = { ...prev.adjustments };
    activeFilter.value = prev.filter;
  }

  function loadFile(file: File) {
    if (originalUrl.value) {
      URL.revokeObjectURL(originalUrl.value);
    }

    history.value = [];
    originalFile.value = file;
    originalUrl.value = URL.createObjectURL(file);
    naturalWidth.value = 0;
    naturalHeight.value = 0;
    cropConfig.value = null;
    cropAspectId.value = FREE_ASPECT_ID;
    adjustments.value = {
      brightness: 0,
      contrast: 0,
      saturation: 0,
    };
    activeFilter.value = 'none';
    isCropMode.value = false;
    isShowingOriginal.value = false;
  }

  function clearFile() {
    if (originalUrl.value) {
      URL.revokeObjectURL(originalUrl.value);
    }

    originalFile.value = null;
    originalUrl.value = null;
    naturalWidth.value = 0;
    naturalHeight.value = 0;
    reset();
    isCropMode.value = false;
  }

  function setImageDimensions(w: number, h: number) {
    naturalWidth.value = w;
    naturalHeight.value = h;
  }

  function reset() {
    history.value = [];
    cropConfig.value = null;
    cropAspectId.value = FREE_ASPECT_ID;
    adjustments.value = {
      brightness: 0,
      contrast: 0,
      saturation: 0,
    };
    activeFilter.value = 'none';
    isShowingOriginal.value = false;
  }

  function importPipeline(ops: Op[]) {
    reset();

    for (const op of ops) {
      if (op.kind === OpKind.Crop) {
        cropConfig.value = op;
        cropAspectId.value = op.aspectId ?? FREE_ASPECT_ID;
      }

      if (op.kind === OpKind.Adjust) {
        adjustments.value = {
          brightness: op.brightness,
          contrast: op.contrast,
          saturation: op.saturation,
        };
      }

      if (op.kind === OpKind.Filter) {
        activeFilter.value = op.name;
      }
    }
  }

  return {
    originalFile,
    originalUrl,
    naturalWidth,
    naturalHeight,
    cropConfig,
    cropAspectId,
    adjustments,
    activeFilter,
    isCropMode,
    isShowingOriginal,
    previewColor,
    pipelineColor,
    pipeline,
    printInfo,
    history,
    canUndo,
    hasEdits,
    pushHistory,
    undo,
    loadFile,
    clearFile,
    setImageDimensions,
    reset,
    importPipeline,
  };
});
