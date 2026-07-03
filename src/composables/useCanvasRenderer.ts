import { watch, onMounted, onBeforeUnmount } from 'vue';
import type { Ref } from 'vue';
import { useEditorStore } from '@/stores/editor';
import { applyColorPipeline } from '@/utils/colorMatrix';

function computeDrawRect(
  contentW: number,
  contentH: number,
  canvasW: number,
  canvasH: number,
): { x: number; y: number; w: number; h: number } {
  const contentAspect = contentW / contentH;
  const canvasAspect = canvasW / canvasH;

  if (contentAspect > canvasAspect) {
    const h = canvasW / contentAspect;

    return {
      x: 0,
      y: (canvasH - h) / 2,
      w: canvasW,
      h,
    };
  }

  const w = canvasH * contentAspect;

  return {
    x: (canvasW - w) / 2,
    y: 0,
    w,
    h: canvasH,
  };
}

export function useCanvasRenderer(
  canvasRef: Ref<HTMLCanvasElement | null>,
  imgRef: Ref<HTMLImageElement | null>,
) {
  const store = useEditorStore();

  function render() {
    const canvas = canvasRef.value;
    const img = imgRef.value;

    if (!canvas || !img || !store.originalUrl) {
      return;
    }

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    const containerW = canvas.offsetWidth;
    const containerH = canvas.offsetHeight;

    if (containerW === 0 || containerH === 0) {
      return;
    }

    const crop = store.isShowingOriginal ? null : store.cropConfig;
    const sx = crop ? crop.x * img.naturalWidth : 0;
    const sy = crop ? crop.y * img.naturalHeight : 0;
    const sw = crop ? crop.width * img.naturalWidth : img.naturalWidth;
    const sh = crop ? crop.height * img.naturalHeight : img.naturalHeight;

    if (sw === 0 || sh === 0) {
      return;
    }

    const dpr = window.devicePixelRatio;
    canvas.width = containerW * dpr;
    canvas.height = containerH * dpr;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rect = computeDrawRect(sw, sh, canvas.width, canvas.height);
    const rx = Math.round(rect.x);
    const ry = Math.round(rect.y);
    const rw = Math.round(rect.w);
    const rh = Math.round(rect.h);

    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, sw, sh, rx, ry, rw, rh);

    if (rw === 0 || rh === 0) {
      return;
    }

    const imageData = ctx.getImageData(rx, ry, rw, rh);

    applyColorPipeline(imageData, store.previewColor.tone, store.previewColor.matrix);
    ctx.putImageData(imageData, rx, ry);
  }

  let frameId = 0;

  function scheduleRender() {
    if (frameId !== 0) {
      return;
    }

    frameId = requestAnimationFrame(() => {
      frameId = 0;
      render();
    });
  }

  const resizeObserver = new ResizeObserver(() => {
    scheduleRender();
  });

  onMounted(() => {
    const canvas = canvasRef.value;

    if (canvas) {
      resizeObserver.observe(canvas);
    }
  });

  onBeforeUnmount(() => {
    resizeObserver.disconnect();

    if (frameId !== 0) {
      cancelAnimationFrame(frameId);
    }
  });

  watch(
    [
      () => store.previewColor,
      () => store.cropConfig,
      () => store.isShowingOriginal,
    ],
    scheduleRender,
    { flush: 'post' },
  );

  return { render };
}
