<template>
  <div v-if="!isAuthenticated" class="d-flex flex-column min-vh-100 bg-body-tertiary">
    <header class="sticky-top border-bottom bg-white bg-opacity-75 backdrop-blur">
      <div class="container py-3 d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-2 fw-bold fs-4 text-primary-emphasis">
          <i class="bi bi-beaker"></i>
          <span>PromptLab</span>
        </div>
        <nav class="d-flex align-items-center gap-2">
          <button class="btn btn-link text-decoration-none" @click="goLogin">Sign In</button>
          <button class="btn btn-dark" @click="goLogin">Get Started</button>
        </nav>
      </div>
    </header>
    <main class="flex-grow-1 d-flex flex-column">
      <RouterView />
    </main>
  </div>

  <div v-else class="d-flex min-vh-100 app-shell">
    <aside class="sidebar-desktop border-end bg-white d-none d-md-flex flex-column">
      <div class="border-bottom px-4 py-3 d-flex align-items-center gap-2 fw-bold fs-4 text-primary-emphasis">
        <i class="bi bi-beaker"></i>
        <span>PromptLab</span>
      </div>

      <nav class="sidebar-nav px-2 py-2">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.path"
          class="text-start d-flex align-items-center gap-1 nav-item-link"
          :class="{ 'active': isNavItemActive(item.path) }
          "
        >
          <i :class="item.icon"></i>
          <span>{{ item.name }}</span>
        </RouterLink>
      </nav>

      <div class="border-top p-3">
        <div class="d-flex align-items-center gap-3">
          <div class="avatar-pill">{{ userInitial }}</div>
          <div>
            <p class="mb-0 fw-semibold">{{ appStore.state.user?.email }}</p>
            <small class="text-muted text-capitalize">user</small>
          </div>
        </div>
        <button class="btn btn-outline-danger mt-3 w-100 d-flex align-items-center justify-content-center gap-2" @click="handleLogout">
          <i class="bi bi-box-arrow-right"></i>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>

    <div class="d-flex flex-column flex-grow-1">
      <div class="d-md-none border-bottom bg-white p-3 d-flex align-items-center justify-content-between sticky-top" style="z-index: 1000">
        <div class="d-flex align-items-center gap-2 fw-bold">
          <i class="bi bi-beaker"></i>
          <span>PromptLab</span>
        </div>
        <button class="btn btn-outline-secondary btn-sm" @click="isMobileMenuOpen = !isMobileMenuOpen">
          <i class="bi" :class="isMobileMenuOpen ? 'bi-x-lg' : 'bi-list'"></i>
        </button>
      </div>

      <div v-if="isMobileMenuOpen" class="d-md-none border-bottom p-3 bg-white">
        <nav class="d-grid gap-2">
          <RouterLink
            v-for="item in navItems"
            :key="`mobile-${item.name}`"
            :to="item.path"
            class="btn text-start d-flex align-items-center gap-2 nav-item-link"
            :class="{ 'active': isNavItemActive(item.path) }"
            @click="isMobileMenuOpen = false"
          >
            <i :class="item.icon"></i>
            <span>{{ item.name }}</span>
          </RouterLink>
          <button class="btn btn-outline-danger mt-2" @click="handleLogout">Sign Out</button>
        </nav>
      </div>

      <main class="flex-grow-1 p-3 p-md-4 p-xl-5">
        <div class="container-xl">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';

import { appStore } from '../stores/appStore';

const route = useRoute();
const router = useRouter();
const isMobileMenuOpen = ref(false);

const isAuthenticated = computed(() => appStore.isAuthenticated.value);
const userInitial = computed(() => appStore.state.user?.email?.charAt(0).toUpperCase() ?? '?');

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: 'bi bi-house' },
  { name: 'Prompts', path: '/prompts', icon: 'bi bi-file-text' },
  { name: 'Favorites', path: '/favorites', icon: 'bi bi-heart' },
  { name: 'Experiments', path: '/experiments', icon: 'bi bi-flask' },
];

function goLogin(): void {
  router.push('/login');
}

function handleLogout(): void {
  appStore.logout();
  router.push('/');
  isMobileMenuOpen.value = false;
}

function isNavItemActive(path: string): boolean {
  if (path === '/experiments') {
    return route.path === '/experiments' || route.path.startsWith('/experiments/');
  }

  return route.path === path;
}
</script>
