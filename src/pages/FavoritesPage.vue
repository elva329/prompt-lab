<template>
  <div class="fade-in-up favorites-page page-surface page-fullheight">
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

    <section class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 page-header-row mb-4">
      <div>
        <h1 class="h3 fw-bold mb-1">Your Favorites</h1>
        <p class="text-secondary mb-0 small">Access and manage your saved prompts.</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="small text-secondary" v-if="selectedPromptIds.length">Selected: {{ selectedPromptIds.length }}/3</span>
        <button class="btn btn-primary btn-sm" :disabled="selectedPromptIds.length === 0" @click="goToTestPrompt">
          Test Prompts
        </button>
      </div>
    </section>

    <div v-if="isLoading" class="loading-state py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-secondary mt-2">Loading favorites...</p>
    </div>

    <div v-else-if="favorites.length === 0" class="empty-state-wrapper">
      <div class="empty-icon mb-3">
        <i class="bi bi-heart"></i>
      </div>
      <h3 class="h5 fw-bold text-secondary mb-2">No favorites yet</h3>
      <p class="text-muted small mb-4" style="max-width: 300px;">Mark prompts as favorites in the library to see them here.</p>
      <RouterLink to="/prompts" class="btn btn-primary px-4">Browse Prompts</RouterLink>
    </div>

    <section v-else class="row g-4 prompts-grid prompts-scrollable-grid">
      <div v-for="fav in favorites" :key="fav.promptId" class="col-md-6 col-xl-4">
        <article class="prompt-card favorite-card-modern h-100">
          <div class="card-body d-flex flex-column prompt-card-body">
            <div class="prompt-card-top-row">
              <label class="form-check mb-0 prompt-select-wrap" :aria-label="`Select ${fav.title}`">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  :checked="isSelected(fav.promptId)"
                  @change="toggleSelection(fav.promptId)"
                >
              </label>
              <span class="badge prompt-badge-category ms-auto">{{ fav.category || 'General' }}</span>
            </div>

            <h2 class="h6 fw-semibold mb-0 prompt-title">{{ fav.title }}</h2>

            <p class="prompt-content-preview mb-0">{{ fav.promptText }}</p>

            <div class="prompt-card-footer mt-auto">
              <button class="prompt-action-btn" title="Edit Prompt" @click="handleEdit(fav)">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="prompt-action-btn text-danger" title="Remove Favorite" @click="handleRemoveFavorite(fav.promptId)">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-card p-4" style="width: 500px; max-width: 90vw;">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="h5 mb-0 fw-bold">Edit Favorite</h3>
          <button type="button" class="btn-close" aria-label="Close" @click="closeEditModal"></button>
        </div>
        <div class="mb-3">
          <label class="form-label small fw-bold text-secondary">Title</label>
          <input v-model="editForm.title" class="form-control" placeholder="Prompt Title" />
        </div>
        <div class="mb-3">
          <label class="form-label small fw-bold text-secondary">Category</label>
          <input v-model="editForm.category" class="form-control" placeholder="Category (e.g. Technology)" />
        </div>
        <div class="mb-3">
          <label class="form-label small fw-bold text-secondary">Prompt Content</label>
          <textarea v-model="editForm.promptText" class="form-control prompt-textarea" rows="6"></textarea>
        </div>
        <div class="d-flex justify-content-end gap-2 mt-4">
          <button class="btn btn-outline-secondary btn-sm" @click="closeEditModal">Cancel</button>
          <button class="btn btn-primary btn-sm" @click="saveEdit" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="cancelDelete">
      <div class="modal-card p-4" style="width: 400px; max-width: 90vw;">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="h5 mb-0 fw-bold">Remove Favorite</h3>
          <button type="button" class="btn-close" aria-label="Close" @click="cancelDelete"></button>
        </div>
        <p class="text-secondary mb-4">Are you sure you want to remove this prompt from your favorites?</p>
        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-outline-secondary btn-sm" @click="cancelDelete">Cancel</button>
          <button class="btn btn-primary btn-sm" @click="confirmDelete" :disabled="isDeleting">
            {{ isDeleting ? 'Removing...' : 'Remove' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute, RouterLink } from 'vue-router';
import { appStore } from '../stores/appStore';
import { fetchUserFavorites, removeFavorite } from '../lib/favoritesApi';

// Define interface matching expected data
interface FavoritePrompt {
  promptId: number;
  title: string;
  promptText: string;
  category: string;
}

const favorites = ref<FavoritePrompt[]>([]);
const selectedPromptIds = ref<number[]>([]);
const showEditModal = ref(false);
const isSaving = ref(false);
const editingPrompt = ref<FavoritePrompt | null>(null);
const editForm = ref({ title: '', promptText: '', category: '' });
const showDeleteModal = ref(false);
const deletingPromptId = ref<number | null>(null);
const isDeleting = ref(false);

const isLoading = ref(true);
const router = useRouter();
const route = useRoute();

const navItems = [
  { name: 'Analytics', path: '/analytics', icon: 'bi-graph-up' },
  { name: 'Prompt Library', path: '/prompts', icon: 'bi-journal-text' },
  { name: 'Favorites', path: '/favorites', icon: 'bi-star-fill' },
  { name: 'Experiments', path: '/experiments', icon: 'bi-flask' }
];

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

async function loadFavorites() {
  const userId = appStore.state.user?.id;
  if (!userId) {
    isLoading.value = false;
    return;
  }
  
  isLoading.value = true;
  try {
    const response = await fetchUserFavorites(userId);
    favorites.value = response.favorites; 
  } catch (error) {
    console.error('Failed to load favorites', error);
    appStore.showToast('Failed to load favorites', 'danger');
  } finally {
    isLoading.value = false;
  }
}

function handleRemoveFavorite(promptId: number) {
  deletingPromptId.value = promptId;
  showDeleteModal.value = true;
}

async function confirmDelete() {
  const userId = appStore.state.user?.id;
  if (!userId || deletingPromptId.value === null) return;

  isDeleting.value = true;
  try {
    await removeFavorite(userId, deletingPromptId.value);
    favorites.value = favorites.value.filter(f => f.promptId !== deletingPromptId.value);
    selectedPromptIds.value = selectedPromptIds.value.filter(id => id !== deletingPromptId.value);
    appStore.showToast('Removed from favorites', 'info');
    showDeleteModal.value = false;
  } catch (error) {
    appStore.showToast('Failed to remove favorite', 'danger');
  } finally {
    isDeleting.value = false;
    deletingPromptId.value = null;
  }
}

function cancelDelete() {
  showDeleteModal.value = false;
  deletingPromptId.value = null;
}

function isSelected(id: number) {
  return selectedPromptIds.value.includes(id);
}

function toggleSelection(id: number) {
  if (isSelected(id)) {
    selectedPromptIds.value = selectedPromptIds.value.filter(i => i !== id);
  } else {
    if (selectedPromptIds.value.length >= 3) {
      appStore.showToast('You can select up to 3 prompts.', 'warning');
      return;
    }
    selectedPromptIds.value.push(id);
  }
}

function goToTestPrompt() {
  if (selectedPromptIds.value.length === 0) return;
  router.push({
    name: 'experiment-runner',
    params: { id: 'new' },
    query: { prompts: selectedPromptIds.value.join(',') },
  });
}

function closeEditModal() {
  showEditModal.value = false;
  editingPrompt.value = null;
}

function handleEdit(fav: FavoritePrompt) {
  editingPrompt.value = fav;
  editForm.value = {
    title: fav.title,
    promptText: fav.promptText,
    category: fav.category
  };
  showEditModal.value = true;
}

async function saveEdit() {
  if (!editingPrompt.value) return;
  isSaving.value = true;
  try {
    const userId = appStore.state.user?.id;
    if (userId) {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sourcePromptId: editingPrompt.value.promptId,
          customTitle: editForm.value.title,
          customCategory: editForm.value.category,
          customPromptText: editForm.value.promptText
        })
      });
      if (!response.ok) throw new Error('Failed to update favorite');
      // Refresh list
      await loadFavorites();
      closeEditModal();
      appStore.showToast('Favorite updated successfully', 'success');
    }
  } catch (error) {
    appStore.showToast('Failed to update favorite', 'danger');
  } finally {
    isSaving.value = false;
  }
}

