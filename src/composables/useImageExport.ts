import { useEditorStore } from '@/stores/editor';
import { MM_PER_INCH } from '@/utils/units';
import { OPERATIONS_VERSION, isValidPayload } from '@/utils/operations';
import { applyColorPipeline } from '@/utils/colorMatrix';

const JPEG_QUALITY = 0.92;
const WEBP_QUALITY = 0.90;
const PDF_DPI = 96;
const REVOKE_DELAY_MS = 1000;

function triggerDownload(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, REVOKE_DELAY_MS);
}

export function useImageExport() {
  const store = useEditorStore();

  async function buildOffscreenCanvas(fillWhite = false) {
    if (!store.originalUrl) {
      return null;
    }

    const img = new Image();
    img.src = store.originalUrl;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('image load failed'));
    });

    const crop = store.cropConfig;
    const sx = crop ? Math.round(crop.x * img.naturalWidth) : 0;
    const sy = crop ? Math.round(crop.y * img.naturalHeight) : 0;
    const sw = crop ? Math.round(crop.width * img.naturalWidth) : img.naturalWidth;
    const sh = crop ? Math.round(crop.height * img.naturalHeight) : img.naturalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = sw;
    canvas.height = sh;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

    const imageData = ctx.getImageData(0, 0, sw, sh);

    applyColorPipeline(imageData, store.pipelineColor.tone, store.pipelineColor.matrix);
    ctx.putImageData(imageData, 0, 0);

    if (!fillWhite) {
      return {
        canvas,
        sw,
        sh,
      };
    }

    const flattened = document.createElement('canvas');
    flattened.width = sw;
    flattened.height = sh;

    const flatCtx = flattened.getContext('2d');

    if (!flatCtx) {
      return null;
    }

    flatCtx.fillStyle = '#ffffff';
    flatCtx.fillRect(0, 0, sw, sh);
    flatCtx.drawImage(canvas, 0, 0);

    return {
      canvas: flattened,
      sw,
      sh,
    };
  }

  async function exportImage(
    mime: 'image/png' | 'image/jpeg' | 'image/webp',
    filename: string,
    quality?: number,
  ) {
    const result = await buildOffscreenCanvas(mime === 'image/jpeg');

    if (!result) {
      return;
    }

    const blob = await new Promise<Blob | null>((resolve) => {
      result.canvas.toBlob(resolve, mime, quality);
    });

    if (!blob) {
      throw new Error('canvas export failed');
    }

    const url = URL.createObjectURL(blob);
    triggerDownload(url, filename);
  }

  async function exportPng() {
    await exportImage('image/png', 'liveart-export.png');
  }

  async function exportJpeg() {
    await exportImage('image/jpeg', 'liveart-export.jpg', JPEG_QUALITY);
  }

  async function exportWebP() {
    await exportImage('image/webp', 'liveart-export.webp', WEBP_QUALITY);
  }

  async function exportPdf() {
    const result = await buildOffscreenCanvas(true);

    if (!result) {
      return;
    }

    const {
      canvas,
      sw,
      sh,
    } = result;
    const widthMm = (sw / PDF_DPI) * MM_PER_INCH;
    const heightMm = (sh / PDF_DPI) * MM_PER_INCH;

    const { jsPDF } = await import('jspdf');

    const doc = new jsPDF({
      orientation: widthMm >= heightMm ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [widthMm, heightMm],
    });

    const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
    doc.addImage(dataUrl, 'JPEG', 0, 0, widthMm, heightMm);
    doc.save('liveart-export.pdf');
  }

  function exportJson() {
    const payload = {
      version: OPERATIONS_VERSION,
      operations: store.pipeline,
    };

    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, 'liveart-operations.json');
  }

  async function importJson(file: File): Promise<boolean> {
    const text = await file.text();
    let parsed: unknown;

    try {
      parsed = JSON.parse(text);
    } catch {
      return false;
    }

    if (!isValidPayload(parsed)) {
      return false;
    }

    store.importPipeline(parsed.operations);
    
    return true;
  }

  return {
    exportPng,
    exportJpeg,
    exportWebP,
    exportPdf,
    exportJson,
    importJson,
  };
}
