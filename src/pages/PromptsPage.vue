<template>
  <div class="vstack gap-2 fade-in-up prompts-page">
    <section class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
      <div>
        <h1 class="h2 fw-bold mb-1">Prompt Library</h1>
        <p class="text-secondary mb-0">Browse and search {{ totalPrompts }} AI prompts.</p>
      </div>
    </section>

    <section class="row g-2">
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

    <section v-if="prompts.length > 0" class="row g-2 prompts-grid">
      <div v-for="prompt in prompts" :key="prompt.promptId" class="col-md-6 col-lg-4">
        <article class="card border-0 shadow-sm h-100 prompt-card">
          <div class="card-body d-flex flex-column gap-1">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <h2 class="h6 fw-semibold mb-0 prompt-title">{{ prompt.title }}</h2>
              <span class="badge text-bg-secondary">{{ prompt.category }}</span>
            </div>

            <p class="prompt-content-preview mb-0">{{ prompt.promptText }}</p>

            <div class="mt-auto pt-2 border-top d-flex justify-content-between text-secondary small">
              <span>ID: {{ prompt.promptId }}</span>
              <span class="text-primary">View <i class="bi bi-chevron-right"></i></span>
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

import { fetchCategories, fetchPrompts, type PromptRecord } from '../lib/promptsApi';
import { appStore } from '../stores/appStore';

const searchTerm = ref('');
const selectedCategory = ref('');
const categories = ref<string[]>([]);
const prompts = ref<PromptRecord[]>([]);
const totalPrompts = ref(0);
const currentPage = ref(1);
const isLoading = ref(false);
const errorMessage = ref('');
const pageSize = 9;

let searchTimeout: number | null = null;

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

onMounted(() => {
  loadCategories();
  loadPrompts(1);
});
</script>
