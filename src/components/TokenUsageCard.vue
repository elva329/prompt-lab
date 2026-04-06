<template>
  <article class="token-usage-card">
    <header class="tu-header">
      <div class="tu-title-wrap">
        <span class="tu-title-dot" aria-hidden="true"></span>
        <h3 class="tu-title">Token Usage</h3>
      </div>
      <div class="tu-badge">
        <i class="bi bi-lightning-charge" aria-hidden="true"></i>
        <span>{{ tokensPerPromptLabel }}</span>
      </div>
    </header>

    <div class="tu-kpi-grid">
      <div class="tu-kpi-box">
        <div class="tu-kpi-label">AVG / RUN</div>
        <div class="tu-kpi-value tu-kpi-value--violet">{{ avgPerRunLabel }}</div>
      </div>
      <div class="tu-kpi-box">
        <div class="tu-kpi-label">TOTAL</div>
        <div class="tu-kpi-value tu-kpi-value--teal">{{ totalTokensLabel }}</div>
      </div>
    </div>

    <div class="tu-section-title">TOKEN SHARE BY QUALITY TIER</div>
    <div class="tu-share-bar" role="img" aria-label="Token share by quality tier">
      <span class="tu-segment tu-segment--excellent" :style="{ width: tierPercentages.excellent + '%' }"></span>
      <span class="tu-segment tu-segment--good" :style="{ width: tierPercentages.good + '%' }"></span>
      <span class="tu-segment tu-segment--fair" :style="{ width: tierPercentages.fair + '%' }"></span>
      <span class="tu-segment tu-segment--poor" :style="{ width: tierPercentages.poor + '%' }"></span>
    </div>

    <ul class="tu-tier-list">
      <li class="tu-tier-row" v-for="tier in tiers" :key="tier.key">
        <div class="tu-tier-left">
          <span class="tu-tier-dot" :class="'tu-tier-dot--' + tier.key"></span>
          <span class="tu-tier-name">{{ tier.name }}</span>
        </div>
        <span class="tu-tier-pill" :class="'tu-tier-pill--' + tier.key">{{ tier.share }}%</span>
        <span class="tu-tier-right">~{{ tier.avgTokens }}</span>
      </li>
    </ul>
  </article>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import { appStore } from '../stores/appStore'
import { fetchResultsByUserRequest, fetchResultsSummaryRequest } from '../lib/resultsApi'

type TierKey = 'excellent' | 'good' | 'fair' | 'poor'

type TierStats = {
  key: TierKey
  name: string
  tokens: number
  count: number
}

function safeNum(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

export default defineComponent({
  name: 'TokenUsageCard',
  setup() {
    const userId = appStore.state.user?.id || ''
    const totalTokens = ref(0)
    const experimentsRun = ref(0)
    const promptsEvaluated = ref(0)

    const tierStats = ref<Record<TierKey, TierStats>>({
      excellent: { key: 'excellent', name: 'Excellent', tokens: 0, count: 0 },
      good: { key: 'good', name: 'Good', tokens: 0, count: 0 },
      fair: { key: 'fair', name: 'Fair', tokens: 0, count: 0 },
      poor: { key: 'poor', name: 'Poor', tokens: 0, count: 0 },
    })

    const avgPerRun = computed(() => {
      if (experimentsRun.value <= 0) return 0
      return totalTokens.value / experimentsRun.value
    })

    const tokensPerPrompt = computed(() => {
      if (promptsEvaluated.value > 0) {
        return totalTokens.value / promptsEvaluated.value
      }
      const totalCount = Object.values(tierStats.value).reduce((acc, item) => acc + item.count, 0)
      return totalCount > 0 ? totalTokens.value / totalCount : 0
    })

    const tierPercentages = computed(() => {
      const total = totalTokens.value || 1
      return {
        excellent: Math.round((tierStats.value.excellent.tokens / total) * 100),
        good: Math.round((tierStats.value.good.tokens / total) * 100),
        fair: Math.round((tierStats.value.fair.tokens / total) * 100),
        poor: Math.max(
          0,
          100 -
            Math.round((tierStats.value.excellent.tokens / total) * 100) -
            Math.round((tierStats.value.good.tokens / total) * 100) -
            Math.round((tierStats.value.fair.tokens / total) * 100)
        ),
      }
    })

    const tiers = computed(() => {
      const items: Array<{ key: TierKey; name: string; share: number; avgTokens: number }> = [
        { key: 'excellent', name: 'Excellent', share: tierPercentages.value.excellent, avgTokens: 0 },
        { key: 'good', name: 'Good', share: tierPercentages.value.good, avgTokens: 0 },
        { key: 'fair', name: 'Fair', share: tierPercentages.value.fair, avgTokens: 0 },
        { key: 'poor', name: 'Poor', share: tierPercentages.value.poor, avgTokens: 0 },
      ]

      return items.map((item) => {
        const tier = tierStats.value[item.key]
        const avgTokens = tier.count > 0 ? Math.round(tier.tokens / tier.count) : 0
        return { ...item, avgTokens }
      })
    })

    const avgPerRunLabel = computed(() => `${Math.round(avgPerRun.value).toLocaleString()} tok`)

    const totalTokensLabel = computed(() => {
      if (totalTokens.value >= 1_000_000) {
        return `${(totalTokens.value / 1_000_000).toFixed(2)} M`
      }
      if (totalTokens.value >= 1_000) {
        return `${(totalTokens.value / 1_000).toFixed(1)} K`
      }
      return `${Math.round(totalTokens.value)}`
    })

    const tokensPerPromptLabel = computed(() => `${tokensPerPrompt.value.toFixed(1)} tok/pt`)

    const loadTokenUsage = async () => {
      if (!userId) return

      try {
        const [summary, results] = await Promise.all([
          fetchResultsSummaryRequest(userId),
          fetchResultsByUserRequest(userId),
        ])

        experimentsRun.value = safeNum(summary.experimentsRun)
        promptsEvaluated.value = safeNum(summary.promptsEvaluated)

        const nextTiers: Record<TierKey, TierStats> = {
          excellent: { key: 'excellent', name: 'Excellent', tokens: 0, count: 0 },
          good: { key: 'good', name: 'Good', tokens: 0, count: 0 },
          fair: { key: 'fair', name: 'Fair', tokens: 0, count: 0 },
          poor: { key: 'poor', name: 'Poor', tokens: 0, count: 0 },
        }

        let tokenSum = 0
        for (const row of results) {
          const tokens = safeNum(row.tokensUsed)
          const score = safeNum(row.overallQuality)
          tokenSum += tokens

          let key: TierKey = 'poor'
          if (score >= 80) key = 'excellent'
          else if (score >= 60) key = 'good'
          else if (score >= 40) key = 'fair'

          nextTiers[key].tokens += tokens
          nextTiers[key].count += 1
        }

        totalTokens.value = tokenSum
        tierStats.value = nextTiers
      } catch {
        totalTokens.value = 0
        experimentsRun.value = 0
        promptsEvaluated.value = 0
      }
    }

    onMounted(loadTokenUsage)

    return {
      avgPerRunLabel,
      totalTokensLabel,
      tokensPerPromptLabel,
      tierPercentages,
      tiers,
    }
  },
})
</script>

<style scoped>
.token-usage-card {
  background: linear-gradient(180deg, rgba(247, 246, 253, 0.98), rgba(241, 243, 251, 0.95));
  border: 1px solid rgba(220, 222, 236, 0.95);
  border-radius: 20px;
  box-shadow: 0 10px 24px rgba(21, 33, 54, 0.08);
  padding: 0.9rem 1rem;
  height: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.tu-title-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
}

.tu-title-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #8b6ff0;
}

