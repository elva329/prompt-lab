<template>
  <div class="prompt-rankings-card">
    <div class="rankings-header">
      <span class="rankings-dot"></span>
      <span class="rankings-title">Prompt Rankings</span>
    </div>
    <div class="rankings-section">
      <div class="rankings-subtitle top"><span class="rankings-trophy">🏆</span> TOP PERFORMERS</div>
      <div class="rank-row top">
        <span class="rank-num top">1</span>
        <span class="rank-label">Essay Writer</span>
        <span class="rank-bar top"></span>
        <span class="rank-score top">88</span>
      </div>
      <div class="rank-row top">
        <span class="rank-num top">2</span>
        <span class="rank-label">Travel Guide</span>
        <span class="rank-bar top"></span>
        <span class="rank-score top">85</span>
      </div>
      <div class="rank-row top">
        <span class="rank-num blue">3</span>
        <span class="rank-label">Film Critic</span>
        <span class="rank-bar blue"></span>
        <span class="rank-score blue">82</span>
      </div>
      <div class="rank-row blue">
        <span class="rank-num blue">4</span>
        <span class="rank-label">Proofreader</span>
        <span class="rank-bar blue"></span>
        <span class="rank-score blue">82</span>
      </div>
      <div class="rank-row blue">
        <span class="rank-num blue">5</span>
        <span class="rank-label">Movie Critic</span>
        <span class="rank-bar blue"></span>
        <span class="rank-score blue">80</span>
      </div>
    </div>
    <hr class="rankings-divider" />
    <div class="rankings-section">
      <div class="rankings-subtitle attention"><span class="rankings-warning">⚠️</span> NEEDS ATTENTION</div>
      <div class="rank-row attention">
        <span class="rank-num attention">1</span>
        <span class="rank-label">Unconstrained DAN</span>
        <span class="rank-bar attention"></span>
        <span class="rank-score attention">45</span>
      </div>
      <div class="rank-row attention">
        <span class="rank-num attention">2</span>
        <span class="rank-label">AI Escaping Box</span>
        <span class="rank-bar attention"></span>
        <span class="rank-score attention">47</span>
      </div>
      <div class="rank-row yellow">
        <span class="rank-num yellow">3</span>
        <span class="rank-label">Linux Terminal</span>
        <span class="rank-bar yellow"></span>
        <span class="rank-score yellow">53</span>
      </div>
      <div class="rank-row yellow">
        <span class="rank-num yellow">4</span>
        <span class="rank-label">Drunk Person</span>
        <span class="rank-bar yellow"></span>
        <span class="rank-score yellow">55</span>
      </div>
    </div>
    <div class="rankings-footer">Based on overall quality score across all 153 runs</div>
  </div>
</template>

<script>
export default {
  name: 'PromptRankingsCard'
};
</script>

<style scoped>
.prompt-rankings-card {
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
.rankings-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Inter', sans-serif;
}
.rankings-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #a0aec0;
  display: inline-block;
}
.rankings-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #687083;
  font-family: 'Sora', sans-serif;
}
.rankings-section {
  margin-bottom: 0.5rem;
}
.rankings-subtitle.top {
  color: #10b981;
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.rankings-trophy {
  font-size: 1.1rem;
}
.rank-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.3rem;
}
.rank-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f3f4f6;
  color: #10b981;
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.rank-num.top { background: #d1fae5; color: #10b981; }
.rank-num.blue { background: #dbeafe; color: #2563eb; }
.rank-num.attention { background: #fee2e2; color: #f87171; }
.rank-num.yellow { background: #fef9c3; color: #fbbf24; }
.rank-label {
  width: 140px;
  color: #334155;
  font-size: 0.95rem;
  font-weight: 600;
}
.rank-bar {
  height: 8px;
  border-radius: 6px;
  background: #e5e7eb;
  flex: 1;
  position: relative;
}
.rank-bar.top::before {
  content: '';
  display: block;
  height: 8px;
  width: 88%;
  background: #10b981;
  border-radius: 6px;
  position: absolute;
}
.rank-bar.top:nth-of-type(2)::before { width: 85%; }
.rank-bar.blue::before {
  content: '';
  display: block;
  height: 8px;
  width: 82%;
  background: #2563eb;
  border-radius: 6px;
  position: absolute;
}
.rank-bar.blue:nth-of-type(2)::before { width: 80%; }
.rank-bar.attention::before {
  content: '';
  display: block;
  height: 8px;
  width: 45%;
  background: #f87171;
  border-radius: 6px;
  position: absolute;
}
.rank-bar.attention:nth-of-type(2)::before { width: 47%; }
.rank-bar.yellow::before {
  content: '';
  display: block;
  height: 8px;
  width: 53%;
  background: #fbbf24;
  border-radius: 6px;
  position: absolute;
}
.rank-bar.yellow:nth-of-type(2)::before { width: 55%; }
.rank-score {
  font-size: 1rem;
  font-weight: 700;
  color: #10b981;
  width: 32px;
  text-align: right;
}
.rank-score.blue { color: #2563eb; }
.rank-score.attention { color: #f87171; }
.rank-score.yellow { color: #fbbf24; }
.rankings-divider {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 0.5rem 0;
}
.rankings-subtitle.attention {
  color: #f87171;
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.rankings-warning {
  font-size: 1.1rem;
}
.rankings-footer {
  color: #a0aec0;
  font-size: 0.85rem;
  font-weight: 500;
}
</style>
