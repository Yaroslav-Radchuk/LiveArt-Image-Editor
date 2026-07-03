<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEditorStore } from '@/stores/editor';
import { useImageExport } from '@/composables/useImageExport';
import { useToast, ToastVariant } from '@/composables/useToast';

interface ExportItem {
  fn: () => Promise<void> | void;
  nameKey: string;
  descKey: string;
  successKey: string;
  icon: 'image' | 'pdf' | 'file';
}

const store = useEditorStore();
const {
  exportPng,
  exportJpeg,
  exportWebP,
  exportPdf,
  exportJson,
} = useImageExport();
const { show } = useToast();
const { t } = useI18n();

const EXPORT_ITEMS: (ExportItem | null)[] = [
  {
    fn: exportPng,
    nameKey: 'header.png',
    descKey: 'header.pngDesc',
    successKey: 'header.pngExported',
    icon: 'image',
  },
  {
    fn: exportJpeg,
    nameKey: 'header.jpeg',
    descKey: 'header.jpegDesc',
    successKey: 'header.jpegExported',
    icon: 'image',
  },
  {
    fn: exportWebP,
    nameKey: 'header.webp',
    descKey: 'header.webpDesc',
    successKey: 'header.webpExported',
    icon: 'image',
  },
  null,
  {
    fn: exportPdf,
    nameKey: 'header.pdf',
    descKey: 'header.pdfDesc',
    successKey: 'header.pdfExported',
    icon: 'pdf',
  },
  null,
  {
    fn: exportJson,
    nameKey: 'header.json',
    descKey: 'header.jsonDesc',
    successKey: 'header.jsonExported',
    icon: 'file',
  },
];

const isOpen = ref(false);
const isExporting = ref(false);
const dropdownRef = ref<HTMLDivElement | null>(null);

const isTriggerDisabled = computed(() => !store.originalUrl || isExporting.value);

function toggle() {
  if (!store.originalUrl) {
    return;
  }

  isOpen.value = !isOpen.value;
}

function close() {
  isOpen.value = false;
}

async function runExport(exportFn: () => Promise<void> | void, successKey: string) {
  isExporting.value = true;
  close();

  try {
    await exportFn();
    show(t(successKey), ToastVariant.Success);
  } catch {
    show(t('header.exportFailed'), ToastVariant.Error);
  } finally {
    isExporting.value = false;
  }
}

function onClickOutside(e: MouseEvent) {
  const target = e.target;

  if (!(target instanceof Node)) {
    return;
  }

  if (!dropdownRef.value?.contains(target)) {
    close();
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onClickOutside);
});
</script>

<template>
  <div
    ref="dropdownRef"
    class="export-menu"
    @keydown.esc="close"
  >
    <button
      class="export-menu__trigger"
      :class="{ 'export-menu__trigger--open': isOpen }"
      aria-haspopup="menu"
      :aria-expanded="isOpen"
      :disabled="isTriggerDisabled"
      @click="toggle"
    >
      <span
        v-if="isExporting"
        class="export-menu__spinner"
        aria-hidden="true"
      />
      <svg
        v-else
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
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
      <span>{{ t('header.export') }}</span>
      <svg
        class="export-menu__chevron"
        :class="{ 'export-menu__chevron--up': isOpen }"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="export-menu__dropdown"
        role="menu"
      >
        <template
          v-for="(item, i) in EXPORT_ITEMS"
          :key="i"
        >
          <div
            v-if="!item"
            class="export-menu__separator"
          />

          <button
            v-else
            class="export-menu__item"
            role="menuitem"
            @click="runExport(item.fn, item.successKey)"
          >
            <span
              class="export-menu__item-icon"
              aria-hidden="true"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <template v-if="item.icon === 'image'">
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="2"
                  />
                  <circle
                    cx="8.5"
                    cy="8.5"
                    r="1.5"
                  />
                  <polyline points="21 15 16 10 5 21" />
                </template>

                <template v-else-if="item.icon === 'pdf'">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line
                    x1="8"
                    y1="13"
                    x2="16"
                    y2="13"
                  />
                  <line
                    x1="8"
                    y1="17"
                    x2="16"
                    y2="17"
                  />
                </template>

                <template v-else>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </template>
              </svg>
            </span>

            <span class="export-menu__item-body">
              <span class="export-menu__item-name">{{ t(item.nameKey) }}</span>
              <span class="export-menu__item-desc">{{ t(item.descKey) }}</span>
            </span>
          </button>
        </template>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.export-menu {
  position: relative;

  &__trigger {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-8);
    padding: var(--spacing-8) var(--spacing-14);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-iron);
    background: var(--color-graphite);
    color: var(--color-bone);
    font-size: var(--text-body);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition:
      background var(--transition-fast),
      border-color var(--transition-fast),
      color var(--transition-fast);

    &:hover:not(:disabled):not(.export-menu__trigger--open) {
      background: var(--color-slate);
      border-color: var(--color-steel);
    }

    &--open {
      background: var(--color-slate);
      border-color: var(--color-ember-gold);
      color: var(--color-gold-text);
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  }

  &__chevron {
    transition: transform var(--transition-fast);

    &--up {
      transform: rotate(180deg);
    }
  }

  &__spinner {
    width: 14px;
    height: 14px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + var(--spacing-8));
    right: 0;
    width: 240px;
    background: var(--color-graphite);
    border: 1px solid var(--color-iron);
    border-radius: var(--radius-lg);
    padding: var(--spacing-6);
    box-shadow: var(--shadow-elevated);
    z-index: var(--z-dropdown);
  }

  &__item {
    display: flex;
    align-items: center;
    gap: var(--spacing-12);
    width: 100%;
    padding: var(--spacing-10) var(--spacing-10);
    border: none;
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--color-pearl);
    cursor: pointer;
    text-align: left;
    transition:
      background var(--transition-fast),
      color var(--transition-fast);

    &:hover {
      background: var(--color-slate);
      color: var(--color-bone);
    }
  }

  &__item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 30px;
    height: 30px;
    border-radius: var(--radius-md);
    background: var(--color-slate);
    color: var(--color-pearl);

    .export-menu__item:hover & {
      background: var(--color-iron);
      color: var(--color-bone);
    }
  }

  &__item-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__item-name {
    font-size: var(--text-body);
    font-weight: var(--font-weight-medium);
    line-height: 1;
  }

  &__item-desc {
    font-size: var(--text-caption);
    color: var(--color-fog);
    line-height: 1;

    .export-menu__item:hover & {
      color: var(--color-ash);
    }
  }

  &__separator {
    height: 1px;
    background: var(--color-iron);
    margin: var(--spacing-6) 0;
  }
}

.dropdown {
  
  &-enter-active,
  &-leave-active {
    transition:
      opacity var(--transition-fast),
      transform var(--transition-fast);
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
    transform: translateY(-6px);
  }
}
</style>