.tu-title {
  margin: 0;
  font-size: 0.96rem;
  font-weight: 800;
  color: #334155;
}

.tu-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(139, 111, 240, 0.13);
  color: #7c3aed;
  border-radius: 999px;
  padding: 0.26rem 0.65rem;
  font-size: 0.72rem;
  font-weight: 800;
  white-space: nowrap;
}

.tu-kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.tu-kpi-box {
  border-radius: 14px;
  background: rgba(232, 235, 245, 0.52);
  padding: 0.56rem 0.65rem;
}

.tu-kpi-label {
  font-size: 0.62rem;
  letter-spacing: 0.04em;
  font-weight: 800;
  color: #8793a9;
}

.tu-kpi-value {
  font-size: 1.18rem;
  line-height: 1.15;
  font-weight: 900;
  margin-top: 0.2rem;
}

.tu-kpi-value--violet {
  color: #8b5cf6;
}

.tu-kpi-value--teal {
  color: #14b8a6;
}

.tu-section-title {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #7b88a2;
}

.tu-share-bar {
  display: flex;
  width: 100%;
  height: 12px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(228, 232, 242, 0.88);
}

.tu-segment {
  height: 100%;
}

.tu-segment--excellent {
  background: #4ade80;
}

.tu-segment--good {
  background: #4f86e8;
}

.tu-segment--fair {
  background: #f3b045;
}

.tu-segment--poor {
  background: #ec7878;
}

.tu-tier-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.45rem;
}

.tu-tier-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  column-gap: 0.5rem;
}

.tu-tier-left {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
}

.tu-tier-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tu-tier-dot--excellent {
  background: #22c55e;
}

.tu-tier-dot--good {
  background: #3b82f6;
}

.tu-tier-dot--fair {
  background: #f59e0b;
}

.tu-tier-dot--poor {
  background: #ef4444;
}

.tu-tier-name {
  font-size: 0.76rem;
  font-weight: 700;
  color: #5b6c89;
  white-space: nowrap;
}

.tu-tier-pill {
  border-radius: 12px;
  padding: 0.18rem 0.5rem;
  font-size: 0.7rem;
  font-weight: 800;
  min-width: 2.55rem;
  text-align: center;
}

.tu-tier-pill--excellent {
  background: rgba(34, 197, 94, 0.13);
  color: #16a34a;
}

.tu-tier-pill--good {
  background: rgba(59, 130, 246, 0.14);
  color: #2563eb;
}

.tu-tier-pill--fair {
  background: rgba(245, 158, 11, 0.16);
  color: #d97706;
}

.tu-tier-pill--poor {
  background: rgba(239, 68, 68, 0.14);
  color: #dc2626;
}

.tu-tier-right {
  font-size: 0.82rem;
  font-weight: 700;
  color: #8090ad;
  min-width: 3rem;
  text-align: right;
}

@media (max-width: 900px) {
  .token-usage-card {
    padding: 0.8rem 0.9rem;
  }
}
</style>
