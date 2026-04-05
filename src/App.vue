<template>
  <div class="app-layout">
    <main class="app-main">
      <RouterView />
    </main>
    <AppToast />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';

import AppToast from './components/AppToast.vue';
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
}
</style>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.app-main {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
