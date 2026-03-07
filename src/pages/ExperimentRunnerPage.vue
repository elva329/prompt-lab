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
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { createExperimentRequest } from '../lib/experimentsApi';
import { fetchPromptById, type PromptRecord } from '../lib/promptsApi';
import { appStore } from '../stores/appStore';

const route = useRoute();
const router = useRouter();

const isRunning = ref(false);
const hasRun = ref(false);
const selectedPromptRecords = ref<PromptRecord[]>([]);
const runResults = ref<Record<number, {
  aiResponse: string;
  aiScore: number;
  userRating: number;
  responseTimeMs: number;
}>>({});

const id = computed(() => String(route.params.id || ''));
const isNew = computed(() => id.value === 'new');
const selectedPromptIds = computed(() => {
  const value = String(route.query.prompts || '');

  return value
    .split(',')
    .map((entry) => Number(entry.trim()))
    .filter((entry) => Number.isInteger(entry));
});

const selectedPrompts = computed(() => {
  return selectedPromptRecords.value.map((prompt) => ({
    id: String(prompt.promptId),
    promptId: prompt.promptId,
    title: prompt.title,
    content: prompt.promptText,
  }));
});

const experiment = computed(() => ({
  name: isNew.value ? 'New Experiment Setup' : `Experiment ${id.value}`,
  taskDescription: `${selectedPrompts.value.length} selected prompt(s) ready for testing.`,
}));

const resultByPrompt = computed(() => {
  const map: Record<string, {
    aiResponse: string;
    aiScore: number;
    userRating: number;
    responseTimeMs: number;
  }> = {};

  for (const prompt of selectedPrompts.value) {
    const result = runResults.value[prompt.promptId];
    if (result) {
      map[prompt.id] = result;
    }
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

async function loadSelectedPrompts(): Promise<void> {
  if (!selectedPromptIds.value.length) {
    selectedPromptRecords.value = [];
    return;
  }

  try {
    const prompts = await Promise.all(selectedPromptIds.value.map((promptId) => fetchPromptById(promptId)));
    selectedPromptRecords.value = prompts;
  } catch (error) {
    console.error('Failed to load selected prompts:', error);
    appStore.showToast('Failed to load selected prompts.', 'danger');
  }
}

async function handleRun(): Promise<void> {
  if (!selectedPromptIds.value.length) {
    appStore.showToast('Please select prompts from Prompt Library first.', 'warning');
    return;
  }

  if (!appStore.state.user?.id) {
    appStore.showToast('Please log in again to run experiments.', 'warning');
    return;
  }

  isRunning.value = true;

  try {
    await createExperimentRequest(appStore.state.user.id, selectedPromptIds.value);

    const generatedResults: Record<number, {
      aiResponse: string;
      aiScore: number;
      userRating: number;
      responseTimeMs: number;
    }> = {};

    for (const prompt of selectedPrompts.value) {
      generatedResults[prompt.promptId] = {
        aiResponse: `Simulated response for "${prompt.title}".`,
        aiScore: 80 + (prompt.promptId % 20),
        userRating: 3 + (prompt.promptId % 3),
        responseTimeMs: 700 + (prompt.promptId % 6) * 110,
      };
    }

    runResults.value = generatedResults;
    isRunning.value = false;
    hasRun.value = true;
    appStore.showToast('Experiment saved and completed successfully!', 'success');
  } catch (error) {
    isRunning.value = false;
    appStore.showToast(error instanceof Error ? error.message : 'Failed to run experiment.', 'danger');
  }
}

onMounted(() => {
  loadSelectedPrompts();
});
</script>
