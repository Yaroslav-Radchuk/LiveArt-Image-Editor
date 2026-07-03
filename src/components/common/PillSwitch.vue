<script setup lang="ts" generic="T extends string">
import { computed } from 'vue';

interface Props {
  options: T[];
  modelValue: T;
  label: string;
  labels?: Partial<Record<T, string>>;
  icon?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: T];
}>();

const activeIdx = computed(() => props.options.findIndex((option) => option === props.modelValue));
</script>

<template>
  <div
    class="pill-switch"
    role="group"
    :aria-label="label"
  >
    <span
      class="pill-switch__pill"
      :style="{
        '--pill-pos': activeIdx,
        '--pill-count': options.length,
      }"
      aria-hidden="true"
    />
    <button
      v-for="option in options"
      :key="option"
      class="pill-switch__btn"
      :class="{
        'pill-switch__btn--active': option === modelValue,
        'pill-switch__btn--icon': icon,
      }"
      :aria-label="labels?.[option]"
      :aria-pressed="option === modelValue"
      @click="emit('update:modelValue', option)"
    >
      <slot :option="option">{{ option.toUpperCase() }}</slot>
    </button>
  </div>
</template>

<style scoped lang="scss">
.pill-switch {
  position: relative;
  display: inline-flex;
  background: var(--color-graphite);
  border: 1px solid var(--color-iron);
  border-radius: var(--radius-full);
  padding: 2px;

  &__pill {
    position: absolute;
    top: 2px;
    bottom: 2px;
    left: 2px;
    width: calc((100% - 4px) / var(--pill-count, 2));
    border-radius: var(--radius-full);
    background: var(--color-slate);
    border: 1px solid var(--color-steel);
    transform: translateX(calc(var(--pill-pos, 0) * 100%));
    transition: transform var(--transition-base);
    pointer-events: none;
  }

  &__btn {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-4) var(--spacing-10);
    border: none;
    border-radius: var(--radius-full);
    background: transparent;
    color: var(--color-fog);
    font-size: var(--text-caption);
    font-weight: var(--font-weight-semibold);
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: color var(--transition-fast);
    white-space: nowrap;

    &:hover:not(.pill-switch__btn--active) {
      color: var(--color-pearl);
    }

    &--active {
      color: var(--color-gold-text);
      cursor: default;
    }

    &--icon {
      padding: var(--spacing-4) var(--spacing-8);
    }
  }
}
</style>
