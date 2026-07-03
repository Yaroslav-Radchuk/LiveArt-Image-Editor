import { computed } from 'vue';
import { useTheme } from 'vuetify';
import { AppTheme, currentTheme, setAppTheme, vuetifyThemeName } from '@/plugins/theme';

const isDark = computed(() => currentTheme.value === AppTheme.Dark);

export function useAppTheme() {
  const vuetifyTheme = useTheme();

  function applyTheme(name: AppTheme) {
    setAppTheme(name);
    vuetifyTheme.global.name.value = vuetifyThemeName(name);
  }

  return {
    theme: currentTheme,
    isDark,
    setTheme: applyTheme,
  };
}
