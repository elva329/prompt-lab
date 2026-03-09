<template>
  <div class="fade-in-up prompts-page page-surface page-fullheight">
    <div class="dashboard-menu-row">
      <nav class="dashboard-menu-pills">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.path"
          class="dashboard-menu-link"
          :class="{ active: isNavItemActive(item.path) }"
        >
          {{ item.name }}
        </RouterLink>
      </nav>
      <div class="dashboard-user-controls">
        <button class="dashboard-menu-icon" title="User Profile" @click="handleLogout">
          <i class="bi bi-person-circle"></i>
        </button>
      </div>
    </div>

    <section class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 page-header-row">
      <div>
        <h1 class="h2 fw-bold mb-1">Prompt Library</h1>
        <p class="text-secondary mb-0">Browse and search {{ totalPrompts }} AI prompts.</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="small text-secondary">Selected: {{ selectedPromptIds.length }}/3</span>
        <button class="btn btn-outline-secondary btn-sm" :disabled="selectedPromptIds.length === 0" @click="clearSelection">
          Clear
        </button>
        <button class="btn btn-primary btn-sm" :disabled="selectedPromptIds.length === 0" @click="goToTestPrompt">
          Test Prompt
        </button>
      </div>
    </section>

    <section class="row g-2 page-filters-row">
      <div class="col-md-3">
        <input
          v-model.trim="searchTerm"
          type="text"
          class="form-control"
          placeholder="Search prompts..."
          @input="handleSearch"
        />
      </div>
      <div class="col-md-3">
        <select v-model="selectedCategory" class="form-select" @change="handleCategoryChange">
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
      </div>
    </section>

    <section v-if="isLoading && prompts.length === 0" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-secondary mt-2">Loading prompts...</p>
    </section>

    <section v-else-if="errorMessage && prompts.length === 0" class="alert alert-danger">{{ errorMessage }}</section>

    <section v-if="prompts.length > 0" class="row g-2 prompts-grid prompts-scrollable-grid">
      <div v-for="prompt in prompts" :key="prompt.promptId" class="col-md-6 col-lg-6">
        <article class="card border-0 shadow-sm h-100 prompt-card prompt-card-modern">
          <div class="card-body d-flex flex-column gap-1">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <h2 class="h6 fw-semibold mb-0 prompt-title">{{ prompt.title }}</h2>
              <div class="d-flex align-items-center gap-2">
                <span class="badge prompt-badge-category">{{ prompt.category }}</span>
                <button
                  class="btn btn-link p-0 text-decoration-none"
                  :aria-label="isFavorite(prompt.promptId) ? 'Remove from favorites' : 'Save to favorites'"
                  @click="toggleFavorite(prompt.promptId)"
                >
                  <i
                    class="bi fs-5"
                    :class="isFavorite(prompt.promptId) ? 'bi-heart-fill text-danger' : 'bi-heart text-secondary'"
                  ></i>
                </button>
              </div>
            </div>

            <p class="prompt-content-preview mb-0">{{ prompt.promptText }}</p>

            <div class="mt-auto pt-2 border-top d-flex justify-content-between align-items-center text-secondary small gap-2">
              <div>
                <span v-if="getPromptScoreSummary(prompt.promptId)" class="badge rounded-pill prompt-badge-score">
                  Overall Quality: {{ getPromptScoreSummary(prompt.promptId) }}
                </span>
                <span v-else class="badge rounded-pill prompt-badge-muted">Not tested yet</span>
              </div>
              <label class="form-check mb-0 d-flex align-items-center gap-2">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :checked="isSelected(prompt.promptId)"
                  @change="togglePromptSelection(prompt.promptId)"
                />
                <span class="form-check-label">Select Prompt</span>
              </label>
            </div>
          </div>
        </article>
      </div>

    </section>

    <section v-if="prompts.length === 0 && !isLoading" class="row g-3">
      <div class="col-12">
        <article class="card border border-secondary-subtle border-dashed">
          <div class="card-body text-center text-secondary py-5">No prompts found matching your criteria.</div>
        </article>
      </div>
    </section>

    <section v-if="totalPages > 1" class="d-flex justify-content-center prompts-pagination">
      <nav aria-label="Prompts pagination">
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: currentPage === 1 || isLoading }">
            <button class="page-link" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1 || isLoading">
              Previous
            </button>
          </li>
          <li
            v-for="(page, index) in pageNumbers"
            :key="`${page}-${index}`"
            class="page-item"
            :class="{ active: page === currentPage, disabled: page === '...' }
            "
          >
            <button class="page-link" @click="goToPage(page)" :disabled="isLoading || page === '...'">{{ page }}</button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages || isLoading }">
            <button class="page-link" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages || isLoading">
              Next
            </button>
          </li>
        </ul>
      </nav>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';

import { fetchUserByEmailRequest } from '../lib/authApi';
import { addOrUpdateFavorite, fetchUserFavorites, removeFavorite } from '../lib/favoritesApi';
import { fetchCategories, fetchPrompts, type PromptRecord } from '../lib/promptsApi';
import { fetchPromptResultsSummaryRequest } from '../lib/resultsApi';
import { appStore } from '../stores/appStore';

const searchTerm = ref('');
const selectedCategory = ref('');
const categories = ref<string[]>([]);
const prompts = ref<PromptRecord[]>([]);
const selectedPromptIds = ref<number[]>([]);
const favoritePromptIds = ref<number[]>([]);
const totalPrompts = ref(0);
const currentPage = ref(1);
const isLoading = ref(false);
const errorMessage = ref('');
const promptScoreMap = ref<Record<number, { avg: number; count: number }>>({});
const pageSize = 4;
const router = useRouter();
const route = useRoute();

