<template>
  <div class="vstack gap-3 fade-in-up dashboard-page">
    <section>
      <h1 class="h2 fw-bold mb-1">Welcome back, {{ firstName }}</h1>
      <p class="text-secondary mb-0">Here's what's happening in your lab today.</p>
    </section>

    <section class="row g-3">
      <div v-for="stat in stats" :key="stat.title" class="col-md-4">
        <article class="card border-0 shadow-sm h-100">
          <div class="card-body d-flex align-items-center gap-3">
            <div class="stat-icon" :class="stat.className">
              <i :class="stat.icon"></i>
            </div>
            <div>
              <p class="small text-secondary mb-1">{{ stat.title }}</p>
              <p class="h4 fw-bold mb-0">{{ stat.value }}</p>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="row g-3">
      <div class="col-xl-8">
        <article class="card border-0 shadow-sm">
          <div class="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3">
            <h2 class="h6 fw-semibold mb-0">
              <i class="bi bi-flask me-2 text-primary"></i>
              Recent Experiments
            </h2>
            <button class="btn btn-link text-decoration-none" @click="router.push('/experiments')">View All</button>
          </div>
          <ul v-if="recentExperiments.length" class="list-group list-group-flush dashboard-recent-list">
            <li
              v-for="exp in recentExperiments"
              :key="exp._id"
              class="list-group-item py-2 experiment-row"
              @click="router.push('/experiments')"
            >
              <div class="d-flex justify-content-between align-items-start gap-3">
                <div>
                  <p class="fw-semibold mb-1">Experiment {{ shortId(exp._id) }}</p>
                  <p class="small text-secondary mb-0">{{ exp.prompts.length }} prompt(s) tested</p>
                </div>
                <div class="text-end">
                  <span class="badge rounded-pill text-bg-success" v-if="exp.status === 'completed'">completed</span>
                  <span class="badge rounded-pill text-bg-warning" v-else>draft</span>
                  <p v-if="typeof exp.avgQualityScore === 'number'" class="small text-secondary mb-0 mt-1">{{ exp.avgQualityScore }}/100</p>
                  <p class="small text-secondary mb-0 mt-1">{{ formatDate(exp.createdAt) }}</p>
                </div>
              </div>
            </li>
          </ul>
          <div v-else class="card-body text-center text-secondary py-4">No experiments run yet. Start testing!</div>
        </article>
      </div>

      <div class="col-xl-4">
        <article class="card border-0 shadow-sm">
          <div class="card-body">
            <h2 class="h6 fw-semibold mb-3">Top Categories</h2>
            <div class="vstack gap-2">
              <div v-for="item in topCategories" :key="item.name">
                <div class="d-flex justify-content-between small mb-1">
                  <span>{{ item.name }}</span>
                  <span class="text-secondary">{{ item.count }}</span>
                </div>
                <div class="progress" style="height: 6px;" role="progressbar" :aria-valuenow="item.count" aria-valuemin="0" :aria-valuemax="topCategoryMax">
                  <div class="progress-bar" :style="{ width: `${Math.round((item.count / topCategoryMax) * 100)}%` }"></div>
                </div>
              </div>
              <p v-if="!topCategories.length" class="small text-secondary mb-0">No category data yet.</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { fetchUserByEmailRequest } from '../lib/authApi';
import { fetchExperimentsRequest, type ExperimentRecord } from '../lib/experimentsApi';
import { fetchPrompts } from '../lib/promptsApi';
import { fetchResultsSummaryRequest } from '../lib/resultsApi';
import { appStore } from '../stores/appStore';

const router = useRouter();
const totalPrompts = ref(0);
const experiments = ref<ExperimentRecord[]>([]);
const dashboardSummary = ref({
  experimentsRun: 0,
  avgQualityScore: null as number | null,
  topCategories: [] as Array<{ name: string; count: number }>,
});

const firstName = computed(() => {
  const email = appStore.state.user?.email;
  if (!email) {
    return 'Researcher';
  }

  return email.split('@')[0];
});

const avgQualityDisplay = computed(() => {
  if (typeof dashboardSummary.value.avgQualityScore !== 'number') {
    return 'N/A';
  }

  return `${dashboardSummary.value.avgQualityScore}/100`;
});

const stats = computed(() => [
  { title: 'Total Prompts', value: totalPrompts.value, icon: 'bi bi-file-text', className: 'stat-blue' },
  { title: 'Experiments Run', value: dashboardSummary.value.experimentsRun, icon: 'bi bi-flask', className: 'stat-indigo' },
  { title: 'Avg Quality Score', value: avgQualityDisplay.value, icon: 'bi bi-star-fill', className: 'stat-gold' },
]);

const recentExperiments = computed(() => experiments.value.slice(0, 3));
const topCategories = computed(() => dashboardSummary.value.topCategories.slice(0, 6));
const topCategoryMax = computed(() => {
  const max = topCategories.value[0]?.count ?? 0;
  return max > 0 ? max : 1;
});

function shortId(value: string): string {
  return value.slice(-6).toUpperCase();
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString();
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
        }
      } catch {
        experiments.value = [];
        return;
      }
    }
  }

  if (!resolvedUserId) {
    experiments.value = [];
    return;
  }

  try {
    experiments.value = await fetchExperimentsRequest(resolvedUserId);
  } catch (error) {
    console.error('Failed to fetch experiments for dashboard:', error);
    experiments.value = [];
  }
}

async function loadDashboardSummary(userId: string): Promise<void> {
  try {
    const response = await fetchResultsSummaryRequest(userId);
    dashboardSummary.value = {
      experimentsRun: response.experimentsRun,
      avgQualityScore: response.avgQualityScore,
      topCategories: response.topCategories,
    };
  } catch (error) {
    console.error('Failed to fetch dashboard summary:', error);
    dashboardSummary.value = {
      experimentsRun: 0,
      avgQualityScore: null,
      topCategories: [],
    };
  }
}

onMounted(async () => {
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
        resolvedUserId = '';
      }
    }
  }

  try {
    const response = await fetchPrompts({ limit: 1, offset: 0 });
    totalPrompts.value = response.total;
  } catch (error) {
    console.error('Failed to fetch prompts count:', error);
  }

  if (resolvedUserId) {
    await loadExperiments();
    await loadDashboardSummary(resolvedUserId);
  }
});
</script>
