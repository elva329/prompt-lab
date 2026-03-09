<template>
  <div v-if="!isAuthenticated" class="d-flex flex-column min-vh-100 app-marketing-shell">
    <main class="grow d-flex flex-column">
      <RouterView />
    </main>
    <footer class="marketing-footer py-3">
      <div class="marketing-footer-inner px-3 px-md-4 px-xl-5 text-center">
        <p class="mb-0 marketing-footer-copy">Copyright {{ currentYear }} PromptLab. All rights reserved.</p>
      </div>
    </footer>
  </div>

  <div v-else class="d-flex flex-column app-shell app-fullscreen">
    <main class="app-main-fullscreen">
      <div class="container-xl h-100">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterView } from 'vue-router';

import { appStore } from '../stores/appStore';

const isAuthenticated = computed(() => appStore.isAuthenticated.value);
const currentYear = new Date().getFullYear();
</script>
