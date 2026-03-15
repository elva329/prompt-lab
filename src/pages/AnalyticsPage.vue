<template>
  <div class="analytics-page">
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
import { defineComponent } from 'vue'
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
  }
})
</script>

<style scoped>
.analytics-page {
  height: 100vh;
  overflow-y: auto;
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
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.card-row2-container {
  display: flex;
  width: 100%;
  gap: 1rem;
  margin-bottom: 1rem;
}

/* All cards flex equally */
.card-row-container > * {
  flex: 1;
  min-width: 200px;
}

/* Card dimensions */
.card-row1 {
  height: 164px;
}

.card-row2 {
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
  height: 547px;
}

/* Force all cards in row 2 to have exactly 379px */
.card-row2,
.card-row2 > * {
  height: 379px !important;
  min-height: 379px !important;
  max-height: 379px !important;
}

/* Force all cards in row 3 to have exactly 547px */
.card-row3,
.card-row3 > * {
  height: 547px !important;
  min-height: 547px !important;
  max-height: 547px !important;
}

/* Force all cards in row 1 to have exactly 164px */
.card-row1,
.card-row1 > * {
  height: 164px !important;
  min-height: 164px !important;
  max-height: 164px !important;
}

/* Responsive adjustments */
@media screen and (max-width: 768px) {
  .card-row-container > * {
    flex: 1 1 100%;
    width: 100%;
    max-width: 100%;
  }
}
</style>