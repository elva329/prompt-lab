<template>
  <div class="landing-stage d-flex flex-column grow">
    <section class="container-xl py-4 py-md-5 grow d-flex align-items-center">
      <div class="landing-board w-100">
        <div class="floating-card floating-note d-none d-md-block">
          <p class="mb-0">Compare prompt variants with reliable metrics and clear winners.</p>
        </div>
        <div class="floating-card floating-integrations d-none d-lg-block">
          <p class="small text-uppercase mb-2">Connected Models</p>
          <div class="d-flex gap-2">
            <span class="model-pill">GPT</span>
            <span class="model-pill">Claude</span>
            <span class="model-pill">Custom</span>
          </div>
        </div>
        <div class="floating-card floating-status d-none d-lg-flex align-items-center gap-2">
          <i class="bi bi-check2-circle"></i>
          <span>Experiment results synced</span>
        </div>

        <div class="landing-content text-center">
          <div class="landing-orb mb-3 mb-md-4">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <h1 class="landing-title mb-3">
            Think, test, and refine
            <span>all in one lab</span>
          </h1>
          <p class="landing-subtitle mb-4">
            Build stronger prompts with side-by-side experiments, measurable quality scores, and a clean workflow
            for teams.
          </p>
          <div class="d-flex flex-column flex-sm-row justify-content-center gap-3 mb-4">
            <button class="btn landing-primary-btn px-4 py-2" @click="goLogin">Get free demo</button>
            <button class="btn landing-secondary-btn px-4 py-2" @click="goLogin">View experiments</button>
          </div>

          <div class="row g-3 g-md-4 landing-feature-row text-start">
            <div v-for="feature in features" :key="feature.title" class="col-md-4">
              <article class="landing-feature h-100">
                <div class="landing-feature-icon">
                  <i :class="feature.icon"></i>
                </div>
                <h3 class="h6 fw-semibold mb-1">{{ feature.title }}</h3>
                <p class="small mb-0 text-secondary">{{ feature.desc }}</p>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue';
import { useRouter } from 'vue-router';

import { appStore } from '../stores/appStore';

const router = useRouter();

watchEffect(() => {
  if (appStore.isAuthenticated.value) {
    router.push('/dashboard');
  }
});

const features = [
  { icon: 'bi bi-lightning-charge', title: 'Rapid Prototyping', desc: 'Create and iterate on prompts in seconds.' },
  { icon: 'bi bi-columns-gap', title: 'Prompt Comparisons', desc: 'Run A/B experiments against identical tasks.' },
  { icon: 'bi bi-bar-chart', title: 'Measured Quality', desc: 'Track relevance, clarity, coherence, and speed.' },
];

function goLogin(): void {
  router.push('/login');
}
</script>
