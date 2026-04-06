<template>
  <div class="avg-overall-quality-card">
    <div class="quality-glow" aria-hidden="true"></div>

    <header class="quality-header">
      <div class="quality-heading">
        <h3 class="quality-title">AVG. OVERALL QUALITY</h3>
      </div>
      <div class="quality-trend-chip" :class="trendClass">
        <span class="trend-arrow" aria-hidden="true">{{ trendArrow }}</span>
        <span>{{ trendLabel }}</span>
      </div>
    </header>

    <div class="quality-body">
      <div class="quality-score-orb">
        <div class="quality-score-value">{{ displayScore }}</div>
        <div class="quality-score-max">/ 100</div>
      </div>

      <div class="quality-meta">
        <div class="quality-tier-pill">
          <span class="quality-tier-label">Tier</span>
          <span class="quality-tier-value">{{ qualityTier }}</span>
        </div>
        <p class="quality-subtitle">vs. last experiment batch</p>
        <div class="quality-meter" role="img" aria-label="Overall quality score">
          <div class="quality-meter-fill" :style="{ width: scorePercent + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import { fetchResultsSummaryRequest } from '../lib/resultsApi'
import { fetchResultsByExperimentRequest } from '../lib/resultsApi'
import { appStore } from '../stores/appStore'

export default defineComponent({
  name: 'AvgOverallQualityCard',
  setup() {
    const avgQualityScore = ref<number | null>(null)
    const trend = ref<string>("N/A")
    const userId = appStore.state.user?.id || ''

    const scorePercent = computed(() => {
      if (typeof avgQualityScore.value !== 'number') return 0
      return Math.max(0, Math.min(100, avgQualityScore.value))
    })

    const displayScore = computed(() => {
      if (typeof avgQualityScore.value !== 'number') return 'N/A'
      return avgQualityScore.value
    })

    const trendClass = computed(() => {
      if (trend.value === 'N/A') return 'trend-neutral'
      if (trend.value.startsWith('+')) return 'trend-positive'
      if (trend.value.startsWith('-')) return 'trend-negative'
      return 'trend-neutral'
    })

    const trendArrow = computed(() => {
      if (trend.value.startsWith('+')) return '↗'
      if (trend.value.startsWith('-')) return '↘'
      return '•'
    })

    const trendLabel = computed(() => {
      if (trend.value === 'N/A') return 'No baseline'
      return trend.value
    })

    const qualityTier = computed(() => {
      if (typeof avgQualityScore.value !== 'number') return 'No Data'
      if (avgQualityScore.value >= 85) return 'Excellent'
      if (avgQualityScore.value >= 70) return 'Strong'
      if (avgQualityScore.value >= 55) return 'Developing'
      return 'Needs Work'
    })

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

    return { avgQualityScore, trend, scorePercent, displayScore, trendClass, trendArrow, trendLabel, qualityTier }
  }
})
</script>

<style scoped>
.avg-overall-quality-card {
  position: relative;
  isolation: isolate;
  background: linear-gradient(145deg, #0f3a35 0%, #175e56 58%, #1f7e75 100%);
  border-radius: 1.05rem;
  box-shadow: 0 12px 24px rgba(10, 47, 43, 0.28);
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  height: 100%;
  width: 100%;
  min-height: 0;
  min-width: 0;
  flex: 1 1 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.quality-glow {
  position: absolute;
  top: -48px;
  right: -22px;
  width: 170px;
  height: 170px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(110, 245, 214, 0.32), rgba(110, 245, 214, 0));
  z-index: -1;
}

.quality-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.quality-heading {
  min-width: 0;
}

.quality-title {
  margin: 0.1rem 0 0;
  font-family: 'Sora', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #163455;
  line-height: 1.2;
}

.quality-trend-chip {
  display: flex;
  align-items: center;
  gap: 0.24rem;
  font-family: 'Manrope', sans-serif;
  font-size: 0.68rem;
  font-weight: 800;
  border-radius: 999px;
  padding: 0.18rem 0.55rem;
  white-space: nowrap;
  border: 1px solid transparent;
}

.trend-arrow {
  font-size: 0.72rem;
  line-height: 1;
}

.trend-positive {
  background: rgba(16, 185, 129, 0.16);
  border-color: rgba(16, 185, 129, 0.28);
  color: #0f766e;
}

.trend-negative {
  background: rgba(239, 68, 68, 0.14);
  border-color: rgba(239, 68, 68, 0.3);
  color: #b91c1c;
}

.trend-neutral {
  background: rgba(100, 116, 139, 0.16);
  border-color: rgba(100, 116, 139, 0.28);
  color: #475569;
}

.quality-body {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 0.85rem;
}

.quality-score-orb {
  width: 98px;
  height: 98px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 25%, #ffffff 0%, #d9fff7 72%);
  border: 3px solid rgba(13, 67, 60, 0.46);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 3px rgba(255, 255, 255, 0.32), 0 6px 14px rgba(8, 42, 38, 0.22);
}

.quality-score-value {
  font-family: 'Manrope', sans-serif;
  font-size: 1.85rem;
  font-weight: 900;
  color: #0e4f47;
  line-height: 1;
}

.quality-score-max {
  font-family: 'Manrope', sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  color: #4f7f79;
  margin-top: 0.12rem;
}

.quality-meta {
  display: flex;
  flex-direction: column;
  gap: 0.38rem;
}

.quality-tier-pill {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 0.36rem;
  padding: 0.16rem 0.54rem;
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.12);
  border: 1px solid rgba(15, 118, 110, 0.22);
}

.quality-tier-label {
  font-family: 'Manrope', sans-serif;
  font-size: 0.6rem;
  font-weight: 700;
  color: #0f766e;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.quality-tier-value {
  font-family: 'Sora', sans-serif;
  font-size: 0.64rem;
  font-weight: 700;
  color: #134e4a;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.quality-subtitle {
  margin: 0;
  font-family: 'Manrope', sans-serif;
  font-size: 0.7rem;
  color: #3f5960;
}

.quality-meter {
  width: 100%;
  height: 7px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.24);
  overflow: hidden;
}

.quality-meter-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #90ffe0 0%, #6ef5d6 55%, #42ccbe 100%);
  transition: width 0.4s ease;
}

@media (max-width: 1200px) {
  .quality-score-orb {
    width: 86px;
    height: 86px;
  }

  .quality-score-value {
    font-size: 1.6rem;
  }
}
</style>