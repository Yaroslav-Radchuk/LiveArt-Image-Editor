<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAppTheme } from '@/composables/useAppTheme';
import { APP_LOCALES, AppLocale, setAppLocale } from '@/plugins/i18n';
import { APP_THEMES, AppTheme } from '@/plugins/theme';
import ExportMenu from './ExportMenu.vue';
import PillSwitch from './PillSwitch.vue';

const { t, locale } = useI18n();

const {
  isDark,
  theme,
  setTheme,
} = useAppTheme();

const activeLocale = computed(() => (locale.value === AppLocale.Uk ? AppLocale.Uk : AppLocale.En));
const themeLabel = computed(() => (isDark.value ? t('header.themeDark') : t('header.themeLight')));

const themeAriaLabels = computed(() => ({
  [AppTheme.Dark]: t('header.themeDark'),
  [AppTheme.Light]: t('header.themeLight'),
}));
</script>

<template>
  <header class="app-header">
    <div class="app-header__logo">
      <svg
        class="app-header__logo-icon"
        width="18"
        height="18"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <line
          x1="7"
          y1="10"
          x2="25"
          y2="10"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          opacity="0.35"
        />
        <line
          x1="7"
          y1="16"
          x2="25"
          y2="16"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          opacity="0.35"
        />
        <line
          x1="7"
          y1="22"
          x2="25"
          y2="22"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          opacity="0.35"
        />
        <circle
          cx="13"
          cy="10"
          r="4"
          fill="currentColor"
        />
        <circle
          cx="20"
          cy="16"
          r="4"
          fill="currentColor"
        />
        <circle
          cx="16"
          cy="22"
          r="4"
          fill="currentColor"
        />
      </svg>
      <span class="app-header__logo-text">LiveArt</span>
    </div>

    <div class="app-header__actions">
      <PillSwitch
        :options="APP_LOCALES"
        :model-value="activeLocale"
        :label="t('header.localeLabel')"
        @update:model-value="setAppLocale"
      />

      <PillSwitch
        :options="APP_THEMES"
        :model-value="theme"
        :label="themeLabel"
        :labels="themeAriaLabels"
        icon
        @update:model-value="setTheme"
      >
        <template #default="{ option }">
          <svg
            v-if="option === AppTheme.Dark"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <svg
            v-else
            width="14"
            height="14"
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
              r="5"
            />
            <line
              x1="12"
              y1="1"
              x2="12"
              y2="3"
            />
            <line
              x1="12"
              y1="21"
              x2="12"
              y2="23"
            />
            <line
              x1="4.22"
              y1="4.22"
              x2="5.64"
              y2="5.64"
            />
            <line
              x1="18.36"
              y1="18.36"
              x2="19.78"
              y2="19.78"
            />
            <line
              x1="1"
              y1="12"
              x2="3"
              y2="12"
            />
            <line
              x1="21"
              y1="12"
              x2="23"
              y2="12"
            />
            <line
              x1="4.22"
              y1="19.78"
              x2="5.64"
              y2="18.36"
            />
            <line
              x1="18.36"
              y1="5.64"
              x2="19.78"
              y2="4.22"
            />
          </svg>
        </template>
      </PillSwitch>

      <ExportMenu />
    </div>
  </header>
</template>

<style scoped lang="scss">
.app-header {
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--nav-height);
  padding-inline: var(--spacing-24);
  border-bottom: 1px solid var(--color-iron);
  background: color-mix(in srgb, var(--surface-inkwell) 85%, transparent);
  backdrop-filter: blur(16px) saturate(1.4);
  flex-shrink: 0;

  &__logo {
    display: flex;
    align-items: center;
    gap: var(--spacing-8);
    color: var(--color-ember-gold);
    user-select: none;
  }

  &__logo-icon {
    flex-shrink: 0;
  }

  &__logo-text {
    font-size: var(--text-subheading);
    font-weight: var(--font-weight-semibold);
    letter-spacing: -0.02em;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-16);
  }

  @media (max-width: 768px) {
    padding-inline: var(--spacing-12);

    &__actions {
      gap: var(--spacing-8);
    }
  }

  @media (max-width: 480px) {
    &__logo-text {
      display: none;
    }
  }
}
</style>
