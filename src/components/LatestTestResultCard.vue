<template>
  <div class="ui-card latest-result-card">
    <div class="latest-result-header">
      <div>
        <div class="card-title">Latest Test Result</div>
        <div class="card-subtitle">/100 · Overall Quality</div>
      </div>
      <span class="latest-result-status" :class="statusToneClass">{{ statusLabel }}</span>
    </div>

    <div class="card-body latest-result-body">
      <div v-if="loading" class="latest-result-loading">Loading latest result...</div>
      <div v-else-if="!latestResult" class="latest-result-empty">No results available yet.</div>
      <div v-else class="latest-result-content">
        <div class="latest-result-summary">
          <div class="latest-result-ring" :style="ringStyle">
            <div class="latest-result-ring-inner">
              <span class="latest-result-score">{{ latestResult.overallQuality }}</span>
            </div>
          </div>

          <div class="latest-result-meta">
            <div class="latest-result-meta-eyebrow">Overall Quality</div>
            <div class="latest-result-prompt">{{ promptTitle }}</div>
            <div class="latest-result-id">promptId {{ latestResult.promptId }}</div>
            <div class="latest-result-date">{{ formattedDate }}</div>
          </div>
        </div>

        <div class="latest-result-metrics">
          <div
            v-for="metric in metrics"
            :key="metric.label"
            class="latest-result-metric-row"
          >
            <div class="latest-result-metric-label">{{ metric.label }}</div>
            <div class="latest-result-metric-track" :aria-label="metric.label">
              <div class="latest-result-metric-fill" :style="{ width: `${metric.value}%`, background: metric.color }"></div>
            </div>
            <div class="latest-result-metric-value">{{ metric.value }}</div>
          </div>
        </div>

        <div class="latest-result-response">
          <div class="latest-result-response-label">
            <i class="bi bi-clock"></i>
            <span>Response Time</span>
          </div>
          <div class="latest-result-response-value">{{ formattedResponseTime }}</div>
        </div>

        <div class="latest-result-experiment">
          <div class="latest-result-experiment-label">Experiment</div>
          <div class="latest-result-experiment-id">{{ latestResult.experimentId }}</div>
          <div class="latest-result-experiment-meta">{{ formattedExperimentDate }} · {{ experimentRuns }} runs</div>
        </div>

        <RouterLink class="latest-result-link" to="/experiments">
          <span>View All Results</span>
          <i class="bi bi-arrow-right"></i>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { appStore } from '../stores/appStore'
import { fetchResultsByUserRequest, type ExperimentResultRow } from '../lib/resultsApi'
import { fetchPromptById } from '../lib/promptsApi'

type MetricItem = {
  label: string
  value: number
  color: string
}

export default defineComponent({
  name: 'LatestTestResultCard',
  data() {
    return {
      latestResult: null as ExperimentResultRow | null,
      promptTitle: 'Prompt',
      experimentRuns: 0,
      loading: true,
    }
  },
  computed: {
    score(): number {
      return this.latestResult?.overallQuality ?? 0
    },
    statusLabel(): string {
      if (!this.latestResult) {
        return 'No Data'
      }

      if (this.score >= 80) {
        return 'Strong'
      }

      if (this.score >= 60) {
        return 'On Track'
      }

      return 'Needs Work'
    },
    statusToneClass(): string {
      if (this.score >= 80) {
        return 'tone-strong'
      }

      if (this.score >= 60) {
        return 'tone-good'
      }

      return 'tone-weak'
    },
    ringStyle(): Record<string, string> {
      const accent = this.score >= 80 ? '#2f6fed' : this.score >= 60 ? '#f6b61f' : '#f97316'
      return {
        '--latest-score': `${Math.max(0, Math.min(this.score, 100))}%`,
        '--latest-accent': accent,
      }
    },
    metrics(): MetricItem[] {
      if (!this.latestResult) {
        return []
      }

      return [
        { label: 'Clarity', value: this.latestResult.clarity, color: '#3b82f6' },
        { label: 'Relevance', value: this.latestResult.relevance, color: '#f59e0b' },
        { label: 'Coherence', value: this.latestResult.coherence, color: '#8b5cf6' },
        { label: 'Completeness', value: this.latestResult.completeness, color: '#14b8a6' },
      ]
    },
    formattedResponseTime(): string {
      return this.latestResult ? `${this.latestResult.responseTimeMs.toLocaleString('en-US')}ms` : '--'
    },
    formattedDate(): string {
      if (!this.latestResult) {
        return '--'
      }

      return new Date(this.latestResult.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    },
    formattedExperimentDate(): string {
      if (!this.latestResult) {
        return '--'
      }

      return new Date(this.latestResult.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    },
  },
  async mounted() {
    const userId = appStore.state.user?.id

    if (!userId) {
      this.loading = false
      return
    }

    try {
      const results = await fetchResultsByUserRequest()
      const sortedResults = [...results].sort((left, right) => {
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      })

      this.latestResult = sortedResults[0] ?? null

      if (!this.latestResult) {
        this.loading = false
        return
      }

      this.experimentRuns = results.filter((item) => item.experimentId === this.latestResult?.experimentId).length

      try {
        const prompt = await fetchPromptById(this.latestResult.promptId)
        this.promptTitle = prompt.title || `Prompt ${this.latestResult.promptId}`
      } catch {
        this.promptTitle = `Prompt ${this.latestResult.promptId}`
      }
    } catch (error) {
      console.error('Failed to load latest test result:', error)
      this.latestResult = null
    } finally {
      this.loading = false
    }
  },
})
</script>

<style scoped>
.latest-result-card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
  padding: 1.1rem 1rem 1rem 1rem;
  border-radius: 1rem;
  gap: 0;
  background: #fff;
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: 0 6px 18px rgba(24, 33, 58, 0.08);
}

.latest-result-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.55rem;
  margin-bottom: 0.55rem;
  margin-top: 0;
  flex-wrap: wrap;
  min-width: 0;
}

