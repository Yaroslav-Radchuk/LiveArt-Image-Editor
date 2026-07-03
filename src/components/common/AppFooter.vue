<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const STACK = [
  'Vue 3',
  'TypeScript',
  'Pinia',
  'Vuetify',
  'Canvas API',
  'Vite',
];

const YEAR = new Date().getFullYear();
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__main">
      <div class="app-footer__brand">
        <svg
          class="app-footer__logo"
          width="22"
          height="22"
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
        <div class="app-footer__brand-text">
          <span class="app-footer__name">LiveArt</span>
          <span class="app-footer__tagline">{{ t('footer.tagline') }}</span>
        </div>
      </div>

      <div class="app-footer__stack">
        <span class="app-footer__stack-label">{{ t('footer.stack') }}</span>
        <div class="app-footer__chips">
          <span
            v-for="tech in STACK"
            :key="tech"
            class="app-footer__chip"
          >
            {{ tech }}
          </span>
        </div>
      </div>
    </div>

    <div class="app-footer__bottom">
      <span class="app-footer__copyright">© {{ YEAR }} Yaroslav Radchuk</span>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.app-footer {
  flex-shrink: 0;
  border-top: 1px solid var(--color-iron);
  background: var(--surface-inkwell);

  &__main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-24);
    flex-wrap: wrap;
    padding: var(--spacing-20) var(--spacing-24);
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: var(--spacing-12);
    color: var(--color-ember-gold);
  }

  &__logo {
    flex-shrink: 0;
  }

  &__brand-text {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-4);
  }

  &__name {
    font-size: var(--text-body);
    font-weight: var(--font-weight-semibold);
    letter-spacing: -0.01em;
    line-height: 1;
    color: var(--color-bone);
  }

  &__tagline {
    font-size: var(--text-caption);
    line-height: 1.2;
    color: var(--color-fog);
  }

  &__stack {
    display: flex;
    align-items: center;
    gap: var(--spacing-12);
  }

  &__stack-label {
    font-size: 11px;
    font-weight: var(--font-weight-medium);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-fog);
    white-space: nowrap;
  }

  &__chips {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--spacing-6);
  }

  &__chip {
    padding: 3px var(--spacing-10);
    border: 1px solid var(--color-iron);
    border-radius: var(--radius-full);
    background: var(--color-graphite);
    color: var(--color-ash);
    font-size: 11px;
    font-weight: var(--font-weight-medium);
    white-space: nowrap;
  }

  &__bottom {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-12) var(--spacing-24);
    border-top: 1px solid var(--color-iron);
  }

  &__copyright {
    font-size: var(--text-caption);
    color: var(--color-steel);
  }
}
</style>
