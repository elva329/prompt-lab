<template>
  <div class="experiment-runner d-flex flex-column gap-3 fade-in-up page-surface">
    <section class="d-flex justify-content-between align-items-start gap-3 border-bottom pb-3">
      <div>
        <button class="btn btn-link text-decoration-none px-0 small" @click="goBack">
          <i class="bi bi-chevron-left"></i>
          Back
        </button>
        <h1 class="h3 fw-bold mb-1">{{ isNew ? 'New Experiment Setup' : experimentTitle }}</h1>
        <p class="text-secondary mb-0 small">{{ experiment?.taskDescription }}</p>
      </div>
      <div class="d-flex gap-2">
        <button v-if="isNew" class="btn btn-primary" :disabled="isRunning || hasRun" @click="handleRun">
          <i class="bi" :class="runButtonIcon"></i>
          {{ runButtonText }}
        </button>
        <button v-else class="btn btn-primary" @click="rerunLoadedExperiment">
          <i class="bi bi-play-fill"></i>
          Re-run This Experiment
        </button>
      </div>
    </section>

    <section class="card border-0 shadow-sm grow">
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

              <div class="p-3 position-relative grow response-area">
                <div v-if="isRunning && !resultByPrompt[prompt.id]" class="runner-loading text-center">
                  <template v-if="index === currentProgress.current - 1">
                    <div class="spinner-border text-primary" role="status"></div>
                    <p class="small text-secondary mt-2 mb-0">
                      Generating response... ({{ index + 1 }}/{{ currentProgress.total }})
                    </p>
                  </template>
                  <template v-else>
                    <div class="queued-icon mb-2"><i class="bi bi-hourglass-split"></i></div>
                    <p class="small text-secondary mb-0">
                      Waiting... ({{ index + 1 }}/{{ currentProgress.total }})
                    </p>
                  </template>
                </div>

                <template v-if="hasRun && resultByPrompt[prompt.id]">
                  <div class="response-text-scroll">
                    <p class="response-copy mb-0">{{ resultByPrompt[prompt.id].aiResponse }}</p>
                  </div>

                  <div class="pt-3 border-top mt-3 vstack gap-3">
                    <h4 class="h6 mb-0"><i class="bi bi-star-fill text-warning me-1"></i>Evaluation Metrics</h4>

                    <div class="row g-2">
                      <div class="col-6">
                        <div class="metric-card">
                          <p class="small text-secondary mb-1">Overall Quality</p>
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
                      <div class="col-6">
                        <div class="metric-card">
                          <p class="small text-secondary mb-1">Clarity</p>
                          <p class="mb-0 fw-semibold">{{ resultByPrompt[prompt.id].clarity || 0 }}/100</p>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="metric-card">
                          <p class="small text-secondary mb-1">Relevance</p>
                          <p class="mb-0 fw-semibold">{{ resultByPrompt[prompt.id].relevance || 0 }}/100</p>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="metric-card">
                          <p class="small text-secondary mb-1">Coherence</p>
                          <p class="mb-0 fw-semibold">{{ resultByPrompt[prompt.id].coherence || 0 }}/100</p>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="metric-card">
                          <p class="small text-secondary mb-1">Completeness</p>
                          <p class="mb-0 fw-semibold">{{ resultByPrompt[prompt.id].completeness || 0 }}/100</p>
                        </div>
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

import { getDefaultConfig, sendPromptToAI, type AIResponse } from '../lib/aiApi';
import { evaluateResponse, type EvaluationCriteria } from '../lib/evaluationMetrics';
import { fetchUserByEmailRequest } from '../lib/authApi';
import { createExperimentRequest, fetchExperimentByIdRequest } from '../lib/experimentsApi';
import { fetchPromptById, type PromptRecord } from '../lib/promptsApi';
import { fetchResultsByExperimentRequest, saveResultsBatchRequest } from '../lib/resultsApi';
import { appStore } from '../stores/appStore';

const route = useRoute();
const router = useRouter();

const isRunning = ref(false);
const hasRun = ref(false);
const selectedPromptRecords = ref<PromptRecord[]>([]);
const loadedExperimentPromptIds = ref<number[]>([]);
const runResults = ref<Record<number, {
  aiResponse: string;
  aiScore: number;
  responseTimeMs: number;
  clarity: number;
  relevance: number;
  coherence: number;
  completeness: number;
  tokensUsed: number;
}>>({});
const currentProgress = ref({ current: 0, total: 0 });

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
    category: prompt.category,
    content: prompt.promptText,
  }));
});

