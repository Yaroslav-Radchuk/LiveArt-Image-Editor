<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEditorStore } from '@/stores/editor';
import { useToast, ToastVariant } from '@/composables/useToast';
import AdjustmentPanel from './editor/AdjustmentPanel.vue';
import FilterPanel from './editor/FilterPanel.vue';
import PrintInfoPanel from './editor/PrintInfoPanel.vue';
import CompareButton from './editor/CompareButton.vue';
import ActionButtons from './editor/ActionButtons.vue';
import CropPanel from './editor/CropPanel.vue';

const MIN_WIDTH = 240;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 300;

const store = useEditorStore();
const { show } = useToast();
const { t } = useI18n();

const width = ref(DEFAULT_WIDTH);
const isCollapsed = ref(false);
const isResizing = ref(false);
const resizeRef = ref<HTMLElement | null>(null);

const sidebarStyle = computed(() => {
  if (isCollapsed.value) {
    return {};
  }

  return { width: `${width.value}px` };
});

function clampWidth(value: number) {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, value));
}

function onResizeStart(e: PointerEvent) {
  isResizing.value = true;
  resizeRef.value?.setPointerCapture(e.pointerId);
}

function onResizeMove(e: PointerEvent) {
  if (!isResizing.value) {
    return;
  }

  width.value = clampWidth(window.innerWidth - e.clientX);
}

function onResizeEnd(e: PointerEvent) {
  isResizing.value = false;

  const handle = resizeRef.value;

  if (handle?.hasPointerCapture(e.pointerId)) {
    handle.releasePointerCapture(e.pointerId);
  }
}

function onLockedClick() {
  show(t('sidebar.uploadFirst'), ToastVariant.Info);
}
</script>

<template>
  <aside
    class="editor-sidebar"
    :class="{
      'editor-sidebar--collapsed': isCollapsed,
      'editor-sidebar--resizing': isResizing,
    }"
    :style="sidebarStyle"
  >
    <div
      v-if="!isCollapsed"
      ref="resizeRef"
      class="editor-sidebar__resize"
      role="separator"
      aria-orientation="vertical"
      :aria-label="t('sidebar.resize')"
      @pointerdown="onResizeStart"
      @pointermove="onResizeMove"
      @pointerup="onResizeEnd"
      @pointercancel="onResizeEnd"
    />

    <button
      v-if="isCollapsed"
      class="editor-sidebar__expand"
      :aria-label="t('sidebar.expand')"
      @click="isCollapsed = false"
    >
      <svg
        class="editor-sidebar__expand-icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <div
      v-else
      class="editor-sidebar__content"
    >
      <div class="editor-sidebar__top">
        <button
          v-if="!store.isCropMode"
          class="editor-sidebar__undo"
          :class="{ 'editor-sidebar__undo--active': store.canUndo }"
          :disabled="!store.canUndo"
          :aria-label="t('sidebar.undoChange')"
          :data-hint="t('sidebar.undoChange')"
          data-hint-pos="bottom"
          @click="store.undo()"
        >
          <svg
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
            <path d="M9 14 4 9l5-5" />
            <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
          </svg>
        </button>

        <button
          class="editor-sidebar__collapse"
          :aria-label="t('sidebar.collapse')"
          @click="isCollapsed = true"
        >
          <svg
            class="editor-sidebar__collapse-icon"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="13 17 18 12 13 7" />
            <polyline points="6 17 11 12 6 7" />
          </svg>
        </button>
      </div>

      <div class="editor-sidebar__body">
        <div
          class="editor-sidebar__panels"
          :class="{ 'editor-sidebar__panels--locked': !store.originalUrl }"
          :inert="!store.originalUrl"
        >
          <template v-if="!store.isCropMode">
            <AdjustmentPanel />

            <div class="editor-sidebar__divider" />

            <FilterPanel />

            <div class="editor-sidebar__divider" />

            <PrintInfoPanel />

            <div class="editor-sidebar__divider" />

            <CompareButton />

            <div class="editor-sidebar__divider" />

            <ActionButtons />
          </template>

          <template v-else>
            <CropPanel />
          </template>
        </div>

        <div
          v-if="!store.originalUrl"
          class="editor-sidebar__lock"
          @click="onLockedClick"
        />
      </div>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.editor-sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  border-left: 1px solid var(--color-iron);
  background: var(--surface-inkwell);
  transition: width var(--transition-slow);

  &--collapsed {
    width: 28px;
  }

  &--resizing {
    transition: none;
    user-select: none;

    .editor-sidebar__resize {
      background: color-mix(in srgb, var(--color-ember-gold) 40%, transparent);
    }
  }

  &__resize {
    position: absolute;
    top: 0;
    bottom: 0;
    left: -3px;
    width: 6px;
    cursor: col-resize;
    z-index: 10;
    transition: background var(--transition-fast);

    &:hover {
      background: color-mix(in srgb, var(--color-ember-gold) 25%, transparent);
    }
  }

  &__expand {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    color: var(--color-fog);
    cursor: pointer;
    transition:
      color var(--transition-fast),
      background var(--transition-fast);

    &:hover {
      color: var(--color-ember-gold);
      background: var(--color-graphite);
    }

    &-icon {
      animation: nudge-left 1.6s ease-in-out infinite;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    min-width: 0;
    padding: var(--spacing-10) 0 var(--spacing-16) var(--spacing-16);
  }

  &__top {
    display: flex;
    align-items: center;
    margin-bottom: var(--spacing-8);
    padding-right: var(--spacing-12);
    flex-shrink: 0;
  }

  &__undo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border: none;
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--color-steel);
    cursor: pointer;
    transition:
      color var(--transition-fast),
      background var(--transition-fast);

    &:disabled {
      opacity: 0.3;
      cursor: default;
      pointer-events: none;
    }

    &--active {
      color: var(--color-fog);

      &:hover {
        color: var(--color-ember-gold);
        background: color-mix(in srgb, var(--color-ember-gold) 10%, transparent);
      }
    }
  }

  &__collapse {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;
    width: 26px;
    height: 26px;
    border: none;
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--color-fog);
    cursor: pointer;
    transition:
      color var(--transition-fast),
      background var(--transition-fast);

    &:hover {
      color: var(--color-bone);
      background: var(--color-slate);
    }
  }

  &__body {
    position: relative;
    flex: 1;
    min-height: 0;
  }

  &__panels {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-24);
    padding-right: var(--spacing-14);
    transition: opacity var(--transition-base);
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;

    &:hover {
      scrollbar-color: var(--color-steel) transparent;
    }

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: transparent;
      border-radius: 2px;
    }

    &:hover::-webkit-scrollbar-thumb {
      background: var(--color-steel);
    }

    &--locked {
      opacity: 0.45;
    }
  }

  &__lock {
    position: absolute;
    inset: 0;
    cursor: not-allowed;
  }

  &__divider {
    height: 1px;
    background: var(--color-iron);
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    width: auto !important;
    max-height: 45dvh;
    border-left: none;
    border-top: 1px solid var(--color-iron);
    transition: none;

    &--collapsed {
      min-height: 36px;
    }

    &__resize {
      display: none;
    }

    &__collapse-icon {
      transform: rotate(90deg);
    }

    &__expand-icon {
      animation: none;
      transform: rotate(90deg);
    }
  }
}

</style>
