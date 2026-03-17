<template>
  <div class="avg-overall-quality-card">
    <div class="card-header">
      <div class="icon-bg">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M12 4h8v2.5c0 .6-.2 1.2-.5 1.7l-3.5 6.3v2.5" stroke="#2C6FE7" stroke-width="2" stroke-linecap="round"/>
          <path d="M16 17v-2.5l-3.5-6.3c-.3-.5-.5-1.1-.5-1.7V4h8" stroke="#2C6FE7" stroke-width="2" stroke-linecap="round"/>
          <ellipse cx="16" cy="24" rx="7" ry="4" stroke="#2C6FE7" stroke-width="2"/>
        </svg>
      </div>
      <div class="trend-badge">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 10l4-4 3 3 5-5" stroke="#13b8d2" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>{{ trend }}</span>
      </div>
    </div>
    <div class="card-title">AVG. OVERALL QUALITY</div>
    <div class="card-value-row">
      <span class="card-value">{{ avgQualityScore !== null ? avgQualityScore : 'N/A' }}</span>
      <span class="card-value-max">/ 100</span>
    </div>
    <div class="card-subtitle">vs. last experiment batch</div>
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
  name: 'AvgOverallQualityCard',
  setup() {
    const avgQualityScore = ref<number | null>(null)
    const trend = ref<string>("N/A")
    const userId = appStore.state.user?.id || ''

    const fetchAvgQuality = async () => {
      if (!userId) return
      try {
        const summary = await fetchResultsSummaryRequest(userId)
        avgQualityScore.value = summary.avgQualityScore

        // Fetch previous experiment's avgQualityScore for trend calculation
        const experimentsRes = await fetch('/api/experiments?userId=' + encodeURIComponent(userId))
        const experimentsPayload = await experimentsRes.json()
        const experiments = experimentsPayload.experiments || []
        if (experiments.length > 1) {
          // Get previous experiment id
          const prevExperimentId = experiments[1]._id
          const prevResults = await fetchResultsByExperimentRequest(userId, prevExperimentId)
          const prevScores = prevResults.map(r => r.overallQuality).filter(v => typeof v === 'number')
          if (prevScores.length > 0) {
            const prevAvg = Math.round(prevScores.reduce((a, b) => a + b, 0) / prevScores.length)
            if (typeof summary.avgQualityScore === 'number' && typeof prevAvg === 'number') {
              const diff = summary.avgQualityScore - prevAvg
              const percent = prevAvg !== 0 ? (diff / prevAvg) * 100 : 0
              trend.value = (percent >= 0 ? '+' : '') + percent.toFixed(1) + '%'
            }
          }
        } else {
          trend.value = 'N/A'
        }
      } catch (e) {
        avgQualityScore.value = null
        trend.value = 'N/A'
      }
    }

    onMounted(fetchAvgQuality)

    return { avgQualityScore, trend }
  }
})
</script>

<style scoped>
.avg-overall-quality-card {
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
  width: 67%;
  height: 100%;
  background: #2c6fe7;
  border-radius: 6px;
  transition: width 0.3s;
}
</style>