onMounted(() => {
  loadFavorites();
});
</script>

<style scoped>
.favorites-page {
  padding: var(--spacing-xl);
}

/* Prompt Card Styles - Consistent with PromptsPage */
.prompt-card {
  background: var(--color-bg-card);
  border-radius: var(--border-radius-card);
  box-shadow: var(--shadow-card);
  border: none;
  transition: box-shadow 0.2s, transform 0.2s;
  display: flex;
  flex-direction: column;
}

.prompt-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}

.prompt-card-body {
  padding: var(--spacing-lg);
  gap: var(--spacing-sm);
  flex: 1; /* Allow body to grow */
}

.prompt-card-top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.prompt-title {
  font-family: var(--font-family-title);
  color: var(--color-text-title);
  font-size: 1rem;
  font-weight: 700;
}

.prompt-content-preview {
  color: var(--color-text-body);
  font-family: var(--font-family-base);
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
  padding-top: var(--spacing-sm);
  margin-top: auto;
  border-top: 1px solid var(--color-bg-bar);
}

.prompt-action-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: transform 0.2s;
  color: var(--color-text-body);
  font-size: 1.1rem;
}
.prompt-action-btn:hover {
  transform: scale(1.1);
}

.empty-state-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px; /* Ensure vertical centering */
  text-align: center;
  padding-bottom: 4rem; /* Visual balance */
}

.empty-icon {
  font-size: 4rem;
  color: #e2e8f0;
  line-height: 1;
}
</style>