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
        <button class="btn btn-outline-secondary btn-sm" @click="showCreateModal = true" title="Create a new prompt">
          <i class="bi bi-plus-circle me-1"></i>
          Create
        </button>
        <button class="btn btn-primary btn-sm" :disabled="selectedPromptIds.length === 0 || selectedPromptIds.length > 3" @click="goToTestPrompt">
          Test Prompts
        </button>
      </div>
    </section>

    <div v-if="selectedPromptIds.length > 3" class="alert alert-warning px-4 py-3 mb-4" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      You can select up to 3 prompts only. Please deselect some prompts before testing.
    </div>

    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading favorites</p>
    </div>

    <div v-else-if="favorites.length === 0" class="empty-state-wrapper">
      <div class="empty-icon mb-3">
        <i class="bi bi-heart"></i>
      </div>
      <h3 class="h5 fw-bold text-secondary mb-2">No favorites yet</h3>
      <p class="text-muted small mb-4" style="max-width: 300px;">Create your own prompts or mark prompts as favorites in the library to see them here.</p>
      <div class="d-flex gap-2">
        <button class="btn btn-primary px-4" @click="showCreateModal = true">Create Prompt</button>
        <RouterLink to="/prompts" class="btn btn-outline-primary px-4">Browse Prompts</RouterLink>
      </div>
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

    <!-- Create Prompt Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="closeCreateModal">
      <div class="modal-card p-4" style="width: 500px; max-width: 90vw;">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="h5 mb-0 fw-bold">Create New Prompt</h3>
          <button type="button" class="btn-close" aria-label="Close" @click="closeCreateModal"></button>
        </div>
        <div class="mb-3">
          <label class="form-label small fw-bold text-secondary">Title</label>
          <input v-model="createForm.title" class="form-control" placeholder="Prompt Title" />
        </div>
        <div class="mb-3">
          <label class="form-label small fw-bold text-secondary">Category</label>
          <input v-model="createForm.category" class="form-control" placeholder="Category (e.g. Technology)" />
        </div>
        <div class="mb-3">
          <label class="form-label small fw-bold text-secondary">Prompt Content</label>
          <textarea v-model="createForm.promptText" class="form-control prompt-textarea" rows="6" placeholder="Enter your prompt text here..."></textarea>
        </div>
        <div class="d-flex justify-content-end gap-2 mt-4">
          <button class="btn btn-outline-secondary btn-sm" @click="closeCreateModal">Cancel</button>
          <button class="btn btn-primary btn-sm" @click="saveCreate" :disabled="isCreating || !createForm.title || !createForm.promptText">
            {{ isCreating ? 'Creating...' : 'Create Prompt' }}
          </button>
        </div>
      </div>
    </div>

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
import { fetchUserFavorites, removeFavorite, createPrompt } from '../lib/favoritesApi';
import { getAuthHeaders } from '../lib/authApi';

// Define interface matching expected data
interface FavoritePrompt {
  promptId: string;
  title: string;
  promptText: string;
  category: string;
}

const favorites = ref<FavoritePrompt[]>([]);
const selectedPromptIds = ref<string[]>([]);
const showEditModal = ref(false);
const isSaving = ref(false);
const editingPrompt = ref<FavoritePrompt | null>(null);
const editForm = ref({ title: '', promptText: '', category: '' });
const showDeleteModal = ref(false);
const deletingPromptId = ref<string | null>(null);
const isDeleting = ref(false);

const showCreateModal = ref(false);
const isCreating = ref(false);
const createForm = ref({ title: '', promptText: '', category: '' });

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
    const response = await fetchUserFavorites();
    favorites.value = response.favorites; 
  } catch (error) {
    console.error('Failed to load favorites', error);
    appStore.showToast('Failed to load favorites', 'danger');
  } finally {
    isLoading.value = false;
  }
}

function handleRemoveFavorite(promptId: string) {
  deletingPromptId.value = promptId;
  showDeleteModal.value = true;
}

async function confirmDelete() {
  const userId = appStore.state.user?.id;
  if (!userId || deletingPromptId.value === null) return;

  isDeleting.value = true;
  try {
    await removeFavorite(deletingPromptId.value);
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

function isSelected(id: string) {
  return selectedPromptIds.value.includes(id);
}

function toggleSelection(id: string) {
  if (isSelected(id)) {
    selectedPromptIds.value = selectedPromptIds.value.filter(i => i !== id);
  } else {
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

function closeCreateModal() {
  showCreateModal.value = false;
  createForm.value = { title: '', promptText: '', category: '' };
}

async function saveCreate() {
  if (!createForm.value.title || !createForm.value.promptText) {
    appStore.showToast('Title and prompt content are required', 'warning');
    return;
  }

  isCreating.value = true;
  try {
    await createPrompt(
      createForm.value.title,
      createForm.value.promptText,
      createForm.value.category
    );
    await loadFavorites();
    closeCreateModal();
    appStore.showToast('Prompt created successfully', 'success');
  } catch (error) {
    appStore.showToast(error instanceof Error ? error.message : 'Failed to create prompt', 'danger');
  } finally {
    isCreating.value = false;
  }
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
    const response = await fetch(`/api/favorites/${editingPrompt.value.promptId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        customTitle: editForm.value.title,
        customCategory: editForm.value.category,
        customPromptText: editForm.value.promptText
      })
    });
    if (!response.ok) throw new Error('Failed to update favorite');
    // Refresh list
    await loadFavorites();
    closeEditModal();
    appStore.showToast('Prompt updated successfully', 'success');
  } catch (error) {
    appStore.showToast('Failed to update prompt', 'danger');
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

/* Prompt Card Styles - Modern Design System */
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

.prompt-action-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: transform 0.2s;
  color: #475569;
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