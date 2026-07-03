<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useEditorStore } from '@/stores/editor';

const store = useEditorStore();
const { t } = useI18n();
</script>

<template>
  <div
    v-if="store.naturalWidth > 0"
    class="print-info"
  >
    <div class="print-info__header">
      <p class="panel-title">{{ t('print.title') }}</p>
      <span
        class="print-info__help"
        tabindex="0"
        :aria-label="t('print.hint')"
        :data-hint="t('print.hint')"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
          />
          <line
            x1="12"
            y1="16"
            x2="12"
            y2="12"
          />
          <line
            x1="12"
            y1="8"
            x2="12.01"
            y2="8"
          />
        </svg>
      </span>
    </div>

    <p class="print-info__dimensions tnum">
      {{ store.naturalWidth }} × {{ store.naturalHeight }} px
    </p>

    <div class="print-info__sizes">
      <div
        v-for="size in store.printInfo"
        :key="size.label"
        class="print-info__row"
      >
        <span class="print-info__paper">{{ size.label }}</span>
        <span
          class="print-info__dpi tnum"
          :class="`print-info__dpi--${size.status}`"
        >
          <span
            class="print-info__dot"
            aria-hidden="true"
          />
          {{ size.dpi }} dpi · {{ t(`print.${size.status}`) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.print-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);

  &__header {
    display: flex;
    align-items: center;
    gap: var(--spacing-6);
  }

  &__help {
    display: flex;
    align-items: center;
    color: var(--color-fog);
    cursor: help;
    transition: color var(--transition-fast);

    &:hover,
    &:focus-visible {
      color: var(--color-pearl);
      outline: none;
    }
  }

  &__dimensions {
    font-size: var(--text-caption);
    color: var(--color-ash);
  }

  &__sizes {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-4);
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--spacing-8);
  }

  &__paper {
    font-size: var(--text-caption);
    color: var(--color-pearl);
    flex-shrink: 0;
  }

  &__dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: var(--radius-full);
    background: currentColor;
    margin-right: var(--spacing-4);
  }

  &__dpi {
    font-size: var(--text-caption);

    &--ready {
      color: var(--color-success);
    }

    &--acceptable {
      color: var(--color-warning);
    }

    &--low {
      color: var(--color-ash);
    }
  }
}
</style>
