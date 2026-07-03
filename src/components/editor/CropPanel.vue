<script setup lang="ts">
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCropControls } from '@/composables/useCropControls';
import { useEditorStore } from '@/stores/editor';
import { FREE_ASPECT_ID } from '@/types/editor';

const { t } = useI18n();
const store = useEditorStore();
const cropApi = useCropControls();

const presets = computed(() => [
  {
    id: FREE_ASPECT_ID,
    label: t('crop.free'),
    ratio: NaN,
  },
  {
    id: '1:1',
    label: '1:1',
    ratio: 1,
  },
  {
    id: '4:3',
    label: '4:3',
    ratio: 4 / 3,
  },
  {
    id: '16:9',
    label: '16:9',
    ratio: 16 / 9,
  },
  {
    id: 'a4',
    label: 'A4',
    ratio: 210 / 297,
  },
  {
    id: 'a3',
    label: 'A3',
    ratio: 297 / 420,
  },
]);

function ratioOf(id: string) {
  const preset = presets.value.find((p) => p.id === id);

  return preset ? preset.ratio : NaN;
}

function selectPreset(id: string, ratio: number) {
  store.cropAspectId = id;
  cropApi.value?.setAspect(ratio);
}

function handleApply() {
  store.pushHistory();
  cropApi.value?.apply();
}

function handleCancel() {
  cropApi.value?.cancel();
}

watch(cropApi, (api) => {
  if (!api) {
    return;
  }

  if (store.cropAspectId === FREE_ASPECT_ID) {
    return;
  }

  api.setAspect(ratioOf(store.cropAspectId));
}, { immediate: true });
</script>

<template>
  <div class="crop-panel">
    <p class="panel-title crop-panel__title">{{ t('crop.title') }}</p>

    <p class="crop-panel__hint">{{ t('crop.sidebarHint') }}</p>

    <div class="crop-panel__presets">
      <button
        v-for="preset in presets"
        :key="preset.id"
        class="crop-panel__preset"
        :class="{ 'crop-panel__preset--active': store.cropAspectId === preset.id }"
        @click="selectPreset(preset.id, preset.ratio)"
      >
        {{ preset.label }}
      </button>
    </div>

    <div class="crop-panel__actions">
      <button
        class="crop-panel__cancel"
        :data-hint="'Esc'"
        @click="handleCancel"
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
        {{ t('crop.cancel') }}
      </button>

      <button
        class="crop-panel__apply"
        @click="handleApply"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        {{ t('crop.apply') }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.crop-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);

  &__title {
    margin-bottom: calc(-1 * var(--spacing-8));
  }

  &__hint {
    font-size: var(--text-body);
    color: var(--color-ash);
    line-height: 1.6;
  }

  &__presets {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-6);
  }

  &__preset {
    padding: var(--spacing-6) var(--spacing-12);
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    background: var(--color-graphite);
    color: var(--color-ash);
    font-size: var(--text-caption);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition:
      border-color var(--transition-fast),
      color var(--transition-fast),
      background var(--transition-fast);

    &:hover:not(.crop-panel__preset--active) {
      background: var(--color-slate);
      color: var(--color-bone);
    }

    &--active {
      border-color: var(--color-ember-gold);
      color: var(--color-gold-text);
      background: color-mix(in srgb, var(--color-ember-gold) 10%, transparent);
      cursor: default;
    }
  }

  &__actions {
    display: flex;
    gap: var(--spacing-8);
    padding-top: var(--spacing-8);
    border-top: 1px solid var(--color-iron);
  }

  &__cancel {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-8);
    padding: var(--spacing-8) var(--spacing-12);
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    background: var(--color-graphite);
    color: var(--color-pearl);
    font-size: var(--text-body);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    flex: 1;
    justify-content: center;
    transition:
      background var(--transition-fast),
      border-color var(--transition-fast),
      color var(--transition-fast);

    &:hover {
      background: var(--color-slate);
      border-color: var(--color-iron);
      color: var(--color-bone);
    }
  }

  &__apply {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-8);
    padding: var(--spacing-8) var(--spacing-16);
    border: 1px solid var(--color-gold-bright);
    border-radius: var(--radius-md);
    background: var(--color-gold-bright);
    color: var(--color-on-gold);
    font-size: var(--text-body);
    font-weight: var(--font-weight-semibold);
    cursor: pointer;
    flex: 1;
    justify-content: center;
    transition:
      background var(--transition-fast),
      border-color var(--transition-fast);

    &:hover {
      background: color-mix(in srgb, var(--color-gold-bright) 85%, #ffffff);
      border-color: color-mix(in srgb, var(--color-gold-bright) 85%, #ffffff);
    }
  }
}
</style>
