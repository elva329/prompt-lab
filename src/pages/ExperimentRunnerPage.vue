<template>
  <div class="experiment-runner fade-in-up page-surface page-fullheight">
    <div class="dashboard-menu-row">
      <!-- Navigation Pills -->
      <nav class="dashboard-menu-pills">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.path"
          class="dashboard-menu-link"
          :class="{ active: isNavItemActive(item.path) }"
          :title="item.name"
        >
          <i :class="['bi', item.icon, 'me-md-2']"></i>
          <span class="d-none d-md-inline">{{ item.name }}</span>
        </RouterLink>
      </nav>
      <div class="dashboard-user-controls">
        <button class="dashboard-menu-icon" title="User Profile" @click="handleLogout">
          <i class="bi bi-person-circle"></i>
        </button>
      </div>
    </div>

    <div class="page-content-scrollable">
      <section class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 page-header-row mb-4">
        <div>
          <button class="btn btn-link text-decoration-none px-0 small mb-2 d-inline-flex align-items-center gap-1 back-link" @click="goBack">
            <i class="bi bi-arrow-left"></i>
            Back to Experiments
          </button>
          <h1 class="h5 fw-bold mb-1">{{ isNew ? 'New Experiment Setup' : experimentTitle }}</h1>
          <p class="text-secondary mb-0 small">{{ experiment?.taskDescription }}</p>
        </div>
        <div class="d-flex gap-2 mt-2 mt-sm-0">
          <button v-if="isNew" class="btn btn-primary px-4 py-2 rounded-pill shadow-sm d-flex align-items-center gap-2" :disabled="isRunning || hasRun" @click="handleRun">
            <i class="bi" :class="isRunning ? 'bi-arrow-repeat spin' : 'bi-play-fill'"></i>
            <span>{{ runButtonText }}</span>
          </button>
          <button v-else class="btn btn-primary px-4 py-2 rounded-pill shadow-sm d-flex align-items-center gap-2" @click="rerunLoadedExperiment">
            <i class="bi bi-play-fill"></i>
            <span>Re-run This Experiment</span>
          </button>
        </div>
      </section>

      <div class="experiment-main-container">
        <div class="card border-0 shadow-sm overflow-hidden experiment-card-modern">
          <div class="card-body p-0 position-relative">
            <div v-if="!hasRun && !isRunning" class="runner-overlay text-center p-5">
              <div class="overlay-icon mx-auto mb-4"><i class="bi bi-flask"></i></div>
              <h2 class="h4 fw-bold mb-3">Ready to Test {{ selectedPrompts.length }} Prompts</h2>
              <p class="text-secondary mb-0 mx-auto" style="max-width: 500px;">
                Click 'Run Experiment' to send these prompts to the AI model and compare the generated responses
                side-by-side with automated quality evaluation.
              </p>
            </div>

            <div class="row g-0 runner-columns">
              <div v-for="(prompt, index) in selectedPrompts" :key="prompt.id" class="col-md border-end prompt-column">
                <div class="h-100 d-flex flex-column">
                  <div class="p-4 border-bottom bg-light prompt-header-area">
                    <div class="d-flex align-items-center gap-2 mb-3">
                      <span class="badge rounded-circle bg-dark d-flex align-items-center justify-content-center" style="width: 24px; height: 24px;">{{ alphabet[index] }}</span>
                      <h3 class="h6 mb-0 fw-bold text-truncate">{{ prompt.title }}</h3>
                    </div>
                    <div class="prompt-source-wrapper">
                      <pre class="small mb-0 prompt-pre">{{ prompt.content }}</pre>
                    </div>
                  </div>

                  <div class="p-4 position-relative grow response-area">
                    <div v-if="isRunning && !resultByPrompt[prompt.id]" class="runner-loading text-center">
                      <div class="loading-content-wrapper">
                        <template v-if="index === currentProgress.current - 1">
                          <div class="status-icon-box mb-4">
                            <div class="spinner-border" role="status" style="width: 3rem; height: 3rem; border-width: 0.25rem; color: #1b5e55;"></div>
                          </div>
                          <p class="h5 fw-bold mb-2" style="color: #1b5e55;">Generating</p>
                          <p class="text-muted small fw-semibold">Prompt {{ index + 1 }} of {{ currentProgress.total }}</p>
                        </template>
                        <template v-else-if="index >= currentProgress.current">
                          <div class="status-icon-box mb-4">
                            <div class="queued-badge">
                              <i class="bi bi-hourglass-split"></i>
                            </div>
                          </div>
                          <p class="h5 fw-bold text-secondary mb-2">In Queue</p>
                          <p class="text-muted small fw-semibold">Waiting to start...</p>
                        </template>
                      </div>
                    </div>

                    <template v-if="resultByPrompt[prompt.id]">
                      <div class="response-header d-flex justify-content-between align-items-center mb-3">
                        <span class="badge prompt-badge-muted">AI RESPONSE</span>
                        <span class="text-muted smallest">ID: #{{ prompt.id }}</span>
                      </div>
                      
                      <div class="response-text-scroll mb-4">
                        <p class="response-copy mb-0">{{ resultByPrompt[prompt.id].aiResponse }}</p>
                      </div>

                      <div class="evaluation-section pt-0">
                        <h4 class="h7 mb-3 mt-3 d-flex align-items-center gap-2" style="font-size: 0.75rem;">
                          <i class="bi bi-shield-check text-success" style="font-size: 0.9rem;"></i>
                          <span class="text-uppercase tracking-wider fw-bold text-muted">Evaluation Metrics</span>
                        </h4>

                        <div class="metrics-grid">
                          <div class="metric-item-modern highlight">
                            <span class="metric-label">OVERALL QUALITY</span>
                            <div class="metric-value-wrapper">
                              <span class="metric-value">{{ resultByPrompt[prompt.id].aiScore }}</span>
                              <span class="metric-unit">/100</span>
                            </div>
                            <div class="metric-progress">
                              <div class="progress-bar" :style="{ width: resultByPrompt[prompt.id].aiScore + '%', backgroundColor: getScoreColor(resultByPrompt[prompt.id].aiScore) }"></div>
                            </div>
                          </div>

                          <div class="metrics-subgrid mt-3">
                            <div class="metric-item-mini">
                              <span class="mini-label">RESPONSE TIME</span>
                              <span class="mini-value"><i class="bi bi-clock me-1 small"></i>{{ resultByPrompt[prompt.id].responseTimeMs }}ms</span>
                            </div>
                            <div class="metric-item-mini">
                              <span class="mini-label">TOKENS</span>
                              <span class="mini-value">{{ resultByPrompt[prompt.id].tokensUsed }}</span>
                            </div>
                          </div>

                      <div class="metrics-detailed-grid mt-3">
                            <div class="metric-badge-card">
                              <span class="badge-label">Clarity</span>
                              <div class="badge-score-container">
                                <span class="badge-score" :style="{ color: getScoreColor(resultByPrompt[prompt.id].clarity || 0) }">{{ resultByPrompt[prompt.id].clarity || 0 }}</span>
                                <span class="badge-max">/100</span>
                              </div>
                            </div>
                            <div class="metric-badge-card">
                              <span class="badge-label">Relevance</span>
                              <div class="badge-score-container">
                                <span class="badge-score" :style="{ color: getScoreColor(resultByPrompt[prompt.id].relevance || 0) }">{{ resultByPrompt[prompt.id].relevance || 0 }}</span>
                                <span class="badge-max">/100</span>
                              </div>
                            </div>
                            <div class="metric-badge-card">
                              <span class="badge-label">Coherence</span>
                              <div class="badge-score-container">
                                <span class="badge-score" :style="{ color: getScoreColor(resultByPrompt[prompt.id].coherence || 0) }">{{ resultByPrompt[prompt.id].coherence || 0 }}</span>
                                <span class="badge-max">/100</span>
                              </div>
                            </div>
                            <div class="metric-badge-card">
                              <span class="badge-label">Completeness</span>
                              <div class="badge-score-container">
                                <span class="badge-score" :style="{ color: getScoreColor(resultByPrompt[prompt.id].completeness || 0) }">{{ resultByPrompt[prompt.id].completeness || 0 }}</span>
                                <span class="badge-max">/100</span>
                              </div>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';

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

