<template>
  <div v-if="useMarketingShell" class="d-flex flex-column app-marketing-shell">
    <RouterLink to="/" class="login-home-brand-block global-home-brand-block text-decoration-none">
      <span class="landing-brand-mark">
        <i class="bi bi-grid-3x3-gap-fill"></i>
      </span>
      <span class="text-start">
        <span class="landing-brand-kicker d-block mb-1">Experiment Workspace</span>
        <span class="landing-brand-name d-block">Prompt Lab</span>
      </span>
    </RouterLink>

    <main class="grow d-flex flex-column">
      <RouterView />
    </main>
    <footer class="marketing-footer py-3">
      <div class="marketing-footer-inner px-3 px-md-4 px-xl-5 text-center">
        <p class="mb-0 marketing-footer-copy">Copyright {{ currentYear }} PromptLab. All rights reserved.</p>
      </div>
    </footer>
  </div>

  <div
    v-else
    class="d-flex flex-column app-shell app-fullscreen auth-shell-with-home-entry"
    :class="{ 'app-allow-page-scroll': isPromptRoute }"
  >
    <RouterLink to="/" class="login-home-brand-block global-home-brand-block text-decoration-none">
      <span class="landing-brand-mark">
        <i class="bi bi-grid-3x3-gap-fill"></i>
      </span>
    </RouterLink>

    <main class="app-main-fullscreen">
      <div class="container-xl" :class="{ 'h-100': !isPromptRoute }">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';

import { appStore } from '../stores/appStore';

const route = useRoute();
const isAuthenticated = computed(() => appStore.isAuthenticated.value);
const isMarketingRoute = computed(() => route.name === 'landing' || route.name === 'login');
const isPromptRoute = computed(() => route.name === 'prompts');
const useMarketingShell = computed(() => !isAuthenticated.value || isMarketingRoute.value);
const currentYear = new Date().getFullYear();
</script>
