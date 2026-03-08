<template>
  <div class="vstack gap-3 fade-in-up">
    <section class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
      <div>
        <h1 class="h2 fw-bold mb-1">Favorites</h1>
        <p class="text-secondary mb-0">Your saved prompts for quick access.</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary" @click="openCreateModal">
          <i class="bi bi-plus-lg me-1"></i>
          New Prompt
        </button>
        <button class="btn btn-outline-primary" @click="router.push('/prompts')">
          <i class="bi bi-search me-1"></i>
          Browse Prompts
        </button>
      </div>
    </section>

    <section v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-secondary mt-2 mb-0">Loading favorites...</p>
    </section>

    <section v-else-if="errorMessage" class="alert alert-danger mb-0">{{ errorMessage }}</section>

    <section v-else-if="favoritePrompts.length" class="row g-3">
      <div v-for="prompt in favoritePrompts" :key="prompt.promptId" class="col-md-6 col-xl-4">
        <article class="card border-0 shadow-sm h-100 prompt-card">
          <div class="card-body d-flex flex-column gap-2">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <h2 class="h6 fw-semibold mb-0">{{ prompt.title }}</h2>
              <span class="badge text-bg-secondary">{{ prompt.category }}</span>
            </div>

            <p class="prompt-content-preview mb-0">{{ prompt.promptText }}</p>

            <div class="mt-auto pt-2 border-top d-flex justify-content-end align-items-center small text-secondary">
              <div class="d-flex gap-2">
                <button class="btn btn-outline-primary btn-sm" @click="openEditModal(prompt)">
                  <i class="bi bi-pencil-square me-1"></i>
                  Edit
                </button>
                <button class="btn btn-outline-danger btn-sm" @click="removeFavorite(prompt.promptId)">
                  <i class="bi bi-heartbreak me-1"></i>
                  Remove
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section v-else class="card border border-secondary-subtle border-dashed">
      <div class="card-body text-center text-secondary py-5">
        No favorites yet. Go to Prompt Library and click the heart icon to save prompts.
      </div>
    </section>

    <div v-if="editingPrompt" class="modal-overlay p-3">
      <div class="card border-0 shadow-lg w-100 modal-card">
        <div class="card-body p-4">
          <h2 class="h4 fw-bold mb-3">Edit Favorite Prompt</h2>
          <div class="vstack gap-3">
            <div>
              <label class="form-label">Title</label>
              <input v-model.trim="editForm.title" type="text" class="form-control" />
            </div>
            <div>
              <label class="form-label">Category</label>
              <input v-model.trim="editForm.category" type="text" class="form-control" />
            </div>
            <div>
              <label class="form-label">Prompt Text</label>
              <textarea v-model="editForm.promptText" class="form-control" rows="6"></textarea>
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-4">
            <button class="btn btn-outline-secondary" :disabled="isSaving" @click="closeEditModal">Cancel</button>
            <button class="btn btn-primary" :disabled="isSaving" @click="savePromptEdits">
              <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status"></span>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal" class="modal-overlay p-3">
      <div class="card border-0 shadow-lg w-100 modal-card">
        <div class="card-body p-4">
          <h2 class="h4 fw-bold mb-3">Create New Prompt</h2>
          <div class="vstack gap-3">
            <div>
              <label class="form-label">Title</label>
              <input v-model.trim="createForm.title" type="text" class="form-control" placeholder="Enter prompt title" />
            </div>
            <div>
              <label class="form-label">Category</label>
              <input v-model.trim="createForm.category" type="text" class="form-control" placeholder="e.g., writing, programming, business" />
            </div>
            <div>
              <label class="form-label">Prompt Text</label>
              <textarea v-model="createForm.promptText" class="form-control" rows="6" placeholder="Enter your prompt text..."></textarea>
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-4">
            <button class="btn btn-outline-secondary" :disabled="isCreating" @click="closeCreateModal">Cancel</button>
            <button class="btn btn-primary" :disabled="isCreating" @click="createNewPrompt">
              <span v-if="isCreating" class="spinner-border spinner-border-sm me-2" role="status"></span>
              Create & Add to Favorites
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  addOrUpdateFavorite,
  fetchUserFavorites,
  type FavoritePromptWithMerged,
  removeFavorite as removeFavoriteApi,
} from '../lib/favoritesApi';
import { createPrompt } from '../lib/promptsApi';
import { appStore } from '../stores/appStore';