let searchTimeout: number | null = null;

const navItems = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Prompts', path: '/prompts' },
  { name: 'Favorites', path: '/favorites' },
  { name: 'Experiments', path: '/experiments' },
];

function isNavItemActive(path: string): boolean {
  if (path === '/experiments') {
    return route.path === '/experiments' || route.path.startsWith('/experiments/');
  }
  return route.path === path;
}

function handleLogout(): void {
  appStore.logout();
  router.push('/');
}

const totalPages = computed(() => Math.max(1, Math.ceil(totalPrompts.value / pageSize)));

const pageNumbers = computed<Array<number | '...'>>(() => {
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
});

async function loadPrompts(page = 1): Promise<void> {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await fetchPrompts({
      category: selectedCategory.value || undefined,
      search: searchTerm.value || undefined,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    prompts.value = response.prompts;
    totalPrompts.value = response.total;
    currentPage.value = Math.min(page, Math.max(1, Math.ceil(response.total / pageSize)));
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load prompts.';
    appStore.showToast(errorMessage.value, 'danger');
  } finally {
    isLoading.value = false;
  }
}

async function loadCategories(): Promise<void> {
  try {
    const response = await fetchCategories();
    categories.value = response.categories;
  } catch (error) {
    console.error('Failed to load categories:', error);
  }
}

function handleSearch(): void {
  if (searchTimeout) {
    window.clearTimeout(searchTimeout);
  }

  searchTimeout = window.setTimeout(() => {
    goToPage(1);
  }, 500);
}

function handleCategoryChange(): void {
  goToPage(1);
}

function goToPage(page: number | '...'): void {
  if (page === '...') {
    return;
  }

  if (page < 1 || page > totalPages.value || page === currentPage.value) {
    return;
  }

  loadPrompts(page);
}

function isSelected(promptId: number): boolean {
  return selectedPromptIds.value.includes(promptId);
}

function togglePromptSelection(promptId: number): void {
  if (isSelected(promptId)) {
    selectedPromptIds.value = selectedPromptIds.value.filter((entry) => entry !== promptId);
    return;
  }

  if (selectedPromptIds.value.length >= 3) {
    appStore.showToast('You can select up to 3 prompts only.', 'warning');
    return;
  }

  selectedPromptIds.value = [...selectedPromptIds.value, promptId];
}

function isFavorite(promptId: number): boolean {
  return favoritePromptIds.value.includes(promptId);
}

function getPromptScoreSummary(promptId: number): string | null {
  const score = promptScoreMap.value[promptId];
  if (!score) {
    return null;
  }

  return `${score.avg}/100 (${score.count} run${score.count > 1 ? 's' : ''})`;
}

async function loadPromptScores(): Promise<void> {
  let resolvedUserId = appStore.state.user?.id || '';

  if (!resolvedUserId) {
    const savedEmail = window.localStorage.getItem('promptlab_user_email');
    if (savedEmail) {
      try {
        const userData = await fetchUserByEmailRequest(savedEmail);
        if (userData.user?.id) {
          resolvedUserId = userData.user.id;
        }
      } catch {
        promptScoreMap.value = {};
        return;
      }
    }
  }

  if (!resolvedUserId) {
    promptScoreMap.value = {};
    return;
  }

  try {
    const averaged: Record<number, { avg: number; count: number }> = {};
    const response = await fetchPromptResultsSummaryRequest(resolvedUserId);
    for (const item of response.prompts) {
      averaged[item.promptId] = {
        avg: item.avgQualityScore,
        count: item.testCount,
      };
    }

    promptScoreMap.value = averaged;
  } catch (error) {
    console.error('Failed to load prompt score summaries:', error);
    promptScoreMap.value = {};
  }
}

async function toggleFavorite(promptId: number): Promise<void> {
  const userId = appStore.state.user?.id;
  if (!userId) {
    appStore.showToast('Please log in to save favorites.', 'warning');
    return;
  }

  try {
    if (isFavorite(promptId)) {
      await removeFavorite(userId, promptId);
      favoritePromptIds.value = favoritePromptIds.value.filter((entry) => entry !== promptId);
      appStore.showToast('Removed from favorites.', 'info');
    } else {
      await addOrUpdateFavorite(userId, promptId);
      favoritePromptIds.value = [...favoritePromptIds.value, promptId];
      appStore.showToast('Saved to favorites.', 'success');
    }
  } catch (error) {
    appStore.showToast(error instanceof Error ? error.message : 'Failed to update favorites.', 'danger');
  }
}

function clearSelection(): void {
  selectedPromptIds.value = [];
}

function goToTestPrompt(): void {
  if (!selectedPromptIds.value.length) {
    appStore.showToast('Please select at least one prompt.', 'warning');
    return;
  }

  router.push({
    name: 'experiment-runner',
    params: { id: 'new' },
    query: { prompts: selectedPromptIds.value.join(',') },
  });
}

onMounted(async () => {
  const userId = appStore.state.user?.id;
  if (userId) {
    try {
      const response = await fetchUserFavorites(userId);
      favoritePromptIds.value = response.favorites.map((fav) => fav.promptId);
    } catch {
      favoritePromptIds.value = [];
    }
  }

  loadCategories();
  loadPrompts(1);
  loadPromptScores();
});
</script>
