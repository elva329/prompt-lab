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
                <div class="landing-preview-summary">
                  <div class="landing-preview-summary-icon">
                    <i class="bi bi-lightning-charge"></i>
                  </div>
                  <div>
                    <h3 class="landing-preview-summary-title mb-1">Three things it helps you do</h3>
                    <p class="landing-preview-summary-copy mb-0">
                      Prototype prompts, compare outputs, and keep the strongest result visible.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <section class="landing-module-section">
            <div class="landing-section-heading landing-section-heading--compact">
              <p class="landing-section-kicker mb-1">Core areas</p>
            </div>

            <div class="landing-module-rail">
              <div v-for="module in moduleCards" :key="module.title" class="landing-module-node">
                <div class="landing-module-top">
                  <div class="landing-module-icon">
                    <i :class="module.icon"></i>
                  </div>
                  <span class="landing-module-tag">{{ module.tag }}</span>
                </div>

                <h3 class="landing-module-title mb-1">{{ module.title }}</h3>
                <p class="landing-module-copy mb-0">{{ module.desc }}</p>
              </div>
            </div>
          </section>

          <section class="landing-workflow-section">
            <div class="landing-section-heading landing-section-heading--compact">
              <p class="landing-section-kicker mb-1">Workflow</p>
              <!-- <h2 class="landing-section-title mb-0">How testing works in Prompt Lab</h2>
              <p class="landing-section-copy mb-0">From selecting prompts to running experiments and reviewing stored results.</p> -->
            </div>

            <!-- <div class="landing-workflow-lane" aria-hidden="true">
              <span class="landing-workflow-lane-start">Start</span>
              <span class="landing-workflow-lane-end">Results saved</span>
            </div> -->

            <div class="landing-workflow-flow">
              <article v-for="step in workflowSteps" :key="step.title" class="landing-workflow-node">
                <div class="landing-workflow-node-marker" :style="{ background: step.color }">
                  <i :class="step.icon"></i>
                </div>
                <div class="landing-workflow-node-copy">
                  <div class="landing-workflow-step">{{ step.step }}</div>
                  <h3 class="landing-workflow-title mb-1">{{ step.title }}</h3>
                  <p class="landing-workflow-copy mb-0">{{ step.desc }}</p>
                </div>
              </article>
            </div>
          </section>

          <section class="landing-signals-section">
            <div class="landing-section-heading landing-section-heading--compact">
              <p class="landing-section-kicker mb-1">Evaluation Matrix</p>
              <!-- <h2 class="landing-section-title mb-0">Prompt test matrix</h2>
              <p class="landing-section-copy mb-0">Four checks that stay visible while you compare responses.</p> -->
            </div>

            <div class="landing-matrix-container">
              <div class="landing-matrix-side landing-matrix-side--left">
                <div class="landing-matrix-label" v-if="evaluationSignals[0]">
                  <h3 class="landing-matrix-label-title">{{ evaluationSignals[0].label }}</h3>
                  <p class="landing-matrix-label-copy">{{ evaluationSignals[0].desc }}</p>
                </div>
                <div class="landing-matrix-label" v-if="evaluationSignals[2]">
                  <h3 class="landing-matrix-label-title">{{ evaluationSignals[2].label }}</h3>
                  <p class="landing-matrix-label-copy">{{ evaluationSignals[2].desc }}</p>
                </div>
              </div>

              <div class="landing-matrix-grid">
                <article
                  v-for="(signal, index) in evaluationSignals"
                  :key="signal.label"
                  class="landing-matrix-cell"
                  :class="`landing-matrix-cell--${signal.label}`"
                  :style="{ background: signal.bgGradient }"
                >
                  <div class="landing-matrix-cell-icon" :style="{ color: signal.iconColor }">
                    <i :class="signal.icon"></i>
                  </div>
                  <span 
                    class="landing-matrix-cell-badge"
                    :class="`landing-matrix-cell-badge--${signal.label}`"
                    :style="{ borderColor: signal.badgeColor, color: signal.badgeColor }"
                  >
                    {{ signal.letter }}
                  </span>
                </article>
              </div>

              <div class="landing-matrix-side landing-matrix-side--right">
                <div class="landing-matrix-label" v-if="evaluationSignals[1]">
                  <h3 class="landing-matrix-label-title">{{ evaluationSignals[1].label }}</h3>
                  <p class="landing-matrix-label-copy">{{ evaluationSignals[1].desc }}</p>
                </div>
                <div class="landing-matrix-label" v-if="evaluationSignals[3]">
                  <h3 class="landing-matrix-label-title">{{ evaluationSignals[3].label }}</h3>
                  <p class="landing-matrix-label-copy">{{ evaluationSignals[1].desc }}</p>
                </div>
              </div>
            </div>
          </section>
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

