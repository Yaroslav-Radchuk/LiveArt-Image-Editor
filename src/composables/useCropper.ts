import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { onBeforeUnmount } from 'vue';
import type { Ref } from 'vue';
import { useEditorStore } from '@/stores/editor';
import { FREE_ASPECT_ID, OpKind } from '@/types/editor';

const RESIZE_ACTIONS = new Set([
  'e',
  'w',
  's',
  'n',
  'ne',
  'nw',
  'se',
  'sw',
  'crop',
]);

export function useCropper(imgRef: Ref<HTMLImageElement | null>) {
  const store = useEditorStore();

  let cropperInstance: Cropper | null = null;
  let manualResizeDone = false;

  function destroyCropper() {
    cropperInstance?.destroy();
    cropperInstance = null;
  }

  function initCropper() {
    const img = imgRef.value;

    if (!img) {
      return;
    }

    destroyCropper();
    manualResizeDone = false;

    const prevCrop = store.cropConfig;
    const initialData = prevCrop
      ? {
          x: prevCrop.x * store.naturalWidth,
          y: prevCrop.y * store.naturalHeight,
          width: prevCrop.width * store.naturalWidth,
          height: prevCrop.height * store.naturalHeight,
        }
      : undefined;

    cropperInstance = new Cropper(img, {
      viewMode: 1,
      zoomable: false,
      autoCropArea: 1,
      data: initialData,
      cropstart(event) {
        const isPresetResize = RESIZE_ACTIONS.has(event.detail.action) && store.cropAspectId !== FREE_ASPECT_ID;

        if (!isPresetResize) {
          return;
        }

        manualResizeDone = true;
      },
    });
  }

  function applyCrop() {
    const img = imgRef.value;

    if (!cropperInstance || !img) {
      return;
    }

    const data = cropperInstance.getData(true);

    if (manualResizeDone) {
      store.cropAspectId = FREE_ASPECT_ID;
    }

    store.cropConfig = {
      kind: OpKind.Crop,
      x: data.x / img.naturalWidth,
      y: data.y / img.naturalHeight,
      width: data.width / img.naturalWidth,
      height: data.height / img.naturalHeight,
      aspectId: store.cropAspectId,
    };

    store.isCropMode = false;
    destroyCropper();
  }

  function cancelCrop() {
    store.isCropMode = false;
    destroyCropper();
  }

  function setAspectRatio(ratio: number) {
    manualResizeDone = false;
    cropperInstance?.setAspectRatio(ratio);
  }

  onBeforeUnmount(() => {
    destroyCropper();
  });

  return {
    initCropper,
    applyCrop,
    cancelCrop,
    setAspectRatio,
  };
}