const experiment = computed(() => ({
  name: isNew.value ? 'New Experiment Setup' : `Experiment ${id.value}`,
  taskDescription: isNew.value
    ? `${selectedPrompts.value.length} selected prompt(s) ready for testing.`
    : `${selectedPrompts.value.length} prompt(s) loaded from saved experiment.`,
}));

const experimentTitle = computed(() => `Experiment ${id.value.slice(-6).toUpperCase()}`);

const resultByPrompt = computed(() => {
  const map: Record<string, {
    aiResponse: string;
    aiScore: number;
    responseTimeMs: number;
    clarity: number;
    relevance: number;
    coherence: number;
    completeness: number;
    tokensUsed: number;
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

function getResolvedPromptIds(): number[] {
  if (isNew.value) {
    return selectedPromptIds.value;
  }

  return loadedExperimentPromptIds.value;
}

async function resolveUserId(): Promise<string> {
  let resolvedUserId = appStore.state.user?.id || '';

  if (!resolvedUserId) {
    const savedEmail = window.localStorage.getItem('promptlab_user_email');
    if (savedEmail) {
      const userData = await fetchUserByEmailRequest(savedEmail);
      if (userData.user?.id) {
        resolvedUserId = userData.user.id;
        if (appStore.state.user) {
          appStore.state.user.id = userData.user.id;
        }
      }
    }
  }

  if (!resolvedUserId) {
    throw new Error('Please log in again to load experiment details.');
  }

  return resolvedUserId;
}

function rerunLoadedExperiment(): void {
  const promptIds = loadedExperimentPromptIds.value;
  if (!promptIds.length) {
    appStore.showToast('No prompts found in this experiment.', 'warning');
    return;
  }

  router.push({
    name: 'experiment-runner',
    params: { id: 'new' },
    query: { prompts: promptIds.join(',') },
  });
}

function goBack(): void {
  router.back();
}

async function loadSelectedPrompts(): Promise<void> {
  const promptIds = getResolvedPromptIds();

  if (!promptIds.length) {
    selectedPromptRecords.value = [];
    return;
  }

  try {
    const prompts = await Promise.all(promptIds.map((promptId) => fetchPromptById(promptId)));
    selectedPromptRecords.value = prompts;
  } catch (error) {
    console.error('Failed to load selected prompts:', error);
    appStore.showToast('Failed to load selected prompts.', 'danger');
  }
}

async function loadExistingExperimentDetails(): Promise<void> {
  if (isNew.value) {
    return;
  }

  try {
    const userId = await resolveUserId();
    const experimentRecord = await fetchExperimentByIdRequest(userId, id.value);

    loadedExperimentPromptIds.value = Array.isArray(experimentRecord.prompts)
      ? experimentRecord.prompts.filter((entry) => Number.isInteger(entry))
      : [];

    await loadSelectedPrompts();

    const results = await fetchResultsByExperimentRequest(userId, id.value);
    const map: Record<number, {
      aiResponse: string;
      aiScore: number;
      responseTimeMs: number;
      clarity: number;
      relevance: number;
      coherence: number;
      completeness: number;
      tokensUsed: number;
    }> = {};

    for (const result of results) {
      map[result.promptId] = {
        aiResponse: result.aiResponse || `Saved result from ${new Date(result.createdAt).toLocaleString()}`,
        aiScore: result.overallQuality,
        responseTimeMs: result.responseTimeMs,
        clarity: result.clarity,
        relevance: result.relevance,
        coherence: result.coherence,
        completeness: result.completeness,
        tokensUsed: result.tokensUsed,
      };
    }

    runResults.value = map;
    hasRun.value = true;
  } catch (error) {
    console.error('Failed to load experiment details:', error);
    appStore.showToast(
      error instanceof Error ? error.message : 'Failed to load experiment details.',
      'danger'
    );
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
  currentProgress.value = { current: 0, total: selectedPrompts.value.length };

  try {
    // Get AI configuration from environment
    let aiConfig;
    try {
      aiConfig = getDefaultConfig();
    } catch (error) {
      appStore.showToast(
        'AI API not configured. Please add your API key to the .env file.',
        'danger'
      );
      isRunning.value = false;
      return;
    }

    const generatedResults: Record<number, {
      aiResponse: string;
      aiScore: number;
      responseTimeMs: number;
      clarity: number;
      relevance: number;
      coherence: number;
      completeness: number;
      tokensUsed: number;
    }> = {};

    // Process each prompt sequentially
    for (let i = 0; i < selectedPrompts.value.length; i++) {
      const prompt = selectedPrompts.value[i];
      currentProgress.value.current = i + 1;

      try {
        // Send prompt to AI and get response
        const aiResponse: AIResponse = await sendPromptToAI(prompt.content, aiConfig);

        // Evaluate the response quality
        const evaluation: EvaluationCriteria = evaluateResponse(
          prompt.content,
          aiResponse.response,
          aiResponse.responseTimeMs,
          aiResponse.tokensUsed
        );

        // Store results
        generatedResults[prompt.promptId] = {
          aiResponse: aiResponse.response,
          aiScore: evaluation.automatedScore,
          responseTimeMs: aiResponse.responseTimeMs,
          clarity: evaluation.clarity,
          relevance: evaluation.relevance,
          coherence: evaluation.coherence,
          completeness: evaluation.completeness,
          tokensUsed: aiResponse.tokensUsed,
        };

        // Add small delay between requests to avoid rate limiting
        if (i < selectedPrompts.value.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error processing prompt ${prompt.promptId}:`, error);
        
        // Store error result
        generatedResults[prompt.promptId] = {
          aiResponse: `Error: ${error instanceof Error ? error.message : 'Failed to generate response'}`,
          aiScore: 0,
          responseTimeMs: 0,
          clarity: 0,
          relevance: 0,
          coherence: 0,
          completeness: 0,
          tokensUsed: 0,
        };
      }
    }

    const resultsList = Object.values(generatedResults);
    const successfulResults = resultsList.filter((result) => result.aiScore > 0);
    const avgQualityScore = successfulResults.length
      ? successfulResults.reduce((sum, result) => sum + result.aiScore, 0) / successfulResults.length
      : null;
    const avgResponseTimeMs = successfulResults.length
      ? successfulResults.reduce((sum, result) => sum + result.responseTimeMs, 0) / successfulResults.length
      : null;
    const totalTokens = resultsList.reduce((sum, result) => sum + result.tokensUsed, 0);
    const promptScores = selectedPrompts.value
      .map((prompt) => ({
        promptId: prompt.promptId,
        overallQuality: generatedResults[prompt.promptId]?.aiScore ?? 0,
      }))
      .filter((entry) => entry.overallQuality > 0);

    const experimentSave = await createExperimentRequest(appStore.state.user.id, selectedPromptIds.value, {
      status: 'completed',
      avgQualityScore,
      avgResponseTimeMs,
      totalTokens,
      promptScores,
    });

    const experimentId = experimentSave.experiment?.id;
    if (experimentId) {
      await saveResultsBatchRequest({
        userId: appStore.state.user.id,
        experimentId,
        promptResults: selectedPrompts.value.map((prompt) => {
          const result = generatedResults[prompt.promptId];
          return {
            promptId: prompt.promptId,
            category: prompt.category,
            aiResponse: result?.aiResponse ?? '',
            overallQuality: result?.aiScore ?? 0,
            responseTimeMs: result?.responseTimeMs ?? 0,
            clarity: result?.clarity ?? 0,
            relevance: result?.relevance ?? 0,
            coherence: result?.coherence ?? 0,
            completeness: result?.completeness ?? 0,
            tokensUsed: result?.tokensUsed ?? 0,
          };
        }),
      });
    }

    runResults.value = generatedResults;
    isRunning.value = false;
    hasRun.value = true;
    appStore.showToast(
      `Experiment completed! Processed ${selectedPrompts.value.length} prompt(s).`,
      'success'
    );
  } catch (error) {
    isRunning.value = false;
    appStore.showToast(
      error instanceof Error ? error.message : 'Failed to run experiment.',
      'danger'
    );
  }
}

onMounted(() => {
  if (isNew.value) {
    loadSelectedPrompts();
    return;
  }

  loadExistingExperimentDetails();
});
</script>
