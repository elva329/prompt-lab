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
        <h1 class="h5 fw-bold mb-1">Prompt Library</h1>
        <p class="text-secondary mb-0">Browse and search {{ displayedPromptCount }} AI prompts.</p>
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
      <div class="col-12">
        <div class="prompt-category-tabs" role="tablist" aria-label="Prompt categories">
          <button
            v-for="cat in tabCategories"
            :key="cat"
            type="button"
            class="btn btn-sm"
            :class="cat === selectedCategory ? 'btn-primary' : 'btn-outline-secondary'"
            :aria-selected="cat === selectedCategory"
            @click="setSelectedCategory(cat)"
          >
            {{ formatCategoryName(cat) }}
          </button>
        </div>
      </div>
    </section>

    <section v-if="isLoading && prompts.length === 0" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-secondary mt-2">Loading prompts...</p>
    </section>

    <section v-else-if="errorMessage && prompts.length === 0" class="alert alert-danger">{{ errorMessage }}</section>

    <section v-if="filteredPrompts.length > 0" class="row g-2 prompts-grid prompts-scrollable-grid">
      <div v-for="prompt in visiblePrompts" :key="prompt.promptId" class="col-md-6 col-lg-4">
        <article class="card border-0 shadow-sm h-100 prompt-card prompt-card-modern">
          <div class="card-body d-flex flex-column prompt-card-body">
            <div class="prompt-card-top-row">
              <label class="form-check mb-0 prompt-select-wrap" :aria-label="`Select ${prompt.title}`">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :checked="isSelected(prompt.promptId)"
                  @change="togglePromptSelection(prompt.promptId)"
                />
              </label>
              <span class="badge prompt-badge-category">{{ simplifyCategory(prompt.category) }}</span>
            </div>

            <h2 class="h6 fw-semibold mb-0 prompt-title">{{ prompt.title }}</h2>

            <p class="prompt-content-preview mb-0">{{ prompt.promptText }}</p>

            <div class="prompt-card-footer mt-auto">
              <button
                type="button"
                class="prompt-favorite-btn"
                :aria-label="isFavorite(prompt.promptId) ? 'Remove from favorites' : 'Save to favorites'"
                @click="toggleFavorite(prompt.promptId)"
              >
                <i
                  class="bi fs-6"
                  :class="isFavorite(prompt.promptId) ? 'bi-heart-fill text-danger' : 'bi-heart text-secondary'"
                ></i>
              </button>

              <div class="prompt-score-wrap">
                <span v-if="getPromptScoreSummary(prompt.promptId)" class="badge rounded-pill prompt-badge-score">
                  <i class="bi bi-bar-chart-line-fill"></i>
                  <span>{{ getPromptScoreSummary(prompt.promptId) }}</span>
                </span>
                <span v-else class="badge rounded-pill prompt-badge-muted">
                  <i class="bi bi-hourglass-split"></i>
                  <span>Not tested yet</span>
                </span>
              </div>
            </div>
          </div>
        </article>
      </div>

    </section>

    <section v-if="canLoadMore" class="prompts-load-more-wrap">
      <article
        class="prompts-load-more-panel"
        role="button"
        tabindex="0"
        @click="handleLoadMore"
        @keydown.enter.prevent="handleLoadMore"
        @keydown.space.prevent="handleLoadMore"
      >
        <i class="bi bi-chevron-double-down prompts-load-more-icon" aria-hidden="true"></i>
        <span class="prompts-load-more-label">Load more</span>
      </article>
    </section>

    <section v-if="filteredPrompts.length === 0 && !isLoading" class="row g-3">
      <div class="col-12">
        <article class="card border border-secondary-subtle border-dashed">
          <div class="card-body text-center text-secondary py-5">No prompts found matching your criteria.</div>
        </article>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';

import { fetchUserByEmailRequest } from '../lib/authApi';
import { addOrUpdateFavorite, fetchUserFavorites, removeFavorite } from '../lib/favoritesApi';
import { fetchPrompts, type PromptRecord } from '../lib/promptsApi';
import { fetchPromptResultsSummaryRequest } from '../lib/resultsApi';
import { appStore } from '../stores/appStore';

const searchTerm = ref('');
const selectedCategory = ref('all');
const prompts = ref<PromptRecord[]>([]);
const visibleCountByCategory = ref<Record<string, number>>({});
const selectedPromptIds = ref<number[]>([]);
const favoritePromptIds = ref<number[]>([]);
const isLoading = ref(false);
const errorMessage = ref('');
const promptScoreMap = ref<Record<number, { avg: number; count: number }>>({});
const router = useRouter();
const route = useRoute();

let searchTimeout: number | null = null;
const INITIAL_VISIBLE_PROMPTS = 12;
const LOAD_MORE_STEP = 12;