const navItems = [
  { name: 'Analytics', path: '/analytics', icon: 'bi-graph-up' },
  { name: 'Prompt Library', path: '/prompts', icon: 'bi-journal-text' },
  { name: 'Favorites', path: '/favorites', icon: 'bi-star-fill' },
  { name: 'Experiments', path: '/experiments', icon: 'bi-flask' }
];

const isNavItemActive = (path: string) => route.path.startsWith(path);

function handleLogout(): void {
  appStore.logout();
  router.push('/');
}

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

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981'; // Success green
  if (score >= 60) return '#3b82f6'; // Info blue
  if (score >= 40) return '#f59e0b'; // Warning amber
  return '#ef4444'; // Danger red
}

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
    const experimentRecord = await fetchExperimentByIdRequest(id.value);

    loadedExperimentPromptIds.value = Array.isArray(experimentRecord.prompts)
      ? experimentRecord.prompts.filter((entry) => Number.isInteger(entry))
      : [];

    await loadSelectedPrompts();

    const results = await fetchResultsByExperimentRequest(id.value);
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

        // Store result immediately to update UI
        runResults.value = {
          ...runResults.value,
          [prompt.promptId]: {
            aiResponse: aiResponse.response,
            aiScore: evaluation.automatedScore,
            responseTimeMs: aiResponse.responseTimeMs,
            clarity: evaluation.clarity,
            relevance: evaluation.relevance,
            coherence: evaluation.coherence,
            completeness: evaluation.completeness,
            tokensUsed: aiResponse.tokensUsed,
          }
        };

        // Add small delay between requests to avoid rate limiting
        if (i < selectedPrompts.value.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error processing prompt ${prompt.promptId}:`, error);
        
        // Store error result immediately to update UI
        runResults.value = {
          ...runResults.value,
          [prompt.promptId]: {
            aiResponse: `Error: ${error instanceof Error ? error.message : 'Failed to generate response'}`,
            aiScore: 0,
            responseTimeMs: 0,
            clarity: 0,
            relevance: 0,
            coherence: 0,
            completeness: 0,
            tokensUsed: 0,
          }
        };
      }
    }

    const generatedResults = runResults.value;
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

    const experimentSave = await createExperimentRequest(selectedPromptIds.value, {
      status: 'completed',
      avgQualityScore,
      avgResponseTimeMs,
      totalTokens,
      promptScores,
    });

    const experimentId = experimentSave.experiment?.id;
    if (experimentId) {
      await saveResultsBatchRequest({
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

onMounted(async () => {
  if (isNew.value) {
    await loadSelectedPrompts();
    return;
  }

  await loadExistingExperimentDetails();
});
</script>

<style scoped>
.experiment-runner {
  display: flex;
  flex-direction: column;
}

.experiment-main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 2rem;
  padding-left: 1rem;
  padding-right: 1rem;
  justify-content: flex-start;
}

.experiment-card-modern {
  border-radius: 1.25rem;
  background: none;
  box-shadow: none !important;
  height: auto;
  max-width: 1220px;
  margin: 0 auto;
}

.experiment-card-modern > .card-body {
  display: flex;
  flex-direction: column;
}

.back-link {
  font-weight: 600;
  color: #1b5e55;
  transition: color 0.2s;
}

.back-link:hover {
  color: #0f3d38;
}

.runner-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(8px);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.overlay-icon {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(27, 94, 85, 0.1) 0%, rgba(27, 94, 85, 0.05) 100%);
  color: #1b5e55;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  box-shadow: 0 10px 15px -3px rgba(27, 94, 85, 0.15);
  border: 2px solid rgba(27, 94, 85, 0.1);
}

.runner-columns {
  display: flex;
  gap: 1rem;
  flex-wrap: nowrap;
  overflow-x: auto;
  justify-content: center;
  max-width: 1220px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 768px) {
  .runner-columns {
    min-height: 0;
    height: auto;
  }
  
  .response-area {
    min-height: 300px;
  }
}

.prompt-column {
  transition: background-color 0.2s;
  background: rgba(255, 255, 255, 0.75);
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* Same width distribution for all scenarios */
.prompt-column:nth-last-child(2):nth-child(1),
.prompt-column:nth-last-child(1):nth-child(2) {
  flex: 1;
}

/* Same width for single prompt */
.prompt-column:only-of-type {
  flex: 1;
}

/* Side-by-side layout ONLY for single prompt - inner flex container */
.prompt-column:only-of-type > .h-100 {
  flex-direction: row !important;
}

.prompt-header-area {
  height: 340px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  background: linear-gradient(135deg, rgba(27, 94, 85, 0.05) 0%, rgba(27, 94, 85, 0.02) 100%);
  border-bottom: 1px solid rgba(27, 94, 85, 0.06);
}

/* Sidebar layout ONLY for single prompt */
.prompt-column:only-of-type .prompt-header-area {
  height: auto;
  width: 55%;
  flex-shrink: 0;
  border-bottom: none;
  border-right: 1px solid rgba(27, 94, 85, 0.06);
  padding: 1.5rem 1rem;
}

.prompt-pre {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.8rem;
  line-height: 1.5;
  color: #475569;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(27, 94, 85, 0.08);
  border-radius: 0.75rem;
  padding: 1rem;
  flex: 1;
  height: 220px;
  max-height: 220px;
  overflow-y: auto;
}

/* Full height prompt code for single prompt side-by-side */
.prompt-column:only-of-type .prompt-pre {
  height: auto;
  max-height: 100%;
  font-size: 0.8rem;
  padding: 1rem;
}

.response-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 2rem !important;
  position: relative;
}

/* Right side content area ONLY for single prompt side-by-side */
.prompt-column:only-of-type .response-area {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.evaluation-section {
  padding-top: 0.85rem;
  padding-bottom: 0.85rem;
  padding-left: 1rem;
  padding-right: 1rem;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 1rem;
  border: 1px solid rgba(27, 94, 85, 0.08);
  margin-top: 1rem;
  width: 100%;
}

/* Compact metrics ONLY for single prompt side-by-side */
.prompt-column:only-of-type .evaluation-section {
  padding: 0.75rem 0.85rem;
  margin-top: 0.85rem;
}

.metrics-grid {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.response-text-scroll {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(27, 94, 85, 0.08);
  border-radius: 1rem;
  padding: 1.25rem;
  line-height: 1.6;
  color: #1e293b;
  height: 380px; 
  max-height: 380px; /* Force fixed height */
  overflow-y: auto;
  flex-shrink: 0;
}

/* Compact response ONLY for single prompt side-by-side */
.prompt-column:only-of-type .response-text-scroll {
  height: 220px;
  max-height: 220px;
  padding: 1rem;
  font-size: 0.95rem;
}

.response-copy {
  white-space: pre-wrap;
  font-size: 0.95rem;
}

.metric-item-modern {
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(27, 94, 85, 0.08);
  border-radius: 0.85rem;
  padding: 0.8rem;
}

.metric-item-modern.highlight {
  border-color: rgba(27, 94, 85, 0.10);
  background: linear-gradient(135deg, rgba(27, 94, 85, 0.03) 0%, rgba(27, 94, 85, 0.01) 100%);
  box-shadow: 0 4px 12px rgba(27, 94, 85, 0.12);
}

.metric-label {
  display: block;
  font-size: 0.65rem;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.05em;
  margin-bottom: 0.35rem;
}

.metric-value-wrapper {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.6rem;
  font-weight: 800;
  color: #1b5e55;
  line-height: 1;
}

.metric-unit {
  font-size: 0.9rem;
  font-weight: 600;
  color: #94a3b8;
}

.metric-progress {
  height: 6px;
  background: rgba(27, 94, 85, 0.1);
  border-radius: 999px;
  overflow: hidden;
}

.metric-progress .progress-bar {
  height: 100%;
  transition: width 1s ease-out;
}

.metrics-subgrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.metric-item-mini {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(27, 94, 85, 0.06);
  border-radius: 0.75rem;
  padding: 0.6rem 0.85rem;
  display: flex;
  flex-direction: column;
}

.mini-label {
  font-size: 0.6rem;
  font-weight: 700;
  color: #94a3b8;
  margin-bottom: 0.2rem;
}

.mini-value {
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
}

.metrics-detailed-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.metric-badge-card {
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(27, 94, 85, 0.10);
  border-radius: 0.75rem;
  padding: 0.7rem 0.65rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.metric-badge-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(27, 94, 85, 0.12);
}

.badge-label {
  font-size: 0.6rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 0.15rem;
}

.badge-score-container {
  display: flex;
  align-items: baseline;
  gap: 0.125rem;
}

.badge-score {
  font-size: 1.1rem;
  font-weight: 800;
  line-height: 1;
}

.badge-max {
  font-size: 0.7rem;
  font-weight: 600;
  color: #cbd5e1;
}

.runner-loading {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 5;
  padding: 2rem;
}

/* Remove card background when loading */
.response-area:has(.runner-loading) {
  background: transparent !important;
}

.prompt-column:has(.runner-loading) {
  background: transparent !important;
}

.status-icon-box {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.queued-badge {
  font-size: 3rem;
  color: #94a3b8;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

.loading-content-wrapper {
  max-width: 100%;
  width: 100%;
}

/* Loading content for single prompt side-by-side */
.prompt-column:only-of-type .loading-content-wrapper {
  max-width: 100%;
}

.spinner-border {
  border-color: currentColor;
  border-right-color: transparent;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.smallest {
  font-size: 0.7rem;
}

.tracking-wider {
  letter-spacing: 0.05em;
}
</style>
