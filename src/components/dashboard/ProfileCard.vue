<template>
  <article class="card border-0 shadow-sm dashboard-profile-card dashboard-profile-highlight dashboard-card-primary">
    <div class="card-body text-center d-flex flex-column justify-content-center">
      <div class="dashboard-avatar-ring mx-auto mb-2">
        <i class="bi bi-graph-up"></i>
      </div>
      <h5 class="mb-1">Avg Quality Score</h5>
      <h3 class="fw-semibold mb-2">{{ avgQualityDisplay }}</h3>
      <p class="small text-secondary mb-0">Overall response quality</p>
    </div>
  </article>
</template>
<script setup lang="ts">
const props = defineProps<{ avgQualityDisplay: string }>();
</script>