const router = useRouter();

const isLoading = ref(false);
const errorMessage = ref('');
const favoritePrompts = ref<FavoritePromptWithMerged[]>([]);
const editingPrompt = ref<FavoritePromptWithMerged | null>(null);
const isSaving = ref(false);
const editForm = ref({
  title: '',
  category: '',
  promptText: '',
});
const showCreateModal = ref(false);
const isCreating = ref(false);
const createForm = ref({
  title: '',
  category: '',
  promptText: '',
});

async function loadFavorites(): Promise<void> {
  const userId = appStore.state.user?.id;
  if (!userId) {
    errorMessage.value = 'Please log in to view favorites.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await fetchUserFavorites(userId);
    favoritePrompts.value = response.favorites;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load favorites.';
  } finally {
    isLoading.value = false;
  }
}

async function removeFavorite(promptId: number): Promise<void> {
  const userId = appStore.state.user?.id;
  if (!userId) {
    appStore.showToast('Please log in to remove favorites.', 'warning');
    return;
  }

  try {
    await removeFavoriteApi(userId, promptId);
    favoritePrompts.value = favoritePrompts.value.filter((entry) => entry.promptId !== promptId);
    appStore.showToast('Removed from favorites.', 'info');
  } catch (error) {
    appStore.showToast(error instanceof Error ? error.message : 'Failed to remove favorite.', 'danger');
  }
}

function openEditModal(prompt: FavoritePromptWithMerged): void {
  editingPrompt.value = prompt;
  editForm.value = {
    title: prompt.title,
    category: prompt.category,
    promptText: prompt.promptText,
  };
}

function closeEditModal(): void {
  editingPrompt.value = null;
}

function openCreateModal(): void {
  showCreateModal.value = true;
  createForm.value = {
    title: '',
    category: '',
    promptText: '',
  };
}

function closeCreateModal(): void {
  showCreateModal.value = false;
}

async function createNewPrompt(): Promise<void> {
  const userId = appStore.state.user?.id;
  if (!userId) {
    appStore.showToast('Please log in to create prompts.', 'warning');
    return;
  }

  if (!createForm.value.title.trim() || !createForm.value.promptText.trim() || !createForm.value.category.trim()) {
    appStore.showToast('Please fill in all fields.', 'warning');
    return;
  }

  isCreating.value = true;

  try {
    const response = await createPrompt({
      title: createForm.value.title,
      promptText: createForm.value.promptText,
      category: createForm.value.category,
      userId,
    });

    await addOrUpdateFavorite(userId, response.prompt.promptId);

    await loadFavorites();

    closeCreateModal();
    appStore.showToast('Prompt created and added to favorites!', 'success');
  } catch (error) {
    appStore.showToast(error instanceof Error ? error.message : 'Failed to create prompt.', 'danger');
  } finally {
    isCreating.value = false;
  }
}

async function savePromptEdits(): Promise<void> {
  if (!editingPrompt.value) {
    return;
  }

  const userId = appStore.state.user?.id;
  if (!userId) {
    appStore.showToast('Please log in to edit favorites.', 'warning');
    return;
  }

  if (!editForm.value.title.trim() || !editForm.value.promptText.trim() || !editForm.value.category.trim()) {
    appStore.showToast('Please fill in title, category, and prompt text.', 'warning');
    return;
  }

  isSaving.value = true;

  try {
    await addOrUpdateFavorite(userId, editingPrompt.value.sourcePromptId, {
      customTitle: editForm.value.title,
      customCategory: editForm.value.category,
      customPromptText: editForm.value.promptText,
    });

    favoritePrompts.value = favoritePrompts.value.map((entry) => {
      if (entry.promptId !== editingPrompt.value!.promptId) {
        return entry;
      }

      return {
        ...entry,
        title: editForm.value.title,
        category: editForm.value.category,
        promptText: editForm.value.promptText,
        customTitle: editForm.value.title,
        customCategory: editForm.value.category,
        customPromptText: editForm.value.promptText,
        updatedAt: new Date().toISOString(),
      };
    });

    closeEditModal();
    appStore.showToast('Favorite prompt updated.', 'success');
  } catch (error) {
    appStore.showToast(error instanceof Error ? error.message : 'Failed to update prompt.', 'danger');
  } finally {
    isSaving.value = false;
  }
}

onMounted(() => {
  loadFavorites();
});
</script>
