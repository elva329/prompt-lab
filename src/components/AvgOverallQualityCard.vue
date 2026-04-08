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

    <div class="quality-stats-grid">
      <div class="stat-item">
        <span class="stat-label">Experiments</span>
        <span class="stat-value">{{ experimentsRun }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Prompts Tested</span>
        <span class="stat-value">{{ promptsEvaluated }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Prompts / Run</span>
        <span class="stat-value">{{ promptsPerRun }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Score Spread</span>
        <span class="stat-value">{{ scoreSpreadLabel }}</span>
      </div>
    </div>

    <div class="quality-insight-row">
      <div class="insight-item">
        <span class="insight-label">Points To Excellent</span>
        <span class="insight-value">{{ pointsToExcellent }}</span>
      </div>
      <div class="insight-item">
        <span class="insight-label">Data Confidence</span>
        <span class="insight-value">{{ confidenceLevel }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import { fetchResultsSummaryRequest } from '../lib/resultsApi'
import { fetchResultsByExperimentRequest } from '../lib/resultsApi'
import { appStore } from '../stores/appStore'
import { getAuthHeaders } from '../lib/authApi'

export default defineComponent({
  name: 'AvgOverallQualityCard',
  setup() {
    const avgQualityScore = ref<number | null>(null)
    const trend = ref<string>("N/A")
    const experimentsRun = ref<number>(0)
    const promptsEvaluated = ref<number>(0)
    const scoreSpread = ref<number | null>(null)
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

    const promptsPerRun = computed(() => {
      if (experimentsRun.value <= 0 || promptsEvaluated.value <= 0) return '0.0'
      return (promptsEvaluated.value / experimentsRun.value).toFixed(1)
    })

    const scoreSpreadLabel = computed(() => {
      if (typeof scoreSpread.value !== 'number') return '--'
      return `${scoreSpread.value} pts`
    })

    const pointsToExcellent = computed(() => {
      if (typeof avgQualityScore.value !== 'number') return '--'
      return `${Math.max(0, 85 - avgQualityScore.value)} pts`
    })

    const confidenceLevel = computed(() => {
      if (promptsEvaluated.value >= 30) return 'High'
      if (promptsEvaluated.value >= 12) return 'Medium'
      if (promptsEvaluated.value > 0) return 'Emerging'
      return 'No Data'
    })

    const fetchAvgQuality = async () => {
      if (!userId) return
      try {
        const summary = await fetchResultsSummaryRequest()
        avgQualityScore.value = summary.avgQualityScore
        experimentsRun.value = summary.experimentsRun || 0
        promptsEvaluated.value = summary.promptsEvaluated || 0

        // Fetch experiments for trend calculation
        const experimentsRes = await fetch('/api/experiments', { headers: getAuthHeaders() })
        const experimentsPayload = await experimentsRes.json()
        const experiments = experimentsPayload.experiments || []
        
        if (experiments.length > 0) {
          const currentExperimentId = experiments[0]._id
          const currentResults = await fetchResultsByExperimentRequest(currentExperimentId)
          const currentScores = currentResults
            .map(r => r.overallQuality)
            .filter(v => typeof v === 'number')

          if (currentScores.length > 0) {
            const maxScore = Math.max(...currentScores)
            const minScore = Math.min(...currentScores)
            scoreSpread.value = maxScore - minScore
          } else {
            scoreSpread.value = null
          }
        }

        if (experiments.length > 1) {
          // Get previous experiment results for trend
          const prevExperimentId = experiments[1]._id
          const prevResults = await fetchResultsByExperimentRequest(prevExperimentId)
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
        scoreSpread.value = null
      }
    }

    onMounted(fetchAvgQuality)

    return { 
      avgQualityScore, 
      trend, 
      scorePercent, 
      displayScore, 
      trendClass, 
      trendArrow, 
      trendLabel, 
      qualityTier,
      experimentsRun,
      promptsEvaluated,
      promptsPerRun,
      scoreSpreadLabel,
      pointsToExcellent,
      confidenceLevel
    }
  }
})
</script>

<style scoped>
.avg-overall-quality-card {
  position: relative;
  isolation: isolate;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 1.05rem;
  box-shadow: 0 4px 12px rgba(16, 35, 63, 0.08);
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  color: #10233f;
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
  background: rgba(16, 185, 129, 0.13);
  border-color: rgba(16, 185, 129, 0.32);
  color: #0b7e6e;
}

.trend-negative {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.32);
  color: #c12525;
}

.trend-neutral {
  background: rgba(100, 116, 139, 0.12);
  border-color: rgba(100, 116, 139, 0.32);
  color: #52616f;
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
  background: linear-gradient(135deg, #f5fbf9 0%, #ebf5f2 60%, #dff1ed 100%);
  border: 2px solid rgba(42, 157, 143, 0.26);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(42, 157, 143, 0.12), inset 0 0 0 2px rgba(255, 255, 255, 0.54);
}

.quality-score-value {
  font-family: 'Manrope', sans-serif;
  font-size: 1.85rem;
  font-weight: 900;
  color: #0e7366;
  line-height: 1;
}

.quality-score-max {
  font-family: 'Manrope', sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  color: #5f8f89;
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
  background: rgba(42, 157, 143, 0.12);
  border: 1px solid rgba(42, 157, 143, 0.24);
}

.quality-tier-label {
  font-family: 'Manrope', sans-serif;
  font-size: 0.6rem;
  font-weight: 700;
  color: #0f7366;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.quality-tier-value {
  font-family: 'Sora', sans-serif;
  font-size: 0.64rem;
  font-weight: 700;
  color: #0b5948;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.quality-subtitle {
  margin: 0;
  font-family: 'Manrope', sans-serif;
  font-size: 0.7rem;
  color: #5f6d6b;
}

.quality-meter {
  width: 100%;
  height: 7px;
  border-radius: 999px;
  background: rgba(42, 157, 143, 0.16);
  overflow: hidden;
}

.quality-meter-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #2a9d8f 0%, #1b7f75 55%, #0e7366 100%);
  transition: width 0.4s ease;
}

.quality-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  background: linear-gradient(135deg, rgba(42, 157, 143, 0.08), rgba(27, 94, 85, 0.06));
  border-radius: 0.9rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid rgba(42, 157, 143, 0.12);
  backdrop-filter: blur(8px);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.24rem;
  text-align: center;
  padding: 0 0.45rem;
  position: relative;
}

.stat-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 24px;
  width: 1px;
  background: linear-gradient(180deg, transparent, rgba(42, 157, 143, 0.26), transparent);
}

.stat-label {
  font-family: 'Manrope', sans-serif;
  font-size: 0.63rem;
  font-weight: 750;
  color: #5f6d6b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  line-height: 1.1;
}

.stat-value {
  font-family: 'Manrope', sans-serif;
  font-size: 1.12rem;
  font-weight: 900;
  color: #10233f;
  letter-spacing: 0.01em;
}

.quality-insight-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.insight-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  border-radius: 0.68rem;
  border: 1px solid rgba(42, 157, 143, 0.12);
  background: rgba(42, 157, 143, 0.05);
  padding: 0.42rem 0.5rem;
}

.insight-label {
  font-family: 'Manrope', sans-serif;
  font-size: 0.62rem;
  font-weight: 700;
  color: #5f6d6b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.insight-value {
  font-family: 'Manrope', sans-serif;
  font-size: 0.78rem;
  font-weight: 800;
  color: #0e7366;
}

@media (max-width: 1200px) {
  .quality-score-orb {
    width: 86px;
    height: 86px;
  }

  .quality-score-value {
    font-size: 1.6rem;
  }

  .quality-stats-grid {
    grid-template-columns: repeat(4, 1fr);
    padding: 0.58rem 0.65rem;
  }

  .stat-label {
    font-size: 0.6rem;
  }

  .stat-value {
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .quality-body {
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0.65rem;
  }

  .quality-score-orb {
    width: 72px;
    height: 72px;
  }

  .quality-score-value {
    font-size: 1.42rem;
  }

  .quality-stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.2rem;
    padding: 0.52rem 0.55rem;
  }

  .stat-label {
    font-size: 0.58rem;
  }

  .stat-value {
    font-size: 0.95rem;
  }

  .stat-item:not(:last-child)::after {
    display: none;
  }

  .quality-insight-row {
    grid-template-columns: 1fr;
  }
}
</style>