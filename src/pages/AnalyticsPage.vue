<template>
  <div class="analytics-page fade-in-up favorites-page page-surface page-fullheight">
    <div class="dashboard-menu-row">
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

    <div class="analytics-container">
      <header class="analytics-header">
        <div>
          <p class="analytics-eyebrow mb-1">Analytics-first</p>
          <h1 class="analytics-title mb-2">Prompt performance overview</h1>
          <p class="analytics-subtitle mb-0">
            Review prompt quality, response time, and experiment rankings in one clear workspace.
          </p>
        </div>
      </header>

      <div class="analytics-top-strip">
        <div class="analytics-card-shell analytics-top-metric">
          <AvgOverallQualityCard />
        </div>
        <div class="analytics-card-shell analytics-top-metric">
          <AvgResponseTimeCard />
        </div>
        <div class="analytics-card-shell analytics-top-metric">
          <PromptsEvaluatedCard />
        </div>
        <div class="analytics-card-shell analytics-top-metric">
          <PassRateCard />
        </div>
      </div>

      <div class="analytics-main-content">
        <!-- Column 1: Trend -->
        <section class="analytics-panel analytics-panel--trend-full">
          <div class="analytics-card-shell">
            <QualityScoreTrendCard />
          </div>
        </section>

        <!-- Column 2: Summary, Dimensions & Latest -->
        <div class="analytics-right-column">
          <!-- <div class="analytics-summary-row">
            <section class="analytics-panel analytics-panel--summary-full">
              <div class="analytics-card-shell">
                <QualitySummaryCard />
              </div>
            </section>
          </div> -->

          <div class="analytics-secondary-grid">
            <section class="analytics-panel analytics-panel--dimensions">
              <div class="analytics-card-shell">
                <QualityDimensionsCard />
              </div>
            </section>

            <section class="analytics-panel analytics-panel--latest">
              <div class="analytics-card-shell">
                <LatestTestResultCard />
              </div>
            </section>
          </div>
        </div>
      </div>

      <div class="analytics-bottom-row">
        <section class="analytics-panel analytics-panel--response">
          <div class="analytics-card-shell">
            <ResponseTimeByPromptCard />
          </div>
        </section>

        <section class="analytics-panel analytics-panel--rankings">
          <div class="analytics-card-shell">
            <PromptRankingsCard />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { appStore } from '../stores/appStore'
import AvgOverallQualityCard from '../components/AvgOverallQualityCard.vue'
import AvgResponseTimeCard from '../components/AvgResponseTimeCard.vue'
import PromptsEvaluatedCard from '../components/PromptsEvaluatedCard.vue'
import PassRateCard from '../components/PassRateCard.vue'
import QualityDimensionsCard from '../components/QualityDimensionsCard.vue'
import QualityScoreTrendCard from '../components/QualityScoreTrendCard.vue'
import LatestTestResultCard from '../components/LatestTestResultCard.vue'
import QualitySummaryCard from '../components/QualitySummaryCard.vue'
import ResponseTimeByPromptCard from '../components/ResponseTimeByPromptCard.vue'
import PromptRankingsCard from '../components/PromptRankingsCard.vue'

export default defineComponent({
  name: 'AnalyticsPage',
  components: {
    AvgOverallQualityCard,
    AvgResponseTimeCard,
    PromptsEvaluatedCard,
    PassRateCard,
    QualityDimensionsCard,
    QualityScoreTrendCard,
    LatestTestResultCard,
    QualitySummaryCard,
    ResponseTimeByPromptCard,
    PromptRankingsCard
  },
  setup() {
    const router = useRouter()
    const route = useRoute()

    const navItems = [
      { name: 'Analytics', path: '/analytics', icon: 'bi-graph-up' },
      { name: 'Prompt Library', path: '/prompts', icon: 'bi-journal-text' },
      { name: 'Favorites', path: '/favorites', icon: 'bi-star-fill' },
      { name: 'Experiments', path: '/experiments', icon: 'bi-flask' }
    ]

    function isNavItemActive(path: string): boolean {
      if (path === '/experiments') {
        return route.path === '/experiments' || route.path.startsWith('/experiments/')
      }

      return route.path === path
    }

    const currentNavItem = computed(() => navItems.find(item => isNavItemActive(item.path)))

    function handleLogout(): void {
      appStore.logout()
      router.push('/')
    }

    return {
      navItems,
      isNavItemActive,
      handleLogout,
      currentNavItem
    }
  }
})
</script>