const moduleCards = [
  {
    icon: 'bi bi-journal-text',
    tag: 'Library',
    title: 'Prompt Library',
    desc: 'Browse, filter, and reuse prompts before sending them into experiments.'
  },
  {
    icon: 'bi bi-flask',
    tag: 'Testing',
    title: 'Experiment Runner',
    desc: 'Run prompt comparisons, capture outputs, and keep the best result visible.'
  },
  {
    icon: 'bi bi-graph-up',
    tag: 'Insights',
    title: 'Analytics Dashboard',
    desc: 'Review quality trends, token usage, rankings, and pass rates in one place.'
  },
  {
    icon: 'bi bi-star-fill',
    tag: 'Saved',
    title: 'Favorites & Review',
    desc: 'Keep strong prompts and promising results for later comparison or presentation.'
  }
];

const workflowSteps = [
  {
    step: 'Step 01',
    icon: 'bi bi-journal-check',
    title: 'Select prompts',
    color: 'linear-gradient(90deg, #10233f, #1b5e55)',
    desc: 'Pick up to 3 prompts in Prompt Library, then click Test Prompt.'
  },
  {
    step: 'Step 02',
    icon: 'bi bi-sliders2',
    title: 'Open experiment setup',
    color: 'linear-gradient(90deg, #1b5e55, #2a9d8f)',
    desc: 'The runner loads selected prompts and prepares one side-by-side run.'
  },
  {
    step: 'Step 03',
    icon: 'bi bi-play-circle',
    title: 'Run and evaluate',
    color: 'linear-gradient(90deg, #5f6d6b, #8ea39e)',
    desc: 'Generate AI responses and score clarity, relevance, coherence, and completeness.'
  },
  {
    step: 'Step 04',
    icon: 'bi bi-save2',
    title: 'Store and review',
    color: 'linear-gradient(90deg, #b8a16b, #d6c08b)',
    desc: 'Save experiment results, reopen them later, and compare trends in Analytics.'
  }
];

const evaluationSignals = [
  {
    id:1,
    icon: 'bi bi-chat-square-dots',
    letter: 'C',
    label: 'Clarity',
    bgGradient: 'linear-gradient(135deg, #0f5dbf, #1b6fd5)',
    iconColor: '#ffffff',
    badgeColor: '#1b6fd5',
    desc: 'Easy to understand and well-structured.'
  },
  {
    id:2,
    icon: 'bi bi-bullseye',
    letter: 'R',
    label: 'Relevance',
    bgGradient: 'linear-gradient(135deg, #c9b556, #dcc568)',
    iconColor: '#ffffff',
    badgeColor: '#c9b556',
    desc: 'Stays on-task and follows closely.'
  },
  {
    id:3,
    icon: 'bi bi-diagram-3-fill',
    letter: 'C',
    label: 'Coherence',
    bgGradient: 'linear-gradient(135deg, #6a8080, #7f9595)',
    iconColor: '#ffffff',
    badgeColor: '#7f9595',
    desc: 'Flows logically from start to finish.'
  },
  {
    id:4,
    icon: 'bi bi-journal-check',
    letter: 'C',
    label: 'Completeness',
    bgGradient: 'linear-gradient(135deg, #1a5d54, #22714c)',
    iconColor: '#ffffff',
    badgeColor: '#22714c',
    desc: 'Covers important parts without missing details.'
  }
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
