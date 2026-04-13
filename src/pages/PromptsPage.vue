<template>
  <div class="fade-in-up prompts-page page-surface page-fullheight">
    <div class="dashboard-menu-row">
      <!-- Navigation Pills -->
      <nav class="dashboard-menu-pills">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.path"
          class="dashboard-menu-link"
          :class="{ active: isNavItemActive(item.path) }"
          :title="item.name"
        >
          <i :class="['bi', item.icon, 'me-md-2']"></i>
          <span class="d-none d-md-inline">{{ item.name }}</span>
        </RouterLink>
      </nav>
      <div class="dashboard-user-controls">
        <button class="dashboard-menu-icon" title="User Profile" @click="handleLogout">
          <i class="bi bi-person-circle"></i>
        </button>
      </div>
    </div>

    <section class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 page-header-row">
      <div class="search-input-wrapper">
         <input
          v-model.trim="searchTerm"
          type="text"
          class="form-control"
          placeholder="Search prompts..."
          @input="handleSearch"
        />
        <button 
          v-if="searchTerm" 
          class="btn-search-clear" 
          @click="clearSearch"
          title="Clear search"
        >
          <i class="bi bi-x"></i>
        </button>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="small text-secondary">Selected: {{ selectedPromptIds.length }}/3</span>
        <button class="btn btn-outline-secondary btn-sm" :disabled="selectedPromptIds.length === 0" @click="clearSelection">
          Clear
        </button>
        <button class="btn btn-primary btn-sm" :disabled="selectedPromptIds.length === 0 || selectedPromptIds.length > 3" @click="goToTestPrompt">
          Test Prompt
        </button>
      </div>
    </section>

    <section class="row g-2 page-filters-row">
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

    <section v-if="selectedPromptIds.length > 3" class="alert alert-warning px-4 py-3 mb-4" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      You can select up to 3 prompts only. Please deselect some prompts before testing.
    </section>

    <section v-if="isLoading && prompts.length === 0" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading prompts</p>
    </section>

    <section v-else-if="errorMessage && prompts.length === 0" class="alert alert-danger">{{ errorMessage }}</section>

    <section v-if="filteredPrompts.length > 0" class="row g-4 prompts-grid prompts-scrollable-grid">
      <div v-for="prompt in visiblePrompts" :key="prompt.promptId" class="col-md-6 col-xl-4">
        <article class="prompt-card prompt-card-modern h-100">
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
import { fetchPrompts, type PromptRecord } from '../lib/promptsApi';
import { fetchPromptResultsSummaryRequest } from '../lib/resultsApi';
import { appStore } from '../stores/appStore';

const searchTerm = ref('');
const selectedCategory = ref('all');
const prompts = ref<PromptRecord[]>([]);
const visibleCountByCategory = ref<Record<string, number>>({});
const selectedPromptIds = ref<number[]>([]);
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
      { name: 'Analytics', path: '/analytics', icon: 'bi-graph-up' },
      { name: 'Prompt Library', path: '/prompts', icon: 'bi-journal-text' },
      { name: 'Favorites', path: '/favorites', icon: 'bi-star-fill' },
      { name: 'Experiments', path: '/experiments', icon: 'bi-flask' }
    ]

function isNavItemActive(path: string): boolean {
  if (path === '/experiments') {
    return route.path === '/experiments' || route.path.startsWith('/experiments/');
  }
  return route.path === path;
}

const currentNavItem = computed(() => navItems.find((item) => isNavItemActive(item.path)));

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

function clearSearch(): void {
  searchTerm.value = '';
  loadPrompts();
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
  } else {
    selectedPromptIds.value = [...selectedPromptIds.value, promptId];
  }
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
    const response = await fetchPromptResultsSummaryRequest();
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
  loadPrompts();
  loadPromptScores();
});
</script>

<style scoped>
.prompts-page {
  padding: var(--spacing-xl);
}

/* Search & Header */
.page-header-row {
  margin-bottom: var(--spacing-lg);
}

.form-control {
  border-radius: 99px;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  box-shadow: none;
}

.form-control:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
}

/* Category Tabs */
.prompt-category-tabs .btn {
  border-radius: 99px;
  margin-right: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid #cbd5e1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.prompt-category-tabs .btn-outline-secondary {
  color: #10233f;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
}

.prompt-category-tabs .btn-outline-secondary:hover,
.prompt-category-tabs .btn-outline-secondary:focus {
  background: #e2e8f0;
  color: #1b5e55;
  border-color: #1b5e55;
}

.prompt-category-tabs .btn-primary {
  background: #1b5e55;
  border: none;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(27, 94, 85, 0.2);
  font-weight: 700;
}

/* Prompt Card - Modern Design System */
.prompt-card {
  background: rgba(255, 255, 255, 0.75);
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(16, 35, 63, 0.08);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.prompt-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(16, 35, 63, 0.12);
}

.prompt-card-body {
  padding: 1.5rem;
  gap: 0.75rem;
  flex: 1; /* Allow body to grow */
}

.prompt-card-top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.prompt-title {
  color: #10233f;
  font-size: 1rem;
  font-weight: 700;
}

.prompt-content-preview {
  color: #475569;
  font-size: 0.9rem;
  line-height: 1.6;
  opacity: 0.85;
  max-height: 140px; /* Constrain height to enable scrolling */
  overflow-y: auto; /* Enable scrolling for long content */
}

.prompt-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  margin-top: auto;
  border-top: 1px solid rgba(203, 213, 225, 0.2);
}

.prompt-favorite-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: transform 0.2s;
}
.prompt-favorite-btn:hover {
  transform: scale(1.1);
}

.prompt-badge-score {
  background-color: rgba(27, 94, 85, 0.1);
  color: #1b5e55;
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
}

.prompt-badge-muted {
  background-color: rgba(203, 213, 225, 0.2);
  color: #94a3b8;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 400px;
}

.btn-search-clear {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: 1px solid rgba(27, 94, 85, 0.2);
  border-radius: 0.5rem;
  padding: 0.35rem 0.5rem;
  color: #1b5e55;
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  width: 2rem;
  height: 2rem;
}

.btn-search-clear:hover {
  background: rgba(27, 94, 85, 0.08);
  border-color: rgba(27, 94, 85, 0.4);
  color: #0f3d38;
}

.btn-search-clear:active {
  background: rgba(27, 94, 85, 0.12);
  transform: scale(0.95);
}

.btn-search-clear i {
  font-size: 1rem;
}

.search-input-wrapper .form-control {
  padding-right: 3rem;
}

.search-input-wrapper .form-control:focus {
  border-color: var(--color-primary);
}
</style>
