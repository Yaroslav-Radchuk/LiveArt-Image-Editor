import { FILTER_NAMES, OpKind } from '@/types/editor';
import type { Op } from '@/types/editor';

export const OPERATIONS_VERSION = '1';

export interface OperationsPayload {
  version: string;
  operations: Op[];
}

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null;
}

export function isOp(val: unknown): val is Op {
  if (!isRecord(val)) {
    return false;
  }

  if (val['kind'] === OpKind.Crop) {
    const hasNumericBounds =
      typeof val['x'] === 'number' &&
      typeof val['y'] === 'number' &&
      typeof val['width'] === 'number' &&
      typeof val['height'] === 'number';

    const hasValidAspect = val['aspectId'] === undefined || typeof val['aspectId'] === 'string';

    return hasNumericBounds && hasValidAspect;
  }

  if (val['kind'] === OpKind.Adjust) {
    const hasNumericAdjustments =
      typeof val['brightness'] === 'number' &&
      typeof val['contrast'] === 'number' &&
      typeof val['saturation'] === 'number';

    return hasNumericAdjustments;
  }

  if (val['kind'] === OpKind.Filter) {
    return FILTER_NAMES.some((name) => name === val['name']);
  }

  return false;
}

export function isValidPayload(val: unknown): val is OperationsPayload {
  if (!isRecord(val)) {
    return false;
  }

  if (val['version'] !== OPERATIONS_VERSION) {
    return false;
  }

  if (!Array.isArray(val['operations'])) {
    return false;
  }

  return val['operations'].every(isOp);
}
