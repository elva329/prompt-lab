<template>
  <div class="landing-stage d-flex flex-column grow">
    <section class="landing-hero-section grow d-flex align-items-center">
      <div class="w-100 py-3 py-md-4 px-3 px-md-4 px-xl-5">
        <div class="landing-shell w-100">
          <header class="landing-topbar">
            <div class="landing-entrybar">
              <div class="landing-entry-actions d-flex align-items-center gap-2">
                <template v-if="isAuthenticated">
                  <button class="btn landing-secondary-btn landing-auth-btn" @click="handleLogout">Logout</button>
                </template>
                <template v-else>
                    <button class="btn btn-link landing-login-link" @click="goLogin">Login</button>
                    <button class="btn landing-register-btn" @click="goRegister">Register</button>
                </template>
              </div>
            </div>
          </header>

          <div class="landing-hero-grid">
            <section class="landing-hero-copy">
              <div class="landing-eyebrow-row mb-3">
                <span class="landing-eyebrow-pill">Analytics-first</span>
                <span class="landing-eyebrow-note">Prompt testing, score review, and experiment tracking in one place</span>
              </div>

              <h1 class="landing-title mb-3">
                Clear prompt experiments.
                <span>Faster decisions.</span>
              </h1>

              <p class="landing-subtitle mb-4">
                Prompt Lab helps teams compare prompt variants, review model outputs, and identify the strongest
                option with a clean, trustworthy analytics workflow.
              </p>

              <div class="landing-cta-row d-flex flex-column flex-sm-row gap-3 mb-4">
                <button class="btn landing-primary-btn px-4 py-2" @click="goAnalyticsEntry">
                  {{ isAuthenticated ? 'Open analytics' : 'Start free demo' }}
                </button>
                <button class="btn landing-secondary-btn px-4 py-2" @click="goExperimentsEntry">View experiments</button>
              </div>

              <div class="landing-kpi-strip mb-4">
                <div v-for="kpi in heroKpis" :key="kpi.label" class="landing-kpi-pill">
                  <p class="landing-kpi-label mb-1">{{ kpi.label }}</p>
                  <p class="landing-kpi-value mb-0">{{ kpi.value }}</p>
                </div>
              </div>

              <div class="landing-process-grid">
                <article v-for="step in processSteps" :key="step.title" class="landing-process-card">
                  <div class="landing-process-index">{{ step.index }}</div>
                  <div>
                    <h3 class="landing-process-title mb-1">{{ step.title }}</h3>
                    <p class="landing-process-copy mb-0">{{ step.desc }}</p>
                  </div>
                </article>
              </div>
            </section>

            <aside class="landing-preview-panel">
              <div class="landing-preview-header">
                <div>
                  <p class="landing-preview-kicker mb-1">Workspace snapshot</p>
                  <p class="landing-preview-title mb-0">One view for experiments and outcomes</p>
                </div>
                <span class="landing-preview-badge">Live data</span>
              </div>

              <figure class="landing-preview-image-wrap mb-3">
                <img
                  src="/experiment-result-preview.svg"
                  alt="Preview of an experiment result dashboard showing Prompt B as winner"
                  class="landing-preview-image"
                />
              </figure>

              <div class="landing-preview-metrics">
                <article v-for="feature in features" :key="feature.title" class="landing-feature-card">
                  <div class="landing-feature-icon">
                    <i :class="feature.icon"></i>
                  </div>
                  <div>
                    <h3 class="landing-feature-title mb-1">{{ feature.title }}</h3>
                    <p class="landing-feature-copy mb-0">{{ feature.desc }}</p>
                  </div>
                </article>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { appStore } from '../stores/appStore';

const router = useRouter();
const isAuthenticated = computed(() => appStore.isAuthenticated.value);

const features = [
  { icon: 'bi bi-lightning-charge', title: 'Rapid prototyping', desc: 'Draft and refine prompt variants without losing momentum.' },
  { icon: 'bi bi-columns-gap', title: 'Side-by-side testing', desc: 'Compare outputs with the same task and scoring rules.' },
  { icon: 'bi bi-bar-chart', title: 'Quality visibility', desc: 'Track clarity, relevance, coherence, and response time.' },
];

const heroKpis = [
  { label: 'Experiments', value: '1,240+' },
  { label: 'Average Lift', value: '17.8%' },
  { label: 'Active Teams', value: '42' },
];

const processSteps = [
  { index: '01', title: 'Compose', desc: 'Build prompt variants and keep the evaluation task consistent.' },
  { index: '02', title: 'Compare', desc: 'Review outputs in a structured experiment view with clear winners.' },
  { index: '03', title: 'Decide', desc: 'Use analytics to pick the strongest prompt and keep improving it.' },
];

function goLogin(): void {
  router.push({ name: 'login', query: { redirect: 'analytics' } });
}

function goRegister(): void {
  router.push({ name: 'login', query: { mode: 'register', redirect: 'analytics' } });
}

function goAnalyticsEntry(): void {
  if (isAuthenticated.value) {
    router.push('/analytics');
    return;
  }

  router.push({ name: 'login', query: { redirect: 'analytics' } });
}

function goExperimentsEntry(): void {
  if (isAuthenticated.value) {
    router.push('/experiments');
    return;
  }

  router.push({ name: 'login', query: { redirect: 'analytics' } });
}

function handleLogout(): void {
  appStore.logout();
}
</script>
