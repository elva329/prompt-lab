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
  /* height: 100vh; */
  padding: 1rem;
  box-sizing: border-box;
}

.analytics-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

/* Border styles with radius - NO PADDING */
.bordered-card {
  /* border: 2px solid #000; */
  border-radius: 8px;
  box-sizing: border-box;
  width: 100%;
  display: flex;
  align-items: stretch;
}

.bordered-card > * {
  width: 100%;
  height: 100%;
}

.section-1 {
  margin-bottom: 2rem;
}

/* ALL ROWS use the same container with consistent gap */
.card-row-container {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.card-row2-container {
  display: flex;
  width: 100%;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
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
    min-height: 200px; /* Give cards a minimum height on mobile */
  }
}
</style>