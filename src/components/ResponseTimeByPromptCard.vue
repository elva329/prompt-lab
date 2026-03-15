<template>
  <div class="response-time-card">
    <div class="response-header">
      <span class="response-dot"></span>
      <span class="response-title">Response Time by Prompt</span>
    </div>
    <div class="response-subtitle">Prompt speed & distribution</div>
    <div class="response-main">
      <div class="response-donut">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="32" fill="none" stroke="#38bdf8" stroke-width="12" stroke-dasharray="60 100" stroke-dashoffset="0" />
          <circle cx="40" cy="40" r="32" fill="none" stroke="#fbbf24" stroke-width="12" stroke-dasharray="25 100" stroke-dashoffset="60" />
          <circle cx="40" cy="40" r="32" fill="none" stroke="#f87171" stroke-width="12" stroke-dasharray="15 100" stroke-dashoffset="85" />
        </svg>
        <div class="donut-legend">
          <div class="legend-row"><span class="legend-dot fast"></span>Fast <span class="legend-value">60%</span></div>
          <div class="legend-row"><span class="legend-dot medium"></span>Medium <span class="legend-value">25%</span></div>
          <div class="legend-row"><span class="legend-dot slow"></span>Slow <span class="legend-value">15%</span></div>
        </div>
      </div>
      <div class="response-scores">
        <div class="scores-title">AVG. RESPONSE TIMES</div>
        <div class="score-row"><span class="score-label">Prompt A</span><span class="score-bar fast"></span><span class="score-value">1.2s</span></div>
        <div class="score-row"><span class="score-label">Prompt B</span><span class="score-bar medium"></span><span class="score-value">2.5s</span></div>
        <div class="score-row"><span class="score-label">Prompt C</span><span class="score-bar slow"></span><span class="score-value">4.1s</span></div>
        <div class="score-row"><span class="score-label">Prompt D</span><span class="score-bar fast"></span><span class="score-value">1.4s</span></div>
        <div class="score-row"><span class="score-label">Prompt E</span><span class="score-bar medium"></span><span class="score-value">2.8s</span></div>
      </div>
    </div>
    <div class="response-warning">
      <span class="warning-icon">⚠️</span> <span class="warning-text">Prompt C is the slowest — 2.9s slower than Prompt A</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResponseTimeByPromptCard'
};
</script>

<style scoped>
.response-time-card {
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  font-family: 'Inter', sans-serif;
}
.response-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Inter', sans-serif;
}
.response-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #38bdf8;
  display: inline-block;
}
.response-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #334155;
  font-family: 'Inter', sans-serif;
}
.response-subtitle {
  color: #a0aec0;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-family: 'Inter', sans-serif;
}
.response-main {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}
.response-donut {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}
.donut-legend {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  font-family: 'Inter', sans-serif;
}
.legend-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.2rem;
}
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.legend-dot.fast { background: #38bdf8; }
.legend-dot.medium { background: #fbbf24; }
.legend-dot.slow { background: #f87171; }
.legend-value {
  font-weight: 700;
  margin-left: 0.5rem;
  color: #334155;
}
.response-scores {
  flex: 1;
  min-width: 180px;
}
.scores-title {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.score-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.3rem;
}
.score-label {
  width: 100px;
  color: #334155;
  font-size: 0.95rem;
  font-weight: 600;
}
.score-bar {
  height: 8px;
  border-radius: 6px;
  background: #e5e7eb;
  flex: 1;
  position: relative;
}
.score-bar.fast::before {
  content: '';
  display: block;
  height: 8px;
  width: 60%;
  background: #38bdf8;
  border-radius: 6px;
  position: absolute;
}
.score-bar.medium::before {
  content: '';
  display: block;
  height: 8px;
  width: 25%;
  background: #fbbf24;
  border-radius: 6px;
  position: absolute;
}
.score-bar.slow::before {
  content: '';
  display: block;
  height: 8px;
  width: 15%;
  background: #f87171;
  border-radius: 6px;
  position: absolute;
}
.score-value {
  font-size: 1rem;
  font-weight: 700;
  color: #334155;
  width: 48px;
  text-align: right;
}
.response-warning {
  color: #f87171;
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.warning-icon {
  font-size: 1.1rem;
}
.warning-text {
  color: #f87171;
}
</style>
