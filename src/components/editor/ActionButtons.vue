<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEditorStore } from '@/stores/editor';
import { useImageExport } from '@/composables/useImageExport';
import { useToast, ToastVariant } from '@/composables/useToast';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

const PendingAction = {
  Reset: 'reset',
  Remove: 'remove',
} as const;

type PendingAction = (typeof PendingAction)[keyof typeof PendingAction];

const store = useEditorStore();
const { importJson } = useImageExport();
const { show } = useToast();
const { t } = useI18n();

const jsonInputRef = ref<HTMLInputElement | null>(null);
const pendingAction = ref<PendingAction | null>(null);

const isConfirmOpen = computed(() => pendingAction.value !== null);
const canReset = computed(() => store.originalUrl !== null && store.hasEdits);

const confirmContent = computed(() => {
  if (pendingAction.value === PendingAction.Remove) {
    return {
      title: t('confirm.removeTitle'),
      message: t('confirm.removeMessage'),
      confirmLabel: t('confirm.removeConfirm'),
    };
  }

  return {
    title: t('confirm.resetTitle'),
    message: t('confirm.resetMessage'),
    confirmLabel: t('confirm.resetConfirm'),
  };
});

function openJsonPicker() {
  jsonInputRef.value?.click();
}

function confirmReset() {
  const snapshot = store.pipeline.map((op) => ({ ...op }));

  store.reset();

  show(t('actions.resetDone'), ToastVariant.Success, {
    label: t('actions.undo'),
    handler: () => {
      store.importPipeline(snapshot);
    },
  });
}

function confirmRemove() {
  store.clearFile();
  
  show(t('actions.removeDone'), ToastVariant.Success);
}

function onConfirm() {
  if (pendingAction.value === PendingAction.Reset) {
    confirmReset();
  }

  if (pendingAction.value === PendingAction.Remove) {
    confirmRemove();
  }

  pendingAction.value = null;
}

async function onJsonFileChange() {
  const input = jsonInputRef.value;

  if (!input) {
    return;
  }

  const file = input.files?.[0];
  input.value = '';

  if (!file) {
    return;
  }

  const ok = await importJson(file);

  if (ok) {
    show(t('actions.importSuccess'), ToastVariant.Success);
  } else {
    show(t('actions.importInvalid'), ToastVariant.Error);
  }
}
</script>

<template>
  <div class="action-buttons">
    <button
      class="action-btn"
      :disabled="!store.originalUrl"
      @click="store.isCropMode = true"
    >
      <span
        class="action-btn__icon"
        aria-hidden="true"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M6 2v14a2 2 0 0 0 2 2h14" />
          <path d="M18 22V8a2 2 0 0 0-2-2H2" />
        </svg>
      </span>
      <span class="action-btn__label">{{ t('actions.crop') }}</span>
    </button>

    <button
      class="action-btn"
      :data-hint="t('actions.loadJsonHint')"
      :disabled="!store.originalUrl"
      @click="openJsonPicker"
    >
      <span
        class="action-btn__icon"
        aria-hidden="true"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
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
      </span>
      <span class="action-btn__label">{{ t('actions.loadJson') }}</span>
    </button>

    <input
      ref="jsonInputRef"
      class="action-buttons__hidden-input"
      type="file"
      accept=".json,application/json"
      aria-hidden="true"
      tabindex="-1"
      @change="onJsonFileChange"
    />

    <button
      class="action-btn action-btn--reset"
      :data-hint="t('actions.resetHint')"
      :disabled="!canReset"
      @click="pendingAction = PendingAction.Reset"
    >
      <span
        class="action-btn__icon"
        aria-hidden="true"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </span>
      <span class="action-btn__label">{{ t('actions.reset') }}</span>
    </button>

    <button
      class="action-btn action-btn--remove"
      :data-hint="t('actions.removeImageHint')"
      :disabled="!store.originalUrl"
      @click="pendingAction = PendingAction.Remove"
    >
      <span
        class="action-btn__icon"
        aria-hidden="true"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6"/>
          <path d="M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </span>
      <span class="action-btn__label">{{ t('actions.removeImage') }}</span>
    </button>

    <ConfirmDialog
      :open="isConfirmOpen"
      :title="confirmContent.title"
      :message="confirmContent.message"
      :confirm-label="confirmContent.confirmLabel"
      :cancel-label="t('confirm.cancel')"
      @confirm="onConfirm"
      @cancel="pendingAction = null"
    />
  </div>
</template>

<style scoped lang="scss">
.action {

  &-buttons {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-6);

    &__hidden-input {
      display: none;
    }
  }

  &-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-10);
    width: 100%;
    padding: var(--spacing-10) var(--spacing-12);
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    background: var(--color-graphite);
    color: var(--color-pearl);
    font-size: var(--text-body);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition:
      background var(--transition-fast),
      border-color var(--transition-fast),
      color var(--transition-fast);
    text-align: left;

    &:hover:not(:disabled) {
      background: var(--color-slate);
      border-color: var(--color-iron);
      color: var(--color-bone);
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    &--reset,
    &--remove {
      color: color-mix(in srgb, var(--color-danger) 70%, var(--color-pearl));
      background: color-mix(in srgb, var(--color-danger) 6%, transparent);

      &:hover:not(:disabled) {
        background: color-mix(in srgb, var(--color-danger) 12%, transparent);
        border-color: color-mix(in srgb, var(--color-danger) 30%, transparent);
        color: color-mix(in srgb, var(--color-danger) 85%, var(--color-paper));
      }
    }

    &--reset {
      margin-top: var(--spacing-14);
    }

    &__icon {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      opacity: 0.7;

      .action-btn:hover:not(:disabled) & {
        opacity: 1;
      }
    }
  }
}
</style>
