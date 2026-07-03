<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useToast } from '@/composables/useToast';

const {
  toasts,
  dismiss,
  runAction,
} = useToast();
const { t } = useI18n();
</script>

<template>
  <div
    class="toast-stack"
    role="status"
    aria-live="polite"
  >
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="`toast--${toast.variant}`"
      >
        <span
          class="toast__dot"
          :class="`toast__dot--${toast.variant}`"
          aria-hidden="true"
        />
        <span class="toast__message">{{ toast.message }}</span>

        <button
          v-if="toast.action"
          class="toast__action"
          @click="runAction(toast)"
        >
          {{ toast.action.label }}
        </button>

        <button
          class="toast__close"
          :aria-label="t('toast.dismiss')"
          @click="dismiss(toast.id)"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <line
              x1="18"
              y1="6"
              x2="6"
              y2="18"
            />
            <line
              x1="6"
              y1="6"
              x2="18"
              y2="18"
            />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped lang="scss">
.toast {
  display: flex;
  align-items: center;
  gap: var(--spacing-10);
  padding: var(--spacing-10) var(--spacing-14);
  border: 1px solid var(--color-iron);
  border-radius: var(--radius-lg);
  background: var(--color-graphite);
  box-shadow: var(--shadow-elevated);
  pointer-events: auto;

  &-stack {
    position: fixed;
    bottom: var(--spacing-24);
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-8);
    z-index: var(--z-toast);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    width: 100%;

    &-stack {
      width: calc(100vw - var(--spacing-16) * 2);
    }
  }

  &-enter-active,
  &-leave-active {
    transition:
      opacity var(--transition-base),
      transform var(--transition-base);
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
    transform: translateY(8px);
  }

  &--success {
    border-color: color-mix(in srgb, var(--color-success) 45%, var(--color-iron));
    background: color-mix(in srgb, var(--color-success) 10%, var(--color-graphite));
  }

  &--error {
    border-color: color-mix(in srgb, var(--color-danger) 45%, var(--color-iron));
    background: color-mix(in srgb, var(--color-danger) 10%, var(--color-graphite));
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: var(--radius-full);
    flex-shrink: 0;

    &--success {
      background: var(--color-success);
    }

    &--error {
      background: var(--color-danger);
    }

    &--info {
      background: var(--color-ember-gold);
    }
  }

  &__message {
    font-size: var(--text-body);
    color: var(--color-bone);
  }

  &__action {
    padding: var(--spacing-4) var(--spacing-10);
    border: 1px solid var(--color-steel);
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--color-gold-text);
    font-size: var(--text-caption);
    font-weight: var(--font-weight-semibold);
    cursor: pointer;
    transition:
      border-color var(--transition-fast),
      background var(--transition-fast);

    &:hover {
      border-color: var(--color-ember-gold);
      background: color-mix(in srgb, var(--color-ember-gold) 8%, transparent);
    }
  }

  &__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
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
}
</style>
