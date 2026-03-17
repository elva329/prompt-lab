<template>
  <div class="prompts-evaluated-card">
    <div class="card-header">
      <div class="icon-bg">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" stroke="#13b8d2" stroke-width="2" fill="#e6fcf7"/>
          <text x="16" y="21" text-anchor="middle" font-size="20" font-family="monospace" fill="#13b8d2">#</text>
        </svg>
      </div>
      <div class="trend-badge">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 10l4-4 3 3 5-5" stroke="#13b8d2" stroke-width="2" stroke-linecap="round"/></svg>
        <span>{{ trend }}</span>
      </div>
    </div>
    <div class="card-title">PROMPTS EVALUATED</div>
    <div class="card-value-row">
      <span class="card-value">{{ promptsEvaluated }}</span>
      <span class="card-value-max">runs</span>
    </div>
    <div class="card-subtitle">since last session</div>
    <div class="progress-bar">
      <div class="progress-bar-fill"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { fetchResultsSummaryRequest } from '../lib/resultsApi'
import { fetchResultsByExperimentRequest } from '../lib/resultsApi'
import { appStore } from '../stores/appStore'

export default defineComponent({
  name: 'PromptsEvaluatedCard',
  setup() {
    const promptsEvaluated = ref<number>(0)
    const trend = ref<string>("N/A")
    const userId = appStore.state.user?.id || ''

    const fetchPromptsEvaluated = async () => {
      if (!userId) return
      try {
        const summary = await fetchResultsSummaryRequest(userId)
        promptsEvaluated.value = summary.promptsEvaluated ?? 0

        // Fetch previous experiment's promptsEvaluated for trend calculation
        const experimentsRes = await fetch('/api/experiments?userId=' + encodeURIComponent(userId))
        const experimentsPayload = await experimentsRes.json()
        const experiments = experimentsPayload.experiments || []
        if (experiments.length > 1) {
          // Get previous experiment id
          const prevExperimentId = experiments[1]._id
          const prevResults = await fetchResultsByExperimentRequest(userId, prevExperimentId)
          const prevPromptIds = prevResults.map(r => r.promptId)
          const prevCount = new Set(prevPromptIds).size
          if (typeof summary.promptsEvaluated === 'number' && typeof prevCount === 'number') {
            const diff = summary.promptsEvaluated - prevCount
            const percent = prevCount !== 0 ? (diff / prevCount) * 100 : 0
            trend.value = (percent >= 0 ? '+' : '') + percent.toFixed(1) + '%'
          }
        } else {
          trend.value = 'N/A'
        }
      } catch (e) {
        promptsEvaluated.value = 0
        trend.value = 'N/A'
      }
    }

    onMounted(fetchPromptsEvaluated)

    return { promptsEvaluated, trend }
  }
})
</script>

<style scoped>
.prompts-evaluated-card {
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 6px 18px rgba(24,33,58,0.08);
  padding: 1.2rem 1.1rem 1rem 1.1rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  min-height: 0;
  min-width: 0;
  flex: 1 1 100%;
  box-sizing: border-box;
  justify-content: center;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.7rem;
  margin-top: 0.2rem;
}
.icon-bg {
  background: #fff;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.trend-badge {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: #e6fcf7;
  color: #13b8d2;
  font-size: 0.68rem; /* Trend label/percentage */
  font-weight: 700;
  border-radius: 999px;
  padding: 0.18rem 0.7rem;
  margin-top: 0.1rem;
}
.card-title {
  font-family: 'Sora', sans-serif;
  font-size: 0.8rem; /* Card label */
  font-weight: 700;
  color: #687083;
  margin-bottom: 0.2rem;
  letter-spacing: 0.01em;
  margin-top: 0.2rem;
}
.card-value-row {
  display: flex;
 align-items: baseline;
 margin-bottom: 0.2rem;
}
.card-value {
  font-family: 'Manrope', sans-serif;
  font-size: 1.7rem; /* Metric primary value */
  font-weight: 800;
  color: #151922;
}
.card-value-max {
  font-family: 'Manrope', sans-serif;
  font-size: 0.68rem; /* Value label */
  font-weight: 700;
  color: #687083;
  margin-left: 0.3rem;
}
.card-subtitle {
  font-family: 'Manrope', sans-serif;
  font-size: 0.68rem; /* Card subtitle */
  color: #687083;
  margin-bottom: 0.7rem;
}
.progress-bar {
  width: 100%;
  height: 7px;
  background: #e7edff;
  border-radius: 6px;
  overflow: hidden;
  margin-top: auto;
}
.progress-bar-fill {
  width: 80%;
  height: 100%;
  background: #13b8d2;
  border-radius: 6px;
  transition: width 0.3s;
}
</style>
