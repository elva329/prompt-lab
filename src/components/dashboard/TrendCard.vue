<template>
  <article class="card border-0 shadow-sm dashboard-chart-card dashboard-card-trend">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 class="h6 mb-0 fw-semibold">Response Time Trend</h2>
        </div>
      </div>
      <div v-if="props.trendResponseData.length">
        <div :ref="setChartEl" class="dashboard-amchart dashboard-amchart-trend"></div>
      </div>
      <p v-else class="small text-secondary mb-0">No response time data yet.</p>
      <div v-if="props.trendResponseData.length" class="d-flex justify-content-center gap-4 mt-3 dashboard-trend-legend">
        <div class="d-flex align-items-center gap-2">
          <span class="dashboard-trend-legend-dot"></span>
          <span class="small text-secondary">Response Time (ms)</span>
        </div>
      </div>
    </div>
  </article>
</template>
<script setup lang="ts">
const props = defineProps({
  trendResponseData: {
    type: Array,
    required: true
  },
  onChartEl: {
    type: Function,
    required: true,
  },
});
const setChartEl: any = (el: any) => {
  props.onChartEl((el as HTMLElement) ?? null);
};
</script>
