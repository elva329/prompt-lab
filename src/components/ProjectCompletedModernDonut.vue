<template>
  <article class="pcm-card">
    <header class="pcm-header">
      <h3 class="pcm-title">Project Completed</h3>
      <span class="pcm-total">Total project 100</span>
    </header>

    <div class="pcm-body">
      <div class="pcm-metrics">
        <div class="pcm-metric">
          <div class="pcm-metric-label">
            <span class="pcm-dot pcm-dot-done"></span>
            <span>Project Done</span>
          </div>
          <div class="pcm-metric-value">50%</div>
        </div>

        <div class="pcm-metric">
          <div class="pcm-metric-label">
            <span class="pcm-dot pcm-dot-progress"></span>
            <span>In Progress</span>
          </div>
          <div class="pcm-metric-value">25%</div>
        </div>

        <div class="pcm-metric">
          <div class="pcm-metric-label">
            <span class="pcm-dot pcm-dot-backlog"></span>
            <span>Backlog</span>
          </div>
          <div class="pcm-metric-value">15%</div>
        </div>
      </div>

      <div class="pcm-ring-wrap" aria-hidden="true">
        <svg class="pcm-ring" viewBox="0 0 240 240">
          <!-- Background rings -->
          <circle class="pcm-ring-bg" cx="120" cy="120" r="92" />
          <circle class="pcm-ring-bg" cx="120" cy="120" r="66" />
          <circle class="pcm-ring-bg" cx="120" cy="120" r="40" />

          <!-- Project Done (outer ring) -->
          <circle class="pcm-ring-done" cx="120" cy="120" r="92" pathLength="100" />
          <!-- In Progress (middle ring) -->
          <circle class="pcm-ring-progress" cx="120" cy="120" r="66" pathLength="100" />
          <!-- Backlog (inner ring) -->
          <circle class="pcm-ring-backlog" cx="120" cy="120" r="40" pathLength="100" />
        </svg>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
// Purely presentational
</script>

<style scoped>
.pcm-card {
  background: linear-gradient(180deg, rgba(241, 248, 255, 0.95), rgba(236, 244, 255, 0.9));
  border: 1px solid rgba(226, 233, 245, 0.95);
  border-radius: 18px;
  box-shadow: 0 10px 24px rgba(24, 33, 58, 0.08);
  padding: 1rem 1.05rem;
  width: 100%;
}

.pcm-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.8rem;
}

.pcm-title {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 800;
  color: #1c2333;
}

.pcm-total {
  color: rgba(104, 112, 131, 0.95);
  font-size: 0.74rem;
  white-space: nowrap;
}

.pcm-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.pcm-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  min-width: 150px;
}

.pcm-metric {
  display: grid;
  gap: 0.35rem;
}

.pcm-metric-label {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: #232b3b;
}

.pcm-metric-value {
  font-size: 1.35rem;
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #1c2333;
  padding-left: 1.6rem;
}

.pcm-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}
.pcm-dot-done {
  background: #1b5e55; /* teal */
}
.pcm-dot-progress {
  background: #ff8a65; /* orange */
}
.pcm-dot-backlog {
  background: #4f8cff; /* blue */
}

.pcm-ring-wrap {
  width: 520px;
  max-width: 82vw;
  aspect-ratio: 1 / 1;
  display: grid;
  place-items: center;
}

.pcm-ring {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.pcm-ring-bg {
  fill: none;
  stroke: rgba(215, 224, 243, 0.65);
  stroke-width: 22;
}

.pcm-ring-done,
.pcm-ring-progress,
.pcm-ring-backlog {
  fill: none;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: 120px 120px;
  stroke-dasharray: 100 100;
}

.pcm-ring-done {
  stroke: #1b5e55;
  stroke-width: 22;
  stroke-dashoffset: 50; /* 50% done */
}

.pcm-ring-progress {
  stroke: #ff8a65;
  stroke-width: 22;
  stroke-dashoffset: 75; /* 25% visible */
}

.pcm-ring-backlog {
  stroke: #4f8cff;
  stroke-width: 16;
  stroke-dashoffset: 85; /* 15% visible */
}

@media (max-width: 420px) {
  .pcm-body {
    flex-direction: column;
    align-items: stretch;
  }

  .pcm-ring-wrap {
    max-width: 100%;
    width: 100%;
  }
}
</style>