.latest-result-header > div:first-child {
  min-width: 0;
  flex: 1;
}

.latest-result-card .card-title {
  font-family: 'Sora', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  color: #687083;
  margin-bottom: 0.15rem;
  letter-spacing: 0.01em;
  margin-top: 0;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.latest-result-card .card-subtitle {
  font-family: 'Manrope', sans-serif;
  font-size: 0.68rem;
  color: #687083;
  margin-bottom: 0;
}

.latest-result-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  min-height: 1.4rem;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 800;
  line-height: 1.1;
  border: 1px solid transparent;
  flex-shrink: 0;
}

.latest-result-status.tone-weak {
  color: #ea580c;
  background: rgba(255, 236, 204, 0.78);
  border-color: rgba(251, 146, 60, 0.2);
}

.latest-result-status.tone-good {
  color: #1d4ed8;
  background: rgba(219, 234, 254, 0.86);
  border-color: rgba(59, 130, 246, 0.18);
}

.latest-result-status.tone-strong {
  color: #166534;
  background: rgba(220, 252, 231, 0.86);
  border-color: rgba(34, 197, 94, 0.18);
}

.latest-result-loading,
.latest-result-empty {
  min-height: 12rem;
  display: grid;
  place-items: center;
  color: #8b97aa;
  font-weight: 600;
}

.latest-result-content {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.latest-result-summary {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.75rem;
  align-items: center;
}

.latest-result-ring {
  --latest-score: 0%;
  --latest-accent: #f97316;
  width: 4.4rem;
  height: 4.4rem;
  border-radius: 50%;
  background: conic-gradient(var(--latest-accent) var(--latest-score), rgba(234, 240, 247, 0.95) 0);
  padding: 0.3rem;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.75);
}

.latest-result-ring-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #ffffff;
}

.latest-result-score {
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1;
  color: #1f2937;
}

.latest-result-meta {
  min-width: 0;
}

.latest-result-meta-eyebrow {
  color: #91a0b8;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.latest-result-prompt {
  color: #24324a;
  font-size: 0.88rem;
  font-weight: 800;
  margin-top: 0.25rem;
}

.latest-result-id,
.latest-result-date {
  color: #8c99af;
  font-size: 0.68rem;
  font-weight: 600;
}

.latest-result-metrics {
  display: grid;
  gap: 0.45rem;
}

.latest-result-metric-row {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.65fr) auto;
  gap: 0.55rem;
  align-items: center;
}

.latest-result-metric-label {
  color: #8b97aa;
  font-size: 0.68rem;
  font-weight: 700;
}

.latest-result-metric-track {
  position: relative;
  height: 0.5rem;
  border-radius: 999px;
  background: rgba(232, 237, 244, 0.95);
  overflow: hidden;
}

.latest-result-metric-fill {
  height: 100%;
  border-radius: inherit;
}

.latest-result-metric-value {
  min-width: 2.2rem;
  text-align: right;
  color: #435066;
  font-size: 0.75rem;
  font-weight: 800;
}

.latest-result-response {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.55rem 0.75rem;
  border-radius: 12px;
  background: rgba(247, 249, 252, 0.98);
}

.latest-result-response-label {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: #8b97aa;
  font-size: 0.72rem;
  font-weight: 700;
}

.latest-result-response-label i {
  font-size: 0.92rem;
}

.latest-result-response-value {
  color: #ff6f7a;
  font-size: 0.9rem;
  font-weight: 900;
  letter-spacing: -0.01em;
}

.latest-result-experiment {
  padding: 0.35rem 0.1rem 0.05rem;
}

.latest-result-experiment-label {
  color: #9aa7bf;
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.latest-result-experiment-id {
  margin-top: 0.25rem;
  color: #5b6981;
  font-size: 0.72rem;
  font-weight: 800;
}

.latest-result-experiment-meta {
  margin-top: 0.2rem;
  color: #91a0b8;
  font-size: 0.68rem;
  font-weight: 600;
}

.latest-result-link {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.4rem 0;
  border-top: 1px solid rgba(226, 231, 239, 0.9);
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.75rem;
  font-weight: 800;
  width: 100%;
  min-width: 0;
}

.latest-result-link span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.latest-result-link i {
  flex-shrink: 0;
}

.latest-result-link:hover {
  color: #1d4ed8;
}

@media screen and (max-width: 768px) {
  .latest-result-card {
    padding: 1rem;
  }

  .latest-result-summary {
    grid-template-columns: 1fr;
    justify-items: start;
  }

  .latest-result-metric-row {
    grid-template-columns: 1fr;
    gap: 0.35rem;
  }

  .latest-result-metric-value {
    text-align: left;
  }

  .latest-result-response {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>