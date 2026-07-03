<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useEditorStore } from '@/stores/editor';
import { ADJUSTMENT_LIMIT } from '@/types/editor';
import type { AdjustmentValues } from '@/types/editor';

const store = useEditorStore();
const { t } = useI18n();

const SLIDERS: (keyof AdjustmentValues)[] = [
  'brightness',
  'contrast',
  'saturation',
];

const SLIDER_KEYS = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'PageUp',
  'PageDown',
]);

function onSliderKeydown(e: KeyboardEvent) {
  const isFreshSliderKey = !e.repeat && SLIDER_KEYS.has(e.key);

  if (isFreshSliderKey) {
    store.pushHistory();
  }
}
</script>

<template>
  <div class="adjustment-panel">
    <p class="panel-title adjustment-panel__title">{{ t('adjust.title') }}</p>

    <div
      v-for="slider in SLIDERS"
      :key="slider"
      class="adjustment-panel__row"
    >
      <div class="adjustment-panel__header">
        <span class="adjustment-panel__label">{{ t(`adjust.${slider}`) }}</span>
        <button
          class="adjustment-panel__value tnum"
          :aria-label="t('adjust.resetAria', { name: t(`adjust.${slider}`) })"
          :data-hint="t('adjust.resetHint')"
          data-hint-align="right"
          @click="() => { store.pushHistory(); store.adjustments[slider] = 0 }"
        >
          {{ store.adjustments[slider] }}
        </button>
      </div>
      <div
        @pointerdown="store.pushHistory()"
        @keydown.capture="onSliderKeydown"
      >
        <v-slider
          v-model="store.adjustments[slider]"
          :name="t(`adjust.${slider}`)"
          :min="-ADJUSTMENT_LIMIT"
          :max="ADJUSTMENT_LIMIT"
          :step="1"
          hide-details
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.adjustment-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);

  &__title {
    margin-bottom: var(--spacing-8);
  }

  &__row {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-4);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__label {
    font-size: var(--text-body);
    color: var(--color-pearl);
  }

  :deep(.v-slider.v-input--horizontal) {
    margin-inline: 20px;
  }

  &__value {
    min-width: 32px;
    padding: var(--spacing-4) var(--spacing-6);
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-ash);
    font-size: var(--text-caption);
    text-align: right;
    cursor: pointer;
    transition:
      color var(--transition-fast),
      background var(--transition-fast);

    &:hover {
      color: var(--color-bone);
      background: var(--color-slate);
    }
  }
}
</style>
