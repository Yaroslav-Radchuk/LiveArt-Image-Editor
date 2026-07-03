<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEditorStore } from '@/stores/editor';
import { useCanvasRenderer } from '@/composables/useCanvasRenderer';
import { useCropper } from '@/composables/useCropper';
import { useToast, ToastVariant } from '@/composables/useToast';
import { provideCropApi, clearCropApi } from '@/composables/useCropControls';

const store = useEditorStore();
const { show } = useToast();
const { t } = useI18n();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const imgRef = ref<HTMLImageElement | null>(null);

const { render } = useCanvasRenderer(canvasRef, imgRef);
const {
  initCropper,
  applyCrop,
  cancelCrop,
  setAspectRatio,
} = useCropper(imgRef);

function loadImageUrl(url: string) {
  const img = imgRef.value;

  if (!img) {
    return;
  }

  img.onload = () => {
    const loaded = imgRef.value;

    if (!loaded) {
      return;
    }

    store.setImageDimensions(loaded.naturalWidth, loaded.naturalHeight);
    render();
  };

  img.onerror = () => {
    show(t('upload.errors.corrupted'), ToastVariant.Error);
    store.clearFile();
  };

  img.src = url;
}

function onKeydown(e: KeyboardEvent) {
  const escapedCropMode = e.key === 'Escape' && store.isCropMode;

  if (escapedCropMode) {
    cancelCrop();
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown);

  if (store.originalUrl) {
    loadImageUrl(store.originalUrl);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
});

watch(() => store.originalUrl, (url) => {
  if (!url) {
    return;
  }

  loadImageUrl(url);
});

watch(() => store.isCropMode, (active) => {
  if (active) {
    initCropper();
    provideCropApi({
      apply: applyCrop,
      cancel: cancelCrop,
      setAspect: setAspectRatio,
    });
  } else {
    clearCropApi();
  }
}, { flush: 'post' });
</script>

<template>
  <div class="editor-canvas">
    <canvas
      v-show="!store.isCropMode"
      ref="canvasRef"
      class="editor-canvas__canvas"
      role="img"
      :aria-label="t('canvas.aria')"
    />
    <img
      ref="imgRef"
      class="editor-canvas__img"
      :class="{ 'editor-canvas__img--visible': store.isCropMode }"
      :alt="store.isCropMode ? t('canvas.cropAria') : ''"
    />

  </div>
</template>

<style scoped lang="scss">
.editor-canvas {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
  background: var(--surface-canvas);
  overflow: hidden;
  animation: fade-in var(--transition-slow) both;

  &__canvas {
    display: block;
    flex: 1;
    min-height: 0;
    width: 100%;
  }

  &__img {
    display: none;
    width: 100%;
    flex: 1;
    min-height: 0;
    object-fit: contain;
    object-position: center;

    &--visible {
      display: block;
    }
  }
}
</style>
