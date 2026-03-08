<template>
  <div v-if="!isAuthenticated" class="d-flex flex-column min-vh-100 app-marketing-shell">
    <header class="sticky-top marketing-header">
      <div class="container-xl py-3 d-flex justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center gap-2 fw-semibold fs-5 marketing-brand">
          <i class="bi bi-grid-3x3-gap-fill"></i>
          <span>PromptLab</span>
        </div>
        <nav class="d-none d-md-flex align-items-center gap-4 marketing-nav-links">
          <a href="#" class="text-decoration-none">Features</a>
          <a href="#" class="text-decoration-none">Solutions</a>
          <a href="#" class="text-decoration-none">Resources</a>
          <a href="#" class="text-decoration-none">Pricing</a>
        </nav>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-link text-decoration-none marketing-link-btn" @click="goLogin">Sign in</button>
          <button class="btn marketing-outline-btn" @click="goLogin">Get demo</button>
        </div>
      </div>
    </header>
    <main class="grow d-flex flex-column">
      <RouterView />
    </main>
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
import { RouterView, useRouter } from 'vue-router';

import { appStore } from '../stores/appStore';

const router = useRouter();

const isAuthenticated = computed(() => appStore.isAuthenticated.value);

function goLogin(): void {
  router.push('/login');
}

function handleLogout(): void {
  appStore.logout();
  router.push('/');
}
</script>
