import { ref } from 'vue';

export const AppTheme = {
  Dark: 'dark',
  Light: 'light',
} as const;

export type AppTheme = (typeof AppTheme)[keyof typeof AppTheme];

export const APP_THEMES: AppTheme[] = Object.values(AppTheme);

const STORAGE_KEY = 'liveart-theme';

function getInitialTheme(): AppTheme {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved === AppTheme.Dark || saved === AppTheme.Light) {
    return saved;
  }

  return AppTheme.Dark;
}

export const currentTheme = ref<AppTheme>(getInitialTheme());

export function vuetifyThemeName(name: AppTheme) {
  return name === AppTheme.Dark ? 'liveart' : 'liveart-light';
}

export function setAppTheme(name: AppTheme) {
  currentTheme.value = name;
  localStorage.setItem(STORAGE_KEY, name);
  document.documentElement.setAttribute('data-theme', name);
}
