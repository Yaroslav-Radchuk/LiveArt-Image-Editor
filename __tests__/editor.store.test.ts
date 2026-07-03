import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEditorStore } from '@/stores/editor';
import { IDENTITY_MATRIX, applyColorPipeline } from '@/utils/colorMatrix';

function grayPixel() {
  const imageData = new ImageData(1, 1);
  imageData.data.set([200, 50, 10, 255]);
  
  return imageData;
}

describe('useEditorStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('previewColor / pipelineColor', () => {
    it('is a pass-through at default state', () => {
      const store = useEditorStore();
      expect(store.previewColor.tone[100]).toBe(100);
      expect(store.previewColor.matrix).toEqual(IDENTITY_MATRIX);
    });

    it('falls back to the identity pipeline while isShowingOriginal is true', () => {
      const store = useEditorStore();
      store.adjustments.brightness = 50;
      store.activeFilter = 'invert';
      store.isShowingOriginal = true;
      expect(store.previewColor.tone[100]).toBe(100);
      expect(store.previewColor.matrix).toEqual(IDENTITY_MATRIX);
    });

    it('keeps pipelineColor derived from edits while comparing with the original', () => {
      const store = useEditorStore();
      store.adjustments.brightness = 50;
      store.isShowingOriginal = true;
      expect(store.pipelineColor.tone[100]).toBe(150);
    });

    it('reflects positive brightness in the tone curve', () => {
      const store = useEditorStore();
      store.adjustments.brightness = 50;
      expect(store.previewColor.tone[100]).toBe(150);
    });

    it('reflects negative contrast in the tone curve', () => {
      const store = useEditorStore();
      store.adjustments.contrast = -20;
      expect(store.previewColor.tone[228]).toBe(Math.round((228 - 128) * 0.8 + 128));
    });

    it('desaturates a pixel to grey when activeFilter is greyscale', () => {
      const store = useEditorStore();
      store.activeFilter = 'greyscale';
      const pixel = grayPixel();
      applyColorPipeline(pixel, store.previewColor.tone, store.previewColor.matrix);
      const [r, g, b] = Array.from(pixel.data);
      expect(r).toBe(g);
      expect(g).toBe(b);
    });

    it('inverts a pixel when activeFilter is invert', () => {
      const store = useEditorStore();
      store.activeFilter = 'invert';
      const pixel = grayPixel();
      applyColorPipeline(pixel, store.previewColor.tone, store.previewColor.matrix);
      expect(Array.from(pixel.data)).toEqual([55, 205, 245, 255]);
    });
  });

  describe('pipeline', () => {
    it('always contains an adjust op', () => {
      const store = useEditorStore();
      expect(store.pipeline.some((op) => op.kind === 'adjust')).toBe(true);
    });

    it('places crop op first when cropConfig is set', () => {
      const store = useEditorStore();
      store.cropConfig = {
        kind: 'crop',
        x: 0,
        y: 0,
        width: 0.5,
        height: 0.5,
      };
      expect(store.pipeline[0].kind).toBe('crop');
    });

    it('omits filter op when activeFilter is none', () => {
      const store = useEditorStore();
      expect(store.pipeline.some((op) => op.kind === 'filter')).toBe(false);
    });

    it('includes filter op when activeFilter is not none', () => {
      const store = useEditorStore();
      store.activeFilter = 'sepia';
      expect(store.pipeline.some((op) => op.kind === 'filter')).toBe(true);
    });
  });

  describe('reset', () => {
    it('clears adjustments, filter and crop to defaults', () => {
      const store = useEditorStore();
      store.adjustments.brightness = 50;
      store.activeFilter = 'sepia';
      store.cropConfig = {
        kind: 'crop',
        x: 0,
        y: 0,
        width: 0.5,
        height: 0.5,
      };
      store.reset();
      expect(store.adjustments.brightness).toBe(0);
      expect(store.activeFilter).toBe('none');
      expect(store.cropConfig).toBeNull();
    });
  });

  describe('file lifecycle', () => {
    beforeEach(() => {
      URL.createObjectURL = vi.fn((_obj: Blob | MediaSource) => 'blob:mock');
      URL.revokeObjectURL = vi.fn();
    });

    it('loadFile stores an object url and clears previous edits', () => {
      const store = useEditorStore();
      store.adjustments.brightness = 40;
      store.activeFilter = 'sepia';
      store.loadFile(new File([''], 'a.png', { type: 'image/png' }));
      expect(store.originalUrl).toBe('blob:mock');
      expect(store.adjustments.brightness).toBe(0);
      expect(store.activeFilter).toBe('none');
    });

    it('loadFile revokes the previous object url', () => {
      const store = useEditorStore();
      store.loadFile(new File([''], 'a.png', { type: 'image/png' }));
      store.loadFile(new File([''], 'b.png', { type: 'image/png' }));
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock');
    });

    it('clearFile revokes the url and returns to empty state', () => {
      const store = useEditorStore();
      store.loadFile(new File([''], 'a.png', { type: 'image/png' }));
      store.setImageDimensions(800, 600);
      store.clearFile();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock');
      expect(store.originalUrl).toBeNull();
      expect(store.naturalWidth).toBe(0);
    });
  });

  describe('history', () => {
    it('undo restores the previous state', () => {
      const store = useEditorStore();
      store.pushHistory();
      store.adjustments.brightness = 40;
      store.undo();
      expect(store.adjustments.brightness).toBe(0);
      expect(store.canUndo).toBe(false);
    });

    it('skips duplicate consecutive snapshots', () => {
      const store = useEditorStore();
      store.pushHistory();
      store.pushHistory();
      expect(store.history.length).toBe(1);
    });

    it('undo skips a stale snapshot equal to the current state', () => {
      const store = useEditorStore();
      store.pushHistory();
      store.adjustments.brightness = 40;
      store.pushHistory();
      store.undo();
      expect(store.adjustments.brightness).toBe(0);
    });

    it('undo restores cropAspectId alongside crop', () => {
      const store = useEditorStore();
      store.pushHistory();
      store.cropConfig = {
        kind: 'crop',
        x: 0,
        y: 0,
        width: 0.5,
        height: 0.5,
      };
      store.cropAspectId = '1:1';
      store.undo();
      expect(store.cropConfig).toBeNull();
      expect(store.cropAspectId).toBe('free');
    });
  });

  describe('importPipeline', () => {
    it('restores adjust values', () => {
      const store = useEditorStore();
      store.importPipeline([
        {
          kind: 'adjust',
          brightness: 20,
          contrast: -10,
          saturation: 30,
        },
      ]);
      expect(store.adjustments.brightness).toBe(20);
      expect(store.adjustments.contrast).toBe(-10);
    });

    it('restores filter', () => {
      const store = useEditorStore();
      store.importPipeline([{ kind: 'filter', name: 'sepia' }]);
      expect(store.activeFilter).toBe('sepia');
    });

    it('restores crop', () => {
      const store = useEditorStore();
      store.importPipeline([
        {
          kind: 'crop',
          x: 0.1,
          y: 0.1,
          width: 0.8,
          height: 0.8,
        },
      ]);
      expect(store.cropConfig?.width).toBe(0.8);
    });

    it('restores the crop aspect preset', () => {
      const store = useEditorStore();
      store.importPipeline([
        {
          kind: 'crop',
          x: 0.1,
          y: 0.1,
          width: 0.8,
          height: 0.8,
          aspectId: 'a3',
        },
      ]);
      expect(store.cropAspectId).toBe('a3');
    });

    it('falls back to free when the crop op has no aspect preset', () => {
      const store = useEditorStore();
      store.cropAspectId = 'a4';
      store.importPipeline([
        {
          kind: 'crop',
          x: 0.1,
          y: 0.1,
          width: 0.8,
          height: 0.8,
        },
      ]);
      expect(store.cropAspectId).toBe('free');
    });

    it('resets previous state before restoring', () => {
      const store = useEditorStore();
      store.adjustments.brightness = 99;
      store.importPipeline([
        {
          kind: 'adjust',
          brightness: 10,
          contrast: 0,
          saturation: 0,
        },
      ]);
      expect(store.adjustments.brightness).toBe(10);
    });
  });
});
