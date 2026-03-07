<template>
  <div class="d-flex flex-column flex-grow-1">
    <section class="container py-5 text-center landing-hero">
      <div class="badge rounded-pill text-bg-primary-subtle text-primary-emphasis mb-4 px-3 py-2">
        <i class="bi bi-beaker me-2"></i>
        The Ultimate Prompt Engineering Environment
      </div>
      <h1 class="display-4 fw-bold lh-sm mb-3">
        Stop Guessing.<br class="d-none d-md-block" />
        <span class="gradient-text">Start Testing.</span>
      </h1>
      <p class="lead text-secondary col-lg-8 mx-auto mb-4">
        A structured platform to create, test, and evaluate AI prompts. Run side-by-side experiments to find
        the most effective instructions for your specific tasks.
      </p>
      <div class="d-flex flex-column flex-sm-row justify-content-center gap-3">
        <button class="btn btn-dark btn-lg px-4" @click="goLogin">
          Enter the Lab
          <i class="bi bi-arrow-right ms-2"></i>
        </button>
        <button class="btn btn-outline-secondary btn-lg px-4" @click="goLogin">View Examples</button>
      </div>
    </section>

    <section class="py-5 border-top bg-body-tertiary">
      <div class="container">
        <div class="row g-4">
          <div v-for="feature in features" :key="feature.title" class="col-md-4">
            <article class="card h-100 border-0 shadow-sm feature-card">
              <div class="card-body text-center p-4">
                <div class="feature-icon mx-auto mb-3">
                  <i :class="feature.icon"></i>
                </div>
                <h3 class="h5 fw-semibold">{{ feature.title }}</h3>
                <p class="text-secondary mb-0">{{ feature.desc }}</p>
              </div>
            </article>
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
  { icon: 'bi bi-lightning-charge', title: 'Rapid Prototyping', desc: 'Create and iterate on prompts instantly.' },
  { icon: 'bi bi-bullseye', title: 'A/B Testing', desc: 'Run multiple prompts against the same task.' },
  { icon: 'bi bi-bar-chart', title: 'Data-Driven Insights', desc: 'Evaluate responses with concrete metrics.' },
];

function goLogin(): void {
  router.push('/login');
}
</script>