const CATEGORY_LABELS: Record<string, string> = {
  technology: 'Technology',
  business: 'Business',
  learning: 'Learning',
  creative: 'Creative',
  lifestyle: 'Lifestyle',
  general: 'General',
};

const CATEGORY_GROUP_BY_RAW: Record<string, string> = {
  'ai-tools': 'technology',
  programming: 'technology',
  science: 'technology',
  business: 'business',
  education: 'learning',
  language: 'learning',
  history: 'learning',
  philosophy: 'learning',
  writing: 'creative',
  design: 'creative',
  media: 'creative',
  music: 'creative',
  entertainment: 'creative',
  healthcare: 'lifestyle',
  lifestyle: 'lifestyle',
  travel: 'lifestyle',
  general: 'general',
};

const CATEGORY_TAB_ORDER = ['technology', 'business', 'learning', 'creative', 'lifestyle', 'general'];

  const navItems = [
      { name: 'Analytics', path: '/analytics' },
      { name: 'Prompts', path: '/prompts' },
      { name: 'Favorites', path: '/favorites' },
      { name: 'Experiments', path: '/experiments' }
    ]

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

const tabCategories = computed(() => {
  const presentGroups = new Set(prompts.value.map((prompt) => simplifyCategory(prompt.category)));
  const orderedGroups = CATEGORY_TAB_ORDER.filter((group) => presentGroups.has(group));
  return ['all', ...orderedGroups];
});

const filteredPrompts = computed(() => {
  if (selectedCategory.value === 'all') {
    return prompts.value;
  }

  return prompts.value.filter((prompt) => simplifyCategory(prompt.category) === selectedCategory.value);
});

const visiblePromptLimit = computed(() => {
  return visibleCountByCategory.value[selectedCategory.value] || INITIAL_VISIBLE_PROMPTS;
});

const effectiveVisiblePromptLimit = computed(() => {
  const total = filteredPrompts.value.length;
  const configuredLimit = visiblePromptLimit.value;
  const remaining = total - configuredLimit;

  // If only a few items remain, show all instead of rendering a Load More button.
  if (remaining <= 3) {
    return total;
  }

  return configuredLimit;
});

const visiblePrompts = computed(() => {
  return filteredPrompts.value.slice(0, effectiveVisiblePromptLimit.value);
});

const displayedPromptCount = computed(() => filteredPrompts.value.length);

const remainingPromptCount = computed(() => {
  return Math.max(0, filteredPrompts.value.length - visiblePrompts.value.length);
});

const canLoadMore = computed(() => remainingPromptCount.value > 0);

const groupedCategoryCounts = computed<Record<string, number>>(() => {
  const counts: Record<string, number> = {};

  for (const prompt of prompts.value) {
    const groupedCategory = simplifyCategory(prompt.category);
    counts[groupedCategory] = (counts[groupedCategory] || 0) + 1;
  }

  return counts;
});

async function loadPrompts(): Promise<void> {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await fetchPrompts({
      search: searchTerm.value || undefined,
    });

    prompts.value = response.prompts;
    visibleCountByCategory.value = {};

    if (!tabCategories.value.includes(selectedCategory.value)) {
      selectedCategory.value = 'all';
    }

    ensureVisibleCountForCategory(selectedCategory.value);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load prompts.';
    appStore.showToast(errorMessage.value, 'danger');
  } finally {
    isLoading.value = false;
  }
}

function handleSearch(): void {
  if (searchTimeout) {
    window.clearTimeout(searchTimeout);
  }

  searchTimeout = window.setTimeout(() => {
    loadPrompts();
  }, 500);
}

function setSelectedCategory(category: string): void {
  if (selectedCategory.value === category) {
    return;
  }

  selectedCategory.value = category;
  ensureVisibleCountForCategory(category);
}

function ensureVisibleCountForCategory(category: string): void {
  if (!visibleCountByCategory.value[category]) {
    visibleCountByCategory.value[category] = INITIAL_VISIBLE_PROMPTS;
  }
}

function handleLoadMore(): void {
  ensureVisibleCountForCategory(selectedCategory.value);
  visibleCountByCategory.value[selectedCategory.value] += LOAD_MORE_STEP;
}

function formatCategoryName(category: string): string {
  if (category === 'all') {
    return `All Categories (${prompts.value.length})`;
  }

  const label = CATEGORY_LABELS[category] || 'General';
  const count = groupedCategoryCounts.value[category] || 0;
  return `${label} (${count})`;
}

function simplifyCategory(rawCategory: string): string {
  const normalized = String(rawCategory || '').trim().toLowerCase();
  return CATEGORY_GROUP_BY_RAW[normalized] || 'general';
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

  loadPrompts();
  loadPromptScores();
});
</script>
