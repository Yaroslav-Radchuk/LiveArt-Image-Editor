<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useEditorStore } from '@/stores/editor';

const store = useEditorStore();
const { t } = useI18n();

function startCompare() {
  store.isShowingOriginal = true;
}

function stopCompare() {
  store.isShowingOriginal = false;
}

function onHoldKeydown(e: KeyboardEvent) {
  if (e.repeat) {
    return;
  }

  startCompare();
}
</script>

<template>
  <button
    class="compare-btn"
    :class="{
      'compare-btn--active': store.isShowingOriginal,
      'compare-btn--idle': !store.originalUrl,
    }"
    :aria-label="t('compare.aria')"
    @mousedown="startCompare"
    @mouseup="stopCompare"
    @mouseleave="stopCompare"
    @touchstart.prevent="startCompare"
    @touchend="stopCompare"
    @keydown.space.prevent="onHoldKeydown"
    @keyup.space="stopCompare"
    @keydown.enter.prevent="onHoldKeydown"
    @keyup.enter="stopCompare"
    @blur="stopCompare"
  >
    {{ t('compare.label') }}
  </button>
</template>

<style scoped lang="scss">
.compare-btn {
  display: block;
  width: calc(100% - 32px);
  margin-inline: auto;
  padding: var(--spacing-8) var(--spacing-14);
  border: 1px solid var(--color-iron);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-ash);
  font-size: var(--text-body);
  font-family: var(--font-inter);
  cursor: pointer;
  transition:
    border-color var(--transition-fast),
    color var(--transition-fast),
    background var(--transition-fast);
  user-select: none;
  animation: soft-pulse 2.6s ease-in-out infinite;

  &--active,
  &--idle {
    animation: none;
  }

  &:hover:not(.compare-btn--active) {
    border-color: color-mix(in srgb, var(--color-ember-gold) 60%, transparent);
    color: var(--color-gold-text);
  }

  &--active {
    border-color: var(--color-ember-gold);
    color: var(--color-gold-text);
    background: color-mix(in srgb, var(--color-ember-gold) 6%, transparent);
  }
}

[data-theme='light'] {
  .compare-btn {
    border-color: color-mix(in srgb, var(--color-ember-gold) 40%, transparent);
    background: color-mix(in srgb, var(--color-ember-gold) 7%, transparent);
    color: var(--color-gold-text);
    font-weight: var(--font-weight-medium);

    &:hover:not(.compare-btn--active) {
      border-color: var(--color-ember-gold);
      background: color-mix(in srgb, var(--color-ember-gold) 12%, transparent);
      color: var(--color-gold-text);
    }

    &--active {
      border-color: var(--color-ember-gold);
      background: color-mix(in srgb, var(--color-ember-gold) 18%, transparent);
    }
  }
}
</style>
