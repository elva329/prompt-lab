<template>
  <div class="landing-stage d-flex flex-column grow">
    <section class="landing-hero-section grow d-flex align-items-center">
      <div class="w-100 py-3 py-md-4 px-3 px-md-4 px-xl-5">
        <div class="landing-shell w-100">
          <div class="landing-entrybar">
            <div class="landing-entry-actions d-flex align-items-center gap-2">
              <button class="btn btn-link landing-login-link" @click="goLogin">Login</button>
              <button class="btn landing-register-btn" @click="goLogin">Register</button>
            </div>
          </div>

          <div class="landing-brand-cluster">
            <div class="landing-brand-mark">
              <i class="bi bi-grid-3x3-gap-fill"></i>
            </div>
            <div class="text-start">
              <p class="landing-brand-kicker mb-1">Experiment Workspace</p>
              <h2 class="landing-brand-name mb-0">Prompt Lab</h2>
            </div>
          </div>

          <div class="landing-content text-center">
            <!-- <div class="landing-project-block mb-3 mb-md-4">
              <p class="landing-project-kicker mb-1">Project</p>
              <p class="landing-project-name mb-0">PromptLab</p>
            </div> -->
            <h1 class="landing-title mb-3">
              Think, test, and refine
              <span>all in one lab</span>
            </h1>
            <p class="landing-subtitle mb-4">
              Build stronger prompts with side-by-side experiments, measurable quality scores, and a clean workflow
              for teams.
            </p>

            <div class="landing-kpi-strip mb-4">
              <div v-for="kpi in heroKpis" :key="kpi.label" class="landing-kpi-pill">
                <p class="landing-kpi-label mb-1">{{ kpi.label }}</p>
                <p class="landing-kpi-value mb-0">{{ kpi.value }}</p>
              </div>
            </div>

            <div class="d-flex flex-column flex-sm-row justify-content-center gap-3 mb-4">
              <button class="btn landing-primary-btn px-4 py-2" @click="goLogin">Get free demo</button>
              <button class="btn landing-secondary-btn px-4 py-2" @click="goLogin">View experiments</button>
            </div>

            <div class="landing-showcase text-start">
              <div class="showcase-left">
                <!-- <div class="workspace-corner-note">
                  <p class="mb-0">Compare prompt variants with reliable metrics and clear winners.</p>
                </div> -->

                <aside class="showcase-side">
                <p class="showcase-side-title mb-2">Workspace</p>
                <article v-for="feature in features" :key="feature.title" class="landing-feature mb-2">
                  <div class="landing-feature-icon">
                    <i :class="feature.icon"></i>
                  </div>
                  <div>
                    <h3 class="h6 fw-semibold mb-1">{{ feature.title }}</h3>
                    <p class="small mb-0 text-secondary">{{ feature.desc }}</p>
                  </div>
                </article>

                <div class="landing-module-row">
                  <span class="landing-module-pill">A/B Runner</span>
                  <span class="landing-module-pill">Scoreboard</span>
                  <span class="landing-module-pill">Insights</span>
                </div>
                </aside>
              </div>

              <section class="showcase-main">
                <div class="showcase-main-top">
                  <div class="showcase-dot"></div>
                  <div class="showcase-dot"></div>
                  <div class="showcase-dot"></div>
                  <p class="mb-0 ms-2 showcase-main-label">Experiment Result Preview</p>
                </div>

                <figure class="landing-preview-image-wrap mb-0">
                  <img
                    src="/experiment-result-preview.svg"
                    alt="Preview of an experiment result dashboard showing Prompt B as winner"
                    class="landing-preview-image"
                  />
                </figure>
                <p class="landing-preview-caption mt-2 mb-0">
                  Example result preview: compare prompts, inspect metrics, and identify the winner quickly.
                </p>
              </section>
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

const heroKpis = [
  { label: 'Experiments', value: '1,240+' },
  { label: 'Average Lift', value: '17.8%' },
  { label: 'Active Teams', value: '42' },
];

function goLogin(): void {
  router.push('/login');
}
</script>
