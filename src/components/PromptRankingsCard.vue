<template>
  <div class="ui-card">
    <div class="card-header-row">
      <div class="card-header">
        <span class="card-dot"></span>
        <span class="card-title">Prompt Rankings</span>
      </div>
      <div class="run-counter">{{ totalRuns }} runs</div>
    </div>
    
    <div class="card-body">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner" style="width: 40px; height: 40px;"></div>
        <p class="loading-text" style="font-size: 0.85rem; margin: 0;">Loading</p>
      </div>
      <div v-else-if="!topPerformers.length && !needsAttention.length" class="empty-state">No data available.</div>
      <div v-else class="card-content">
        
        <div class="ranking-row">
          <div class="ranking-section" v-if="topPerformers.length > 0">
            <div class="section-header top">
              <span class="icon">🏆</span>
              <span class="header-label">TOP PERFORMERS</span>
            </div>
            <ul class="ranking-list">
              <li v-for="(item, idx) in topPerformers" :key="item.id" class="ranking-item">
                <span class="rank-circle top">{{ idx + 1 }}</span>
                <span class="prompt-name">{{ item.label }}</span>
                <span class="score-bar top" :style="{ width: item.score + '%'}"></span>
                <span class="score-value top">{{ item.score }}</span>
              </li>
            </ul>
          </div>
          <div class="ranking-section" v-if="needsAttention.length > 0">
            <div class="section-header attention">
              <span class="icon">⚠️</span>
              <span class="header-label">NEEDS ATTENTION</span>
            </div>
            <ul class="ranking-list">
              <li v-for="(item, idx) in needsAttention" :key="item.id" class="ranking-item">
                <span class="rank-circle attention">{{ idx + 1 }}</span>
                <span class="prompt-name">{{ item.label }}</span>
                <span class="score-bar attention" :style="{ width: item.score + '%'}"></span>
                <span class="score-value attention">{{ item.score }}</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="ranking-footer">
          Ranked by overall quality score · 5 best & 5 worst shown
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { fetchResultsByUserRequest } from '../lib/resultsApi';
import { appStore } from '../stores/appStore';

export default {
  name: 'PromptRankingsCard',
  data() {
    return {
      topPerformers: [],
      needsAttention: [],
      totalRuns: 0,
      loading: true,
    };
  },
  async mounted() {
    this.loading = true;
    try {
      const userId = appStore.state.user?.id;
      if (!userId) {
        this.topPerformers = [];
        this.needsAttention = [];
        this.totalRuns = 0;
        this.loading = false;
        return;
      }

      const results = await fetchResultsByUserRequest();
      this.totalRuns = results.length;

      if (results.length === 0) {
        this.loading = false;
        return;
      }

      const grouped = {};
      results.forEach(r => {
        if (!grouped[r.promptId]) grouped[r.promptId] = [];
        if (typeof r.overallQuality === 'number') grouped[r.promptId].push(r.overallQuality);
      });

      const processedData = Object.entries(grouped).map(([promptId, scores]) => {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        return {
          id: promptId,
          score: Math.round(avg),
        };
      }).sort((a, b) => b.score - a.score);

      // Top Performers: Score >= 60 (Sorted best first), Limit to top 5
      this.topPerformers = processedData
        .filter(item => item.score >= 60)
        .slice(0, 5)
        .map((item, index) => ({ ...item, label: `Prompt ${item.id}` }));

      // Needs Attention: Score < 60 (Sorted worst first), Limit to top 5
      this.needsAttention = processedData
        .filter(item => item.score < 60)
        .sort((a, b) => a.score - b.score)
        .slice(0, 5)
        .map((item, index) => ({ ...item, label: `Prompt ${item.id}` }));

      this.loading = false;
    } catch (e) {
      if (e instanceof Error && e.message === 'User not logged in') {
        this.topPerformers = [];
        this.needsAttention = [];
        this.totalRuns = 0;
        this.loading = false;
        return;
      }
      console.error("Failed to fetch prompt rankings:", e);
      this.topPerformers = [];
      this.needsAttention = [];
      this.totalRuns = 0;
      this.loading = false;
    }
  }
};
</script>

<style scoped>

.ui-card {
  background: rgba(255, 255, 255, 0.75);
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(16, 35, 63, 0.08);
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-family: 'Manrope', sans-serif;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  max-width: 100%;
  box-sizing: border-box;
}

.ui-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 12px 24px rgba(16, 35, 63, 0.12);
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #1b5e55;
  display: inline-block;
}

.card-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #10233f;
  letter-spacing: -0.01em;
}

.run-counter {
  font-size: 0.85rem;
  font-weight: 600;
  color: #a0aec0;
  background: rgba(226, 232, 240, 0.5);
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: visible;
}

.loading-state, .empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 0.9rem;
  flex: 1;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

/* Section header styles */
.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  letter-spacing: 0.05em;
}

.section-header.top {
  color: #1b5e55;
}

.section-header.attention {
  color: #dc2626;
}

.icon {
  font-size: 1.1rem;
}

.header-label {
  background: #ecf9f7;
  border-radius: 4px;
  padding: 0.2rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #1b5e55;
}

.section-header.attention .header-label {
  background: #fce4e6;
  color: #dc2626;
}

/* Ranking list styles */
.ranking-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 0.97rem;
  font-family: 'Manrope', sans-serif;
  min-height: 32px;
}

.rank-circle {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
  background: #ecf9f7;
  color: #1b5e55;
  margin-right: 2px;
}

.prompt-name {
  flex: 1 1 120px;
  font-weight: 600;
  color: #475569;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.score-bar {
  flex: 2 1 80px;
  height: 8px;
  border-radius: 4px;
  background: #d1fae5;
  min-width: 60px;
  margin: 0 8px;
}

.score-value {
  font-weight: 700;
  font-size: 1rem;
  min-width: 32px;
  text-align: right;
  flex-shrink: 0;
  margin-left: 2px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.92rem;
  font-weight: 700;
  margin-bottom: 0.85rem;
  letter-spacing: 0.05em;
}

.ranking-footer {
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(226, 232, 240, 0.6);
  font-size: 0.72rem;
  font-weight: 600;
  color: #94a3b8;
  text-align: center;
  font-family: 'Manrope', sans-serif;
}

@media (max-width: 768px) {
  .ranking-row {
    flex-direction: column;
    gap: 1.5rem;
  }
  .ranking-list {
    gap: 0.7rem;
  }
  .ranking-item {
    flex-wrap: wrap;
    font-size: 0.97rem;
    padding: 0.12rem 0;
    min-height: 28px;
  }
  .prompt-name {
    flex: 1 1 100%;
    min-width: 0;
    max-width: 100%;
    font-size: 0.97rem;
    margin-bottom: 2px;
  }
  .score-bar {
    min-width: 40px;
    height: 9px;
    margin: 2px 0 2px 8px;
  }
  .rank-circle {
    width: 24px;
    height: 24px;
    font-size: 0.97rem;
    margin-right: 4px;
  }
  .score-value {
    min-width: 26px;
    font-size: 0.97rem;
    margin-left: 4px;
  }
  .run-counter {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
  .ui-card {
    padding: 0.7rem;
  }
}
</style>
