<template>
  <div class="card text-center shadow-sm">
    <div class="card-body">
      <h5 class="card-title">Metric Title</h5>
      <p class="card-text display-6">123</p>
      <span class="badge bg-primary">Sample Badge</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnalyticsMetricCard',
};
</script>

<style scoped>
.card {
  border-radius: 1rem;
}
.display-6 {
  font-size: 2rem;
  font-weight: bold;
}
</style>
