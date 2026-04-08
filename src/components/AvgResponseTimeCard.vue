<template>
  <div class="avg-response-time-card">
    <div class="card-header">
      <div class="icon-bg">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" stroke="#FFD600" stroke-width="2" fill="#FFF9E3"/>
          <path d="M16 10v6l4 2" stroke="#FFD600" stroke-width="2" stroke-linecap="round"/>
          <circle cx="16" cy="16" r="10" stroke="#FFD600" stroke-width="1" fill="none"/>
        </svg>
      </div>
      <div class="trend-badge">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 10l4-4 3 3 5-5" stroke="#13b8d2" stroke-width="2" stroke-linecap="round"/></svg>
        <span>{{ trend }}</span>
      </div>
    </div>
    <div class="card-title">AVG. RESPONSE TIME</div>
    <div class="card-value-row">
      <span class="card-value">{{ avgResponseTimeMs !== null ? avgResponseTimeMs.toLocaleString() : 'N/A' }}</span>
      <span class="card-value-max">ms</span>
    </div>
    <div class="card-subtitle">faster than baseline</div>
    <div class="progress-bar">
      <div class="progress-bar-fill"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { fetchResultsSummaryRequest } from '../lib/resultsApi'
import { appStore } from '../stores/appStore'
import { fetchResultsByExperimentRequest } from '../lib/resultsApi'
import { getAuthHeaders } from '../lib/authApi'

export default defineComponent({
  name: 'AvgResponseTimeCard',
  setup() {
    const avgResponseTimeMs = ref<number | null>(null)
    const trend = ref<string>("N/A")
    const userId = appStore.state.user?.id || ''

    const fetchAvgResponseTime = async () => {
      if (!userId) return
      try {
        const summary = await fetchResultsSummaryRequest()
        if (typeof summary.avgResponseTimeMs === 'number' && Number.isFinite(summary.avgResponseTimeMs)) {
          avgResponseTimeMs.value = summary.avgResponseTimeMs
        } else {
          avgResponseTimeMs.value = null
        }

        // Fetch previous experiment's avgResponseTimeMs for trend calculation
        const experimentsRes = await fetch('/api/experiments', { headers: getAuthHeaders() })
        const experimentsPayload = await experimentsRes.json()
        const experiments = experimentsPayload.experiments || []
        if (experiments.length > 1) {
          // Get previous experiment id
          const prevExperimentId = experiments[1]._id
          const prevResults = await fetchResultsByExperimentRequest(prevExperimentId)
          const prevTimes = prevResults.map(r => r.responseTimeMs).filter(v => typeof v === 'number')
          if (prevTimes.length > 0) {
            const prevAvg = Math.round(prevTimes.reduce((a, b) => a + b, 0) / prevTimes.length)
            if (typeof summary.avgResponseTimeMs === 'number' && typeof prevAvg === 'number') {
              const diff = summary.avgResponseTimeMs - prevAvg
              const percent = prevAvg !== 0 ? (diff / prevAvg) * 100 : 0
              trend.value = (percent >= 0 ? '+' : '') + percent.toFixed(1) + '%'
            }
          }
        } else {
          trend.value = 'N/A'
        }
      } catch (e) {
        avgResponseTimeMs.value = null
        trend.value = 'N/A'
      }
    }

    onMounted(fetchAvgResponseTime)

    return { avgResponseTimeMs, trend }
  }
})
</script>

<style scoped>
.avg-response-time-card {
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
  background: #f3f5fa;
  border-radius: 6px;
  overflow: hidden;
  margin-top: auto;
}
.progress-bar-fill {
  width: 60%;
  height: 100%;
  background: #FFD600;
  border-radius: 6px;
  transition: width 0.3s;
}
</style>
