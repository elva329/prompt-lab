<template>
  <div class="experiment-runner d-flex flex-column gap-3 fade-in-up">
    <section class="d-flex justify-content-between align-items-start gap-3 border-bottom pb-3">
      <div>
        <button class="btn btn-link text-decoration-none px-0 small" @click="goBack">
          <i class="bi bi-chevron-left"></i>
          Back
        </button>
        <h1 class="h3 fw-bold mb-1">{{ isNew ? 'New Experiment Setup' : experiment?.name }}</h1>
        <p class="text-secondary mb-0 small">{{ experiment?.taskDescription }}</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary">Configure Settings</button>
        <button class="btn btn-primary" :disabled="isRunning || hasRun" @click="handleRun">
          <i class="bi" :class="runButtonIcon"></i>
          {{ runButtonText }}
        </button>
      </div>
    </section>

    <section class="card border-0 shadow-sm flex-grow-1">
      <div class="card-body p-0 position-relative">
        <div v-if="!hasRun && !isRunning" class="runner-overlay text-center p-4">
          <div class="overlay-icon mx-auto mb-3"><i class="bi bi-flask"></i></div>
          <h2 class="h5 fw-semibold mb-2">Ready to Test {{ selectedPrompts.length }} Prompts</h2>
          <p class="text-secondary mb-0">
            Click 'Run Experiment' to send these prompts to the AI model and compare the generated responses
            side-by-side.
          </p>
        </div>

        <div class="row g-0 runner-columns">
          <div v-for="(prompt, index) in selectedPrompts" :key="prompt.id" class="col-md border-end">
            <div class="h-100 d-flex flex-column">
              <div class="p-3 border-bottom bg-body-tertiary">
                <div class="d-flex align-items-center gap-2 mb-2">
                  <span class="badge text-bg-dark">{{ alphabet[index] }}</span>
                  <h3 class="h6 mb-0 text-truncate">{{ prompt.title }}</h3>
                </div>
                <pre class="small mb-0 prompt-pre">{{ prompt.content }}</pre>
              </div>

              <div class="p-3 position-relative flex-grow-1 response-area">
                <div v-if="isRunning" class="runner-loading text-center">
                  <div class="spinner-border text-primary" role="status"></div>
                  <p class="small text-secondary mt-2 mb-0">Generating response...</p>
                </div>

                <template v-if="hasRun && resultByPrompt[prompt.id]">
                  <p class="response-copy">{{ resultByPrompt[prompt.id].aiResponse }}</p>

                  <div class="pt-3 border-top mt-3 vstack gap-3">
                    <h4 class="h6 mb-0"><i class="bi bi-star-fill text-warning me-1"></i>Evaluation</h4>

                    <div class="row g-2">
                      <div class="col-6">
                        <div class="metric-card">
                          <p class="small text-secondary mb-1">AI Quality Score</p>
                          <p class="h4 fw-bold text-primary mb-0">{{ resultByPrompt[prompt.id].aiScore }}<span class="small text-secondary">/100</span></p>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="metric-card">
                          <p class="small text-secondary mb-1">Response Time</p>
                          <p class="mb-0 fw-semibold">
                            <i class="bi bi-clock me-1"></i>
                            {{ resultByPrompt[prompt.id].responseTimeMs }}ms
                          </p>
                        </div>
                      </div>
                    </div>

                    <div class="metric-card">
                      <p class="small text-secondary mb-2">Your Rating</p>
                      <div class="d-flex gap-1">
                        <i
                          v-for="star in 5"
                          :key="star"
                          class="bi"
                          :class="star <= resultByPrompt[prompt.id].userRating ? 'bi-star-fill text-warning' : 'bi-star text-secondary'"
                        ></i>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { appStore } from '../stores/appStore';

const route = useRoute();
const router = useRouter();

const isRunning = ref(false);
const hasRun = ref(false);

const id = computed(() => String(route.params.id || ''));
const isNew = computed(() => id.value === 'new');

const experiment = computed(() => {
  if (isNew.value) {
    return appStore.state.experiments[0];
  }

  return appStore.state.experiments.find((entry) => entry.id === id.value);
});

const selectedPrompts = computed(() => {
  if (!experiment.value) {
    return [];
  }

  return experiment.value.selectedPromptIds
    .map((promptId) => appStore.state.prompts.find((prompt) => prompt.id === promptId))
    .filter((prompt): prompt is NonNullable<typeof prompt> => Boolean(prompt));
});

const resultByPrompt = computed(() => {
  const map: Record<string, (typeof appStore.state.experiments)[number]['results'][number]> = {};

  if (!experiment.value) {
    return map;
  }

  for (const result of experiment.value.results) {
    map[result.promptId] = result;
  }

  return map;
});

const runButtonText = computed(() => {
  if (isRunning.value) {
    return 'Processing...';
  }

  if (hasRun.value) {
    return 'Completed';
  }

  return 'Run Experiment';
});

const runButtonIcon = computed(() => {
  if (isRunning.value) {
    return 'bi-arrow-repeat spin';
  }

  if (hasRun.value) {
    return 'bi-check-circle';
  }

  return 'bi-play-fill';
});

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function goBack(): void {
  router.back();
}

function handleRun(): void {
  isRunning.value = true;

  window.setTimeout(() => {
    isRunning.value = false;
    hasRun.value = true;
    appStore.showToast('Experiment completed successfully!', 'success');
  }, 2500);
}
</script>
