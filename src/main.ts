import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createVuetify } from 'vuetify';
import { inject } from '@vercel/analytics';
import 'vuetify/styles';
import { i18n } from '@/plugins/i18n';
import { currentTheme, setAppTheme, vuetifyThemeName } from '@/plugins/theme';
import App from './App.vue';
import './styles/main.scss';

setAppTheme(currentTheme.value);

const vuetify = createVuetify({
  theme: {
    defaultTheme: vuetifyThemeName(currentTheme.value),
    themes: {
      liveart: {
        dark: true,
        colors: {
          primary: '#ffc272',
          background: '#000000',
          surface: '#08080a',
          'on-surface': '#e2e3e9',
          'surface-variant': '#363841',
          error: '#e05252',
        },
      },
      'liveart-light': {
        dark: false,
        colors: {
          primary: '#ffc272',
          background: '#dee3ec',
          surface: '#f4f6fa',
          'on-surface': '#131a2c',
          'surface-variant': '#b6bfd2',
          error: '#d03434',
        },
      },
    },
  },
  defaults: {
    VSlider: {
      color: 'primary',
      trackColor: 'surface-variant',
    },
  },
});

createApp(App).use(createPinia()).use(i18n).use(vuetify).mount('#app');

inject();
