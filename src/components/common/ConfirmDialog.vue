<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
}

interface Emits {
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const cancelRef = ref<HTMLButtonElement | null>(null);

function onKeydown(e: KeyboardEvent) {
  const escapedWhileOpen = e.key === 'Escape' && props.open;

  if (escapedWhileOpen) {
    emit('cancel');
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
});

watch(() => props.open, async (open) => {
  if (!open) {
    return;
  }

  await nextTick();
  cancelRef.value?.focus();
});
</script>

<template>
  <Teleport to="body">
    <Transition name="confirm">
      <div
        v-if="open"
        class="confirm-dialog"
        @click.self="emit('cancel')"
      >
        <div
          class="confirm-dialog__card"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <div
            class="confirm-dialog__icon"
            aria-hidden="true"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line
                x1="12"
                y1="9"
                x2="12"
                y2="13"
              />
              <line
                x1="12"
                y1="17"
                x2="12.01"
                y2="17"
              />
            </svg>
          </div>

          <p class="confirm-dialog__title">{{ title }}</p>
          <p class="confirm-dialog__message">{{ message }}</p>

          <div class="confirm-dialog__actions">
            <button
              ref="cancelRef"
              class="confirm-dialog__cancel"
              @click="emit('cancel')"
            >
              {{ cancelLabel }}
            </button>

            <button
              class="confirm-dialog__confirm"
              @click="emit('confirm')"
            >
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.confirm {
  
  &-dialog {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-24);
    background: rgba(6, 6, 10, 0.55);
    backdrop-filter: blur(4px);
    z-index: var(--z-modal);

    &__card {
      width: 100%;
      max-width: 360px;
      padding: var(--spacing-28) var(--spacing-24) var(--spacing-24);
      border: 1px solid var(--color-iron);
      border-radius: var(--radius-lg);
      background: var(--surface-inkwell);
      box-shadow: var(--shadow-elevated);
      text-align: center;
    }

    &__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 46px;
      height: 46px;
      margin: 0 auto var(--spacing-16);
      border: 1px solid color-mix(in srgb, var(--color-danger) 25%, transparent);
      border-radius: var(--radius-full);
      background: color-mix(in srgb, var(--color-danger) 10%, transparent);
      color: var(--color-danger);
    }

    &__title {
      margin-bottom: var(--spacing-8);
      font-size: var(--text-body-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-bone);
    }

    &__message {
      margin-bottom: var(--spacing-24);
      font-size: var(--text-body);
      line-height: 1.6;
      color: var(--color-ash);
    }

    &__actions {
      display: flex;
      gap: var(--spacing-8);
    }

    &__cancel {
      flex: 1;
      padding: var(--spacing-10) var(--spacing-16);
      border: 1px solid var(--color-iron);
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

      &:hover {
        background: var(--color-slate);
        border-color: var(--color-steel);
        color: var(--color-bone);
      }
    }

    &__confirm {
      flex: 1;
      padding: var(--spacing-10) var(--spacing-16);
      border: 1px solid var(--color-danger);
      border-radius: var(--radius-md);
      background: var(--color-danger);
      color: #ffffff;
      font-size: var(--text-body);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition:
        background var(--transition-fast),
        border-color var(--transition-fast);

      &:hover {
        background: color-mix(in srgb, var(--color-danger) 88%, #000000);
        border-color: color-mix(in srgb, var(--color-danger) 88%, #000000);
      }
    }
  }

  &-enter-active,
  &-leave-active {
    transition: opacity var(--transition-base);

    .confirm-dialog__card {
      transition: transform var(--transition-base);
    }
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;

    .confirm-dialog__card {
      transform: scale(0.95) translateY(10px);
    }
  }
}
</style>
