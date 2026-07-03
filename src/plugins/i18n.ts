import { createI18n } from 'vue-i18n';
import en from '@/locales/en';
import uk from '@/locales/uk';

export const AppLocale = {
  En: 'en',
  Uk: 'uk',
} as const;

export type AppLocale = (typeof AppLocale)[keyof typeof AppLocale];

export const APP_LOCALES: AppLocale[] = Object.values(AppLocale);

const STORAGE_KEY = 'liveart-locale';

function getInitialLocale(): AppLocale {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved === AppLocale.En || saved === AppLocale.Uk) {
    return saved;
  }

  return AppLocale.En;
}

const initialLocale = getInitialLocale();

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: AppLocale.En,
  messages: { en, uk },
});

document.documentElement.lang = initialLocale;

export function setAppLocale(code: AppLocale) {
  i18n.global.locale.value = code;
  localStorage.setItem(STORAGE_KEY, code);
  document.documentElement.lang = code;
}
