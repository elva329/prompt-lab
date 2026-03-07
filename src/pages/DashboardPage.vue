<template>
  <div class="vstack gap-3 fade-in-up dashboard-page">
    <section class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
      <div>
        <h1 class="h2 fw-bold mb-1">Welcome back, {{ firstName }}</h1>
        <p class="text-secondary mb-0">Here's what's happening in your lab today.</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary" @click="router.push('/prompts')">
          <i class="bi bi-plus-lg me-1"></i>
          New Prompt
        </button>
        <button class="btn btn-dark" @click="router.push('/experiments/new')">
          <i class="bi bi-flask me-1"></i>
          Run Experiment
        </button>
      </div>
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
              :key="exp.id"
              class="list-group-item py-2 experiment-row"
              @click="router.push(`/experiments/${exp.id}`)"
            >
              <div class="d-flex justify-content-between align-items-start gap-3">
                <div>
                  <p class="fw-semibold mb-1">{{ exp.name }}</p>
                  <p class="small text-secondary mb-0">{{ exp.taskDescription }}</p>
                </div>
                <div class="text-end">
                  <span class="badge rounded-pill text-bg-success" v-if="exp.status === 'completed'">completed</span>
                  <span class="badge rounded-pill text-bg-warning" v-else>draft</span>
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
              <div v-for="item in CATEGORY_STATS.slice(0, 6)" :key="item.name">
                <div class="d-flex justify-content-between small mb-1">
                  <span>{{ item.name }}</span>
                  <span class="text-secondary">{{ item.count }}</span>
                </div>
                <div class="progress" style="height: 6px;" role="progressbar" :aria-valuenow="item.count" aria-valuemin="0" aria-valuemax="50">
                  <div class="progress-bar" :style="{ width: `${item.count * 2}%` }"></div>
                </div>
              </div>
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

import { fetchPrompts } from '../lib/promptsApi';
import { CATEGORY_STATS } from '../lib/mockData';
import { appStore } from '../stores/appStore';

const router = useRouter();
const totalPrompts = ref(0);

const firstName = computed(() => {
  const email = appStore.state.user?.email;
  if (!email) {
    return 'Researcher';
  }

  return email.split('@')[0];
});

const stats = computed(() => [
  { title: 'Total Prompts', value: totalPrompts.value, icon: 'bi bi-file-text', className: 'stat-blue' },
  { title: 'Experiments Run', value: appStore.state.experiments.length, icon: 'bi bi-flask', className: 'stat-indigo' },
  { title: 'Avg Quality Score', value: '86/100', icon: 'bi bi-star-fill', className: 'stat-gold' },
]);

const recentExperiments = computed(() => appStore.state.experiments.slice(0, 3));

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

onMounted(async () => {
  try {
    const response = await fetchPrompts({ limit: 1, offset: 0 });
    totalPrompts.value = response.total;
  } catch (error) {
    console.error('Failed to fetch prompts count:', error);
  }
});
</script>
