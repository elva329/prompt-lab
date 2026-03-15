<template>
  <div class="quality-summary-card">
    <div class="summary-header">
      <span class="summary-dot"></span>
      <span class="summary-title">Quality Summary</span>
    </div>
    <div class="summary-subtitle">Pass rate & dimension scores</div>
    <div class="summary-main">
      <div class="summary-donut">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="32" fill="none" stroke="#2563eb" stroke-width="12" stroke-dasharray="71.2 100" stroke-dashoffset="0" />
          <circle cx="40" cy="40" r="32" fill="none" stroke="#fbbf24" stroke-width="12" stroke-dasharray="16.1 100" stroke-dashoffset="71.2" />
          <circle cx="40" cy="40" r="32" fill="none" stroke="#f87171" stroke-width="12" stroke-dasharray="12.7 100" stroke-dashoffset="87.3" />
        </svg>
        <div class="donut-legend">
          <div class="legend-row"><span class="legend-dot pass"></span>Pass ≥60 <span class="legend-value">71%</span></div>
          <div class="legend-row"><span class="legend-dot borderline"></span>Borderline <span class="legend-value">16%</span></div>
          <div class="legend-row"><span class="legend-dot fail"></span>Fail &lt;50 <span class="legend-value">13%</span></div>
        </div>
      </div>
      <div class="summary-scores">
        <div class="scores-title">AVG. DIMENSION SCORES</div>
        <div class="score-row"><span class="score-label">Clarity</span><span class="score-bar clarity"></span><span class="score-value">72</span></div>
        <div class="score-row"><span class="score-label">Coherence</span><span class="score-bar coherence"></span><span class="score-value">69</span></div>
        <div class="score-row"><span class="score-label">Overall</span><span class="score-bar overall"></span><span class="score-value">67</span></div>
        <div class="score-row"><span class="score-label">Completeness</span><span class="score-bar completeness"></span><span class="score-value">61</span></div>
        <div class="score-row"><span class="score-label">Relevance</span><span class="score-bar relevance"></span><span class="score-value">58</span></div>
      </div>
    </div>
    <div class="summary-warning">
      <span class="warning-icon">⚠️</span> <span class="warning-text">Relevance is the weakest — 14pt below Clarity</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QualitySummaryCard'
};
</script>

<style scoped>
.quality-summary-card {
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
.summary-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Inter', sans-serif;
}
.summary-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #a78bfa;
  display: inline-block;
}
.summary-title {
  font-size: 1rem;
  font-weight: 800;
  color: #334155;
}
.summary-subtitle {
  color: #a0aec0;
  font-size: 0.75rem;
  font-weight: 500;
}
.summary-main {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}
.summary-donut {
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
.legend-dot.pass { background: #2563eb; }
.legend-dot.borderline { background: #fbbf24; }
.legend-dot.fail { background: #f87171; }
.legend-value {
  font-weight: 700;
  margin-left: 0.5rem;
  color: #334155;
}
.summary-scores {
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
.score-bar.clarity::before {
  content: '';
  display: block;
  height: 8px;
  width: 72%;
  background: #2563eb;
  border-radius: 6px;
  position: absolute;
}
.score-bar.coherence::before {
  content: '';
  display: block;
  height: 8px;
  width: 69%;
  background: #a78bfa;
  border-radius: 6px;
  position: absolute;
}
.score-bar.overall::before {
  content: '';
  display: block;
  height: 8px;
  width: 67%;
  background: #38bdf8;
  border-radius: 6px;
  position: absolute;
}
.score-bar.completeness::before {
  content: '';
  display: block;
  height: 8px;
  width: 61%;
  background: #14b8a6;
  border-radius: 6px;
  position: absolute;
}
.score-bar.relevance::before {
  content: '';
  display: block;
  height: 8px;
  width: 58%;
  background: #fbbf24;
  border-radius: 6px;
  position: absolute;
}
.score-value {
  font-size: 1rem;
  font-weight: 700;
  color: #334155;
  width: 32px;
  text-align: right;
}
.summary-warning {
  color: #fbbf24;
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
  color: #fbbf24;
}
</style>
