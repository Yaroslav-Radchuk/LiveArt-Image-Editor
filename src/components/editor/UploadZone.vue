<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast, ToastVariant } from '@/composables/useToast';
import { validateImageFile, ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from '@/utils/fileValidation';

interface Emits {
  (e: 'file', file: File): void;
}

const ACCEPT_ATTR = ACCEPTED_IMAGE_TYPES.join(',');

const emit = defineEmits<Emits>();

const { show } = useToast();
const { t } = useI18n();

const isDragging = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);
const zoneRef = ref<HTMLElement | null>(null);

function handleFile(file: File) {
  const error = validateImageFile(file);

  if (error) {
    show(t(`upload.errors.${error}`, { max: MAX_IMAGE_SIZE_MB }), ToastVariant.Error);

    return;
  }

  emit('file', file);
}

function onDragover(e: DragEvent) {
  e.preventDefault();
  isDragging.value = true;
}

function onDragleave(e: DragEvent) {
  const movedInsideZone = e.relatedTarget instanceof Node && zoneRef.value?.contains(e.relatedTarget);

  if (movedInsideZone) {
    return;
  }

  isDragging.value = false;
}

function onDrop(e: DragEvent) {
  e.preventDefault();
  isDragging.value = false;

  const file = e.dataTransfer?.files[0];

  if (file) {
    handleFile(file);
  }
}

function onInputChange() {
  const input = inputRef.value;

  if (!input) {
    return;
  }

  const file = input.files?.[0];
  input.value = '';

  if (file) {
    handleFile(file);
  }
}

function openPicker() {
  inputRef.value?.click();
}
</script>

<template>
  <div
    ref="zoneRef"
    class="upload-zone"
    :class="{ 'upload-zone--dragging': isDragging }"
    role="button"
    :aria-label="t('upload.aria')"
    tabindex="0"
    @dragover="onDragover"
    @dragleave="onDragleave"
    @drop="onDrop"
    @click="openPicker"
    @keydown.enter="openPicker"
    @keydown.space.prevent="openPicker"
  >
    <input
      ref="inputRef"
      class="upload-zone__input"
      type="file"
      :accept="ACCEPT_ATTR"
      aria-hidden="true"
      tabindex="-1"
      @change="onInputChange"
    />
    <div
      class="upload-zone__icon"
      aria-hidden="true"
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line
          x1="12"
          y1="3"
          x2="12"
          y2="15"
        />
      </svg>
    </div>
    <p class="upload-zone__label">{{ t('upload.label') }}</p>
    <p class="upload-zone__hint">{{ t('upload.hint', { max: MAX_IMAGE_SIZE_MB }) }}</p>
  </div>
</template>

<style scoped lang="scss">
.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-12);
  width: 100%;
  height: 100%;
  border: 1px dashed var(--color-gold-bright);
  border-radius: var(--radius-lg);
  cursor: pointer;
  color: var(--color-ash);
  animation: fade-in var(--transition-slow) both;
  transition:
    border-color var(--transition-fast),
    color var(--transition-fast);

  &:hover,
  &:focus-visible {
    border-color: var(--color-ember-gold);
    color: var(--color-bone);
    outline: none;
  }

  &--dragging {
    border-color: var(--color-ember-gold);
    color: var(--color-ember-gold);
    background: color-mix(in srgb, var(--color-ember-gold) 4%, transparent);
  }

  &__input {
    display: none;
  }

  &__icon {
    opacity: 0.6;
  }

  &__label {
    font-size: var(--text-body-lg);
    font-weight: var(--font-weight-medium);
    color: var(--color-bone);
  }

  &__label,
  &__hint {
    padding-inline: var(--spacing-16);
    text-align: center;
  }

  &__hint {
    font-size: var(--text-caption);
    color: var(--color-fog);
  }
}
</style>