<style scoped>
.analytics-page {
  position: relative;
  padding: 0.75rem;
  box-sizing: border-box;
  background:
    radial-gradient(circle at 12% 12%, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0) 30%),
    radial-gradient(circle at 84% 18%, rgba(42, 157, 143, 0.12), rgba(42, 157, 143, 0) 34%),
    linear-gradient(180deg, #f8f3eb 0%, #f4efe6 54%, #eef4f2 100%);
}

.analytics-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.analytics-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.25rem 0.2rem 0.2rem;
  margin-bottom: 0.45rem;
}

.analytics-eyebrow {
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #6b7c79;
}

.analytics-title {
  font-size: clamp(1.65rem, 3vw, 2.2rem);
  line-height: 1.05;
  color: #10233f;
}

.analytics-subtitle {
  max-width: 48rem;
  color: #5f6d6b;
  font-size: 0.95rem;
  line-height: 1.55;
}

.analytics-top-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.7rem;
  margin-bottom: 0.7rem;
}

.analytics-main-content {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1.4fr);
  gap: 0.7rem;
  margin-bottom: 0.7rem;
  align-items: stretch;
}

.analytics-panel--trend-full {
  max-height: none;
  height: 100%;
  min-height: 0;
}

.analytics-right-column {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  min-height: 0;
  height: 100%;
}

.analytics-summary-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.7rem;
  flex-shrink: 0;
}

.analytics-panel--summary-full {
  max-height: 160px;
  min-height: 0;
}

.analytics-secondary-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: auto;
  gap: 0.7rem;
  align-items: stretch;
  flex: 1;
  min-height: 0;
}

.analytics-panel--dimensions {
  max-height: none;
  height: 100%;
  min-height: 0;
}

.analytics-panel--latest {
  max-height: none;
  height: 100%;
  min-height: 0;
}

.analytics-bottom-row {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(0, 1.2fr);
  gap: 0.7rem;
  align-items: stretch;
  margin-bottom: 0.7rem;
}

.analytics-panel--response {
  grid-column: 1;
}

.analytics-panel--rankings {
  grid-column: 2;
}

.analytics-panel {
  min-width: 0;
  display: flex;
}

