<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useEditorStore } from '@/stores/editor';
import { FILTER_NAMES } from '@/types/editor';
import type { FilterName } from '@/types/editor';

const store = useEditorStore();
const { t } = useI18n();

function selectFilter(name: FilterName) {
  if (store.activeFilter !== name) {
    store.pushHistory();
    store.activeFilter = name;
  }
}
</script>

<template>
  <div class="filter-panel">
    <p class="panel-title">{{ t('filters.title') }}</p>

    <div class="filter-panel__options">
      <button
        v-for="filter in FILTER_NAMES"
        :key="filter"
        class="filter-panel__option"
        :class="{ 'filter-panel__option--active': store.activeFilter === filter }"
        @click="selectFilter(filter)"
      >
        {{ t(`filters.${filter}`) }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.filter-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12);

  &__options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-8);
  }

  &__option {
    padding: var(--spacing-8) var(--spacing-4);
    border: 1px solid var(--color-iron);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-ash);
    font-size: var(--text-caption);
    cursor: pointer;
    transition:
      border-color var(--transition-fast),
      color var(--transition-fast),
      background var(--transition-fast);

    &:hover:not(.filter-panel__option--active) {
      border-color: var(--color-steel);
      color: var(--color-bone);
    }

    &--active {
      border-color: var(--color-ember-gold);
      color: var(--color-gold-text);
      background: color-mix(in srgb, var(--color-ember-gold) 8%, transparent);
      cursor: default;
    }
  }
}
</style>
