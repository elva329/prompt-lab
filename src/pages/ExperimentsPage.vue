<template>
  <div class="fade-in-up experiments-page page-surface page-fullheight">
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

    <div class="page-content-scrollable">
      <section class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 page-header-row">
      <div>
        <h1 class="h5 fw-bold mb-1">Experiments</h1>
        <p class="text-secondary mb-0">View and re-run your saved prompt experiments.</p>
      </div>
      <button class="btn btn-primary" @click="router.push('/prompts')">
        <i class="bi bi-plus-lg me-1"></i>
        New Experiment
      </button>
    </section>

    <section v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-secondary mt-2 mb-0">Loading experiments...</p>
    </section>

    <section v-else-if="errorMessage" class="alert alert-danger mb-0">{{ errorMessage }}</section>

    <section v-else-if="experiments.length" class="row g-4">
      <div v-for="experiment in experiments" :key="experiment._id" class="col-md-6 col-xl-4">
        <article class="card border-0 shadow-sm h-100 experiment-row experiment-card-modern" @click="viewExperimentDetails(experiment._id)">
          <div class="card-body d-flex flex-column gap-2">
            <div class="d-flex justify-content-between align-items-center">
              <h2 class="h6 fw-semibold mb-0">Experiment {{ shortId(experiment._id) }}</h2>
              <span class="badge prompt-badge-muted">{{ experiment.prompts.length }} prompts</span>
            </div>

            <p class="small text-secondary mb-0">
              Created at {{ formatDate(experiment.createdAt) }}
            </p>

            <div class="small text-secondary">
              Prompt IDs: {{ experiment.prompts.join(', ') }}
            </div>

            <div class="mt-auto pt-2 border-top d-flex justify-content-end gap-2">
              <button class="btn btn-outline-secondary btn-sm" @click.stop="viewExperimentDetails(experiment._id)">
                <i class="bi bi-eye me-1"></i>
                View Details
              </button>
              <button class="btn btn-outline-primary btn-sm" @click.stop="rerunExperiment(experiment.prompts)">
                <i class="bi bi-play-fill me-1"></i>
                Re-run
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section v-else class="card border border-secondary-subtle border-dashed">
      <div class="card-body text-center text-secondary py-5">
        No experiments yet. Go to Prompt Library and select prompts to run your first experiment.
      </div>
    </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';

import { fetchUserByEmailRequest } from '../lib/authApi';
import { fetchExperimentsRequest, type ExperimentRecord } from '../lib/experimentsApi';
import { appStore } from '../stores/appStore';

const router = useRouter();
const route = useRoute();
const isLoading = ref(false);
const errorMessage = ref('');
const experiments = ref<ExperimentRecord[]>([]);

function shortId(value: string): string {
  return value.slice(-6).toUpperCase();
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

  const navItems = [
      { name: 'Analytics', path: '/analytics' },
      { name: 'Prompt Library', path: '/prompts' },
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

function rerunExperiment(promptIds: number[]): void {
  router.push({
    name: 'experiment-runner',
    params: { id: 'new' },
    query: { prompts: promptIds.join(',') },
  });
}

function viewExperimentDetails(experimentId: string): void {
  router.push({
    name: 'experiment-runner',
    params: { id: experimentId },
  });
}

async function loadExperiments(): Promise<void> {
  let resolvedUserId = appStore.state.user?.id || '';

  if (!resolvedUserId) {
    const savedEmail = window.localStorage.getItem('promptlab_user_email');

    if (savedEmail) {
      try {
        const userData = await fetchUserByEmailRequest(savedEmail);
        if (userData.user?.id) {
          resolvedUserId = userData.user.id;
          window.localStorage.setItem('promptlab_user_id', userData.user.id);

          if (appStore.state.user) {
            appStore.state.user.id = userData.user.id;
          } else {
            appStore.state.user = {
              id: userData.user.id,
              email: userData.user.email || savedEmail,
            };
          }
        }
      } catch {
        errorMessage.value = 'Please log in again to load experiments.';
        return;
      }
    }
  }

  if (!resolvedUserId) {
    errorMessage.value = 'Please log in again to load experiments.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    experiments.value = await fetchExperimentsRequest(resolvedUserId);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load experiments.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadExperiments();
});
</script>
