<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue';
import AppFooter from '@/components/common/AppFooter.vue';
import AppToast from '@/components/common/AppToast.vue';
import EditorLayout from '@/components/EditorLayout.vue';
</script>

<template>
  <v-app>
    <AppHeader />
    <v-main class="app-main">
      <EditorLayout />
    </v-main>
    <AppFooter />
    <AppToast />
  </v-app>
</template>

<style lang="scss">
.app-main {
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  height: calc(100dvh - var(--nav-height));
  overflow: hidden;
}
</style>
