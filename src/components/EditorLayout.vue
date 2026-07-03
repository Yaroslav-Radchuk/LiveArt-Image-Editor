<script setup lang="ts">
import { useEditorStore } from '@/stores/editor';
import UploadZone from './editor/UploadZone.vue';
import EditorCanvas from './editor/EditorCanvas.vue';
import EditorSidebar from './EditorSidebar.vue';

const store = useEditorStore();

function onFile(file: File) {
  store.loadFile(file);
}
</script>

<template>
  <div class="editor-layout">
    <div class="editor-layout__main">
      <UploadZone
        v-if="!store.originalUrl"
        @file="onFile"
      />

      <EditorCanvas v-else />
    </div>

    <EditorSidebar />
  </div>
</template>

<style scoped lang="scss">
.editor-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;

  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    overflow: hidden;
    padding: var(--spacing-24);
    background: var(--surface-canvas);
  }

  @media (max-width: 768px) {
    flex-direction: column;

    &__main {
      min-height: 0;
      padding: var(--spacing-12);
    }
  }
}
</style>
