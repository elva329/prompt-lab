<template>
  <div class="pc-card">
    <div class="pc-header">
      <span class="pc-title">Project Completed</span>
      <span class="pc-total">Total project 100</span>
    </div>
    <div class="pc-content">
      <div class="pc-donut-col">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <!-- Background ring -->
          <circle cx="70" cy="70" r="60" fill="none" stroke="#f1f5f9" stroke-width="16" />
          <!-- Project Done (blue) -->
          <circle
            cx="70" cy="70" r="60"
            fill="none"
            stroke="#4b6bff"
            stroke-width="16"
            stroke-dasharray="226.2 113.1"
            stroke-dashoffset="0"
            stroke-linecap="round"
          />
          <!-- In Progress (peach) -->
          <circle
            cx="70" cy="70" r="48"
            fill="none"
            stroke="#ffbfae"
            stroke-width="16"
            stroke-dasharray="75.4 150.8"
            stroke-dashoffset="-28"
            stroke-linecap="round"
          />
          <!-- Backlog (light blue) -->
          <circle
            cx="70" cy="70" r="36"
            fill="none"
            stroke="#e6edff"
            stroke-width="16"
            stroke-dasharray="33.9 67.8"
            stroke-dashoffset="-12"
            stroke-linecap="round"
          />
        </svg>
      </div>
      <div class="pc-legend-col">
        <div class="pc-legend-row">
          <span class="pc-dot pc-dot-done"></span>
          <span class="pc-legend-label">Project Done</span>
          <span class="pc-legend-value">50%</span>
        </div>
        <div class="pc-legend-row">
          <span class="pc-dot pc-dot-progress"></span>
          <span class="pc-legend-label">In Progress</span>
          <span class="pc-legend-value">25%</span>
        </div>
        <div class="pc-legend-row">
          <span class="pc-dot pc-dot-backlog"></span>
          <span class="pc-legend-label">Backlog</span>
          <span class="pc-legend-value">15%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Pure presentational component
</script>

<style scoped>
.pc-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px 0 rgba(30, 41, 59, 0.06);
  padding: 24px 28px 24px 28px;
  max-width: 410px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.pc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.pc-title {
  font-size: 1.18rem;
  font-weight: 700;
  color: #232b3b;
}
.pc-total {
  font-size: 1.05rem;
  color: #94a3b8;
  font-weight: 500;
}
.pc-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 32px;
}
.pc-donut-col {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
}
.pc-legend-col {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 140px;
}
.pc-legend-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}
.pc-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 10px;
}
.pc-dot-done {
  background: #4b6bff;
}
.pc-dot-progress {
  background: #ffbfae;
}
.pc-dot-backlog {
  background: #e6edff;
}
.pc-legend-label {
  font-size: 1rem;
  color: #232b3b;
  font-weight: 500;
  flex: 1 1 auto;
}
.pc-legend-value {
  font-size: 1.08rem;
  font-weight: 600;
  color: #232b3b;
  min-width: 38px;
  text-align: right;
}
</style>
