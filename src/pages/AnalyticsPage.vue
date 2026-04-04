<template>
  <div class="analytics-page fade-in-up favorites-page page-surface page-fullheight">
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
    <div class="analytics-container">
      <header class="analytics-header mb-4">
        <div>
          <p class="analytics-eyebrow mb-1">Analytics-first</p>
          <h1 class="analytics-title mb-2">Prompt performance overview</h1>
          <p class="analytics-subtitle mb-0">
            Review prompt quality, response time, and experiment rankings in one clear workspace.
          </p>
        </div>
      </header>
      <!-- SECTION 1 -->
      <div class="section-1">
        <!-- ROW 1: 4 cards - 271*164 each -->
        <div class="card-row-container">
          <div class="bordered-card card-row1">
            <AvgOverallQualityCard />
          </div>
          <div class="bordered-card card-row1">
            <AvgResponseTimeCard />
          </div>
          <div class="bordered-card card-row1">
            <PromptsEvaluatedCard />
          </div>
          <div class="bordered-card card-row1">
            <PassRateCard />
          </div>
        </div>

        <!-- ROW 2: 3 cards - height 379px each -->
        <div class="card-row2-container">
          <div class="bordered-card card-row2 left">
            <QualityDimensionsCard />
          </div>
          <div class="bordered-card card-row2 middle">
            <QualityScoreTrendCard />
          </div>
          <div class="bordered-card card-row2 right">
            <QualitySummaryCard />
          </div>
        </div>

        <!-- ROW 3: 2 cards - height 547px each -->
        <div class="card-row-container">
          <div class="bordered-card card-row3">
            <ResponseTimeByPromptCard />
          </div>
          <div class="bordered-card card-row3">
            <PromptRankingsCard />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { appStore } from '../stores/appStore'
import AvgOverallQualityCard from '../components/AvgOverallQualityCard.vue'
import AvgResponseTimeCard from '../components/AvgResponseTimeCard.vue'
import PromptsEvaluatedCard from '../components/PromptsEvaluatedCard.vue'
import PassRateCard from '../components/PassRateCard.vue'
import QualityDimensionsCard from '../components/QualityDimensionsCard.vue'
import QualityScoreTrendCard from '../components/QualityScoreTrendCard.vue'
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
    QualitySummaryCard,
    ResponseTimeByPromptCard,
    PromptRankingsCard
  },
  setup() {
    const router = useRouter()
    const route = useRoute()

    // appStore is imported directly
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
  padding: 0.25rem 0.2rem 0.15rem;
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

/* Border styles with radius - NO PADDING */
.bordered-card {
  border: none;
  border-radius: 18px;
  box-sizing: border-box;
  width: 100%;
  display: flex;
  align-items: stretch;
  background: rgba(255, 255, 255, 0.62);
  box-shadow: 0 10px 22px rgba(16, 35, 63, 0.05);
  transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

.bordered-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 14px 28px rgba(16, 35, 63, 0.08);
}

.bordered-card > * {
  width: 100%;
  height: 100%;
}

.section-1 {
  margin-bottom: 1.25rem;
}

/* ALL ROWS use the same container with consistent gap */
.card-row-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.card-row2-container {
  display: flex;
  width: 100%;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

/* All cards flex equally */
.card-row-container > * {
  flex: 1;
  min-width: 250px; /* Prevent cards from getting too small */
}

/* Card dimensions */
.card-row1 {
  height: 200px;
}

.card-row2 {
  height: 379px;
  flex-shrink: 1;
  flex-basis: 0;
}

.left, .right {
  flex-grow: 1; /* Takes 1 part of space */
}

.middle {
  flex-grow: 2; /* Takes 2 parts of space */
}
.card-row3 {
  height: 400px;
}

:deep(.dashboard-menu-row) {
  margin-bottom: 0.9rem;
}

:deep(.dashboard-menu-pills) {
  background: rgba(255, 255, 255, 0.62);
  box-shadow: 0 10px 22px rgba(16, 35, 63, 0.05);
  border: 1px solid rgba(208, 218, 216, 0.5);
}

:deep(.dashboard-menu-link) {
  color: #51605d;
}

:deep(.dashboard-menu-link:hover) {
  color: #10233f;
  background: rgba(236, 243, 242, 0.95);
}

:deep(.dashboard-menu-link.active) {
  color: #f8fbfc;
  background: linear-gradient(130deg, #10233f, #1b5e55);
  box-shadow: 0 8px 18px rgba(16, 35, 63, 0.14);
}

:deep(.dashboard-menu-icon) {
  background: rgba(255, 255, 255, 0.68);
  color: #10233f;
  box-shadow: 0 10px 22px rgba(16, 35, 63, 0.05);
}

:deep(.dashboard-menu-icon:hover) {
  background: rgba(255, 255, 255, 0.86);
  color: #1b5e55;
}

/* Responsive adjustments */
@media screen and (max-width: 1200px) {
  .card-row-container > .card-row1 {
    flex-basis: calc(50% - 0.75rem); /* 2 cards per row, accounting for 1.5rem gap */
  }
  .card-row2-container > .card-row2,
  .card-row-container > .card-row3 {
    flex-basis: 100%; /* Stack cards in row 2 and 3 */
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

  .card-row-container > *,
  .card-row2-container > * {
    flex: 1 1 100%;
    width: 100%;
    max-width: 100%;
    height: auto; /* Let height be determined by content */
  }

  /* Ensure specific card heights are also auto */
  .card-row1,
  .card-row2,
  .card-row3 {
    height: auto;
    min-height: 200px;
  }
}
</style>