.analytics-card-shell {
  max-height: 420px;
  border: none;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  width: 100%;
  min-width: 0;
  margin: 0;
  background: rgba(255, 255, 255, 0.75);
  box-shadow: 0 4px 12px rgba(16, 35, 63, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.analytics-card-shell:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 12px 24px rgba(16, 35, 63, 0.12);
}

.analytics-card-shell > * {
  width: 100%;
}

.analytics-top-metric {
  align-items: stretch;
}

.analytics-card-shell--latest {
  height: auto;
}

.analytics-card-shell--trend {
  min-height: 0;
}
.analytics-card-shell--summary {
  min-height: 0;
}

.analytics-card-shell--compact {
  min-height: 0;
}
.analytics-card-shell--summary,
.analytics-card-shell--compact,
.analytics-card-shell--signal {
  min-height: 0;
}

.analytics-card-shell--compact,
.analytics-card-shell--signal {
  height: auto;
}

:deep(.avg-response-time-card),
:deep(.prompts-evaluated-card),
:deep(.pass-rate-card),
:deep(.pc-card),
:deep(.quality-card),
:deep(.ui-card) {
  width: 100%;
  height: 100% !important;
  min-height: 100% !important;
  background: rgba(255, 255, 255, 0.75) !important;
  border: none !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 12px rgba(16, 35, 63, 0.08) !important;
  color: #10233f !important;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  backdrop-filter: blur(10px) !important;
}

:deep(.avg-response-time-card:hover),
:deep(.prompts-evaluated-card:hover),
:deep(.pass-rate-card:hover),
:deep(.pc-card:hover),
:deep(.quality-card:hover),
:deep(.ui-card:hover) {
  background: rgba(255, 255, 255, 0.85) !important;
  box-shadow: 0 12px 24px rgba(16, 35, 63, 0.12) !important;
  transform: translateY(-2px) !important;
}

:deep(.avg-response-time-card),
:deep(.prompts-evaluated-card),
:deep(.pass-rate-card) {
  padding: 0.78rem 0.85rem 0.72rem !important;
}

:deep(.avg-response-time-card .card-title),
:deep(.prompts-evaluated-card .card-title),
:deep(.pass-rate-card .card-title),
:deep(.pc-title),
:deep(.quality-title),
:deep(.card-title) {
  color: #10233f !important;
}

:deep(.avg-response-time-card .card-subtitle),
:deep(.prompts-evaluated-card .card-subtitle),
:deep(.pass-rate-card .card-subtitle),
:deep(.pc-total),
:deep(.quality-subtitle),
:deep(.trend-stat-label),
:deep(.prompt-name) {
  color: #5f6d6b !important;
}

:deep(.avg-response-time-card .card-header),
:deep(.prompts-evaluated-card .card-header),
:deep(.pass-rate-card .card-header) {
  margin-bottom: 0.35rem !important;
}

:deep(.avg-response-time-card .card-value),
:deep(.prompts-evaluated-card .card-value),
:deep(.pass-rate-card .card-value) {
  font-size: 1.25rem !important;
}

:deep(.avg-response-time-card .icon-bg),
:deep(.prompts-evaluated-card .icon-bg),
:deep(.pass-rate-card .icon-bg) {
  width: 34px !important;
  height: 34px !important;
  background: rgba(246, 242, 235, 0.96) !important;
  border-radius: 16px;
}

:deep(.avg-response-time-card .trend-badge),
:deep(.prompts-evaluated-card .trend-badge),
:deep(.pass-rate-card .trend-badge) {
  padding: 0.12rem 0.45rem !important;
  background: rgba(214, 239, 233, 0.9) !important;
  color: #1b5e55 !important;
}

:deep(.avg-response-time-card .progress-bar),
:deep(.prompts-evaluated-card .progress-bar),
:deep(.pass-rate-card .progress-bar) {
  background: rgba(225, 234, 230, 0.92) !important;
}

:deep(.avg-response-time-card .progress-bar-fill),
:deep(.prompts-evaluated-card .progress-bar-fill),
:deep(.pass-rate-card .progress-bar-fill) {
  background: linear-gradient(90deg, #1b5e55, #2a9d8f) !important;
}

:deep(.avg-overall-quality-card) {
  width: 100%;
  height: 100% !important;
  min-height: 100% !important;
  background: linear-gradient(150deg, rgba(232, 247, 245, 0.96), rgba(224, 240, 252, 0.94)) !important;
  /* border: 1px solid rgba(27, 94, 85, 0.22) !important; */
  border-radius: 16px !important;
  box-shadow: 0 8px 20px rgba(27, 94, 85, 0.14) !important;
  color: #10233f !important;
  padding: 0.9rem 0.95rem 0.82rem !important;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.avg-overall-quality-card:hover) {
  background: linear-gradient(150deg, rgba(236, 250, 247, 0.98), rgba(229, 244, 255, 0.96)) !important;
  box-shadow: 0 12px 24px rgba(27, 94, 85, 0.2) !important;
  transform: translateY(-2px) !important;
}

:deep(.avg-overall-quality-card .card-title) {
  color: #0f4d45 !important;
  letter-spacing: 0.02em !important;
}

:deep(.avg-overall-quality-card .card-subtitle) {
  color: #4f6f6a !important;
}

:deep(.avg-overall-quality-card .card-header) {
  margin-bottom: 0.45rem !important;
}

:deep(.avg-overall-quality-card .card-value) {
  font-size: 1.4rem !important;
  color: #0f4d45 !important;
}

:deep(.avg-overall-quality-card .icon-bg) {
  width: 36px !important;
  height: 36px !important;
  border-radius: 10px !important;
  background: rgba(255, 255, 255, 0.86) !important;
  border: 1px solid rgba(27, 94, 85, 0.16) !important;
}

:deep(.avg-overall-quality-card .trend-badge) {
  padding: 0.13rem 0.5rem !important;
  background: rgba(27, 94, 85, 0.14) !important;
  color: #0f4d45 !important;
}

:deep(.avg-overall-quality-card .progress-bar) {
  background: rgba(184, 214, 208, 0.5) !important;
}

:deep(.avg-overall-quality-card .progress-bar-fill) {
  background: linear-gradient(90deg, #1b5e55, #3aa39a) !important;
}

:deep(.quality-card .quality-card-inner),
:deep(.ui-card) {
  font-family: 'Manrope', sans-serif !important;
}

:deep(.quality-card .quality-card-inner) {
  padding: 0.9rem 1rem !important;
}

/* :deep(.quality-card .radar-chart) {
  height: 118px !important;
} */

:deep(.quality-card .bg-orange-400) {
  background: #f97316 !important;
}

:deep(.quality-card .dimension-pill) {
  background: rgba(240, 234, 224, 0.96) !important;
}

:deep(.quality-card .dimension-pill-label) {
  color: #1b5e55 !important;
}

:deep(.quality-card .dimension-pill-value) {
  color: #10233f !important;
}

:deep(.ui-card .card-body) {
  min-height: 114px !important;
}

:deep(.ui-card .card-dot) {
  background: #1b5e55 !important;
}

:deep(.pc-card) {
  width: 100%;
  max-width: 100% !important;
  padding: 14px 16px !important;
}

:deep(.pc-card .pc-content) {
  gap: 12px;
}

:deep(.pc-card svg) {
  width: 88px;
  height: 88px;
}

:deep(.pc-card .pc-donut-col) {
  min-width: 88px;
}

:deep(.pc-card .pc-legend-col) {
  min-width: 110px;
  gap: 8px;
}

:deep(.section-header.top),
:deep(.score-value.top),
:deep(.rank-circle.top) {
  color: #2a9d8f !important;
}

:deep(.section-header.attention),
:deep(.score-value.attention),
:deep(.rank-circle.attention) {
  color: #b45309 !important;
}

:deep(.section-header .header-label) {
  background: rgba(237, 244, 241, 0.96) !important;
  color: #1b5e55 !important;
}

:deep(.section-header.attention .header-label) {
  background: rgba(249, 237, 229, 0.96) !important;
  color: #b45309 !important;
}

:deep(.rank-circle.top) {
  background: rgba(214, 239, 233, 0.92) !important;
}

:deep(.rank-circle.attention) {
  background: rgba(249, 237, 229, 0.96) !important;
}

:deep(.score-bar.top) {
  background: linear-gradient(90deg, #2a9d8f 60%, rgba(42, 157, 143, 0.18) 100%) !important;
}

:deep(.score-bar.attention) {
  background: linear-gradient(90deg, #d97706 60%, rgba(217, 119, 6, 0.18) 100%) !important;
}

:deep(.dashboard-menu-pills) {
  background: rgba(255, 255, 255, 0.68) !important;
  border: 1px solid rgba(208, 218, 216, 0.56) !important;
  box-shadow: 0 12px 26px rgba(16, 35, 63, 0.06) !important;
}

:deep(.dashboard-menu-link) {
  color: #51605d !important;
}

:deep(.dashboard-menu-link:hover) {
  color: #10233f !important;
  background: rgba(236, 243, 242, 0.95) !important;
}

:deep(.dashboard-menu-link.active) {
  color: #f8fbfc !important;
  background: linear-gradient(130deg, #10233f, #1b5e55) !important;
  box-shadow: 0 8px 18px rgba(16, 35, 63, 0.14) !important;
}

:deep(.dashboard-menu-icon) {
  background: rgba(255, 255, 255, 0.74) !important;
  color: #10233f !important;
  box-shadow: 0 10px 22px rgba(16, 35, 63, 0.05) !important;
}

:deep(.dashboard-menu-icon:hover) {
  background: rgba(255, 255, 255, 0.86) !important;
  color: #1b5e55 !important;
}

:deep(.avg-response-time-card svg circle:first-child) {
  fill: rgba(237, 244, 241, 0.88) !important;
}

:deep(.prompts-evaluated-card svg text) {
  fill: #1b5e55 !important;
}

@media screen and (max-width: 1200px) {
  .analytics-top-strip,
  .analytics-main-grid {
    grid-template-columns: 1fr;
  }

  .analytics-main-content {
    grid-template-columns: 1fr;
  }

  .analytics-secondary-grid {
    grid-template-columns: 1fr;
    gap: 0.7rem;
  }

  .analytics-bottom-row {
    grid-template-columns: 1fr;
  }
}

@media screen and (max-width: 768px) {
  .analytics-page {
    padding: 0.55rem;
  }

  .analytics-header {
    align-items: flex-start;
  }

  .analytics-title {
    font-size: 1.45rem;
  }

  .analytics-subtitle {
    font-size: 0.92rem;
  }

  .analytics-top-strip,
  .analytics-body-grid {
    gap: 0.6rem;
  }
}
</style>