<template>
  <article class="card border-0 shadow-sm dashboard-chart-only-card dashboard-card-relevance">
    <div class="card-body">
      <h3 class="small mb-1 fw-semibold">Relevance</h3>
      <div v-if="props.relevanceBestByCategoryData.length">
        <div :ref="setChartEl" class="dashboard-amchart dashboard-amchart-plain"></div>
      </div>
      <p v-else class="small text-secondary mb-0">No relevance data yet.</p>
    </div>
  </article>
</template>
<script setup lang="ts">
const props = defineProps({
  relevanceBestByCategoryData: {
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
