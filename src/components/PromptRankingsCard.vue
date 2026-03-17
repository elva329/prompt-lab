<template>
  <div class="prompt-rankings-card">
    <div class="rankings-header">
      <span class="rankings-dot"></span>
      <span class="rankings-title">Prompt Rankings</span>
    </div>
    
    <div class="rankings-body">
      <div v-if="loading" class="loading-state">Loading...</div>
      <div v-else-if="!topPerformers.length && !needsAttention.length" class="empty-state">No data available.</div>
      <div v-else class="rankings-content">
        
        <div class="ranking-section" v-if="topPerformers.length > 0">
          <div class="section-title">TOP PERFORMERS</div>
          <div v-for="item in topPerformers" :key="item.id" class="ranking-row">
            <div class="row-header">
              <span class="prompt-label">{{ item.label }}</span>
              <span class="prompt-value">{{ item.score }}</span>
            </div>
            <div class="bar-container">
              <div class="bar-fill top" :style="{ width: item.score + '%' }"></div>
            </div>
          </div>
        </div>

        <div class="ranking-section" v-if="needsAttention.length > 0">
          <div class="section-title attention">NEEDS ATTENTION</div>
          <div v-for="item in needsAttention" :key="item.id" class="ranking-row">
            <div class="row-header">
              <span class="prompt-label">{{ item.label }}</span>
              <span class="prompt-value">{{ item.score }}</span>
            </div>
            <div class="bar-container">
              <div class="bar-fill attention" :style="{ width: item.score + '%' }"></div>
            </div>
          </div>
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
      loading: true,
    };
  },
  async mounted() {
    this.loading = true;
    try {
      const userId = appStore.state.user?.id;
      if (!userId) throw new Error('User not logged in');

      const results = await fetchResultsByUserRequest(userId);

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
          promptLabel: `Prompt ${promptId}`,
          label: `Prompt ${promptId}`,
          score: parseFloat(avg.toFixed(1)),
        };
      }).sort((a, b) => b.score - a.score); // Rank from high to low

      // Needs Attention: Score < 60 (Sorted worst first)
      this.needsAttention = processedData
        .filter(item => item.score < 60)
        .sort((a, b) => a.score - b.score);

      // Top Performers: Score >= 60 (Sorted best first)
      this.topPerformers = processedData
        .filter(item => item.score >= 60)
        .sort((a, b) => b.score - a.score);

      this.loading = false;
    } catch (e) {
      console.error("Failed to fetch prompt rankings:", e);
      this.topPerformers = [];
      this.needsAttention = [];
      this.loading = false;
    }
  },
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
  gap: 0.5rem;
  font-family: 'Inter', sans-serif;
}
.rankings-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.rankings-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #a78bfa;
  display: inline-block;
}
.rankings-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #687083;
  font-family: 'Sora', sans-serif;
}
.rankings-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  overflow-y: auto; /* Allow scrolling if list is long */
}
.loading-state, .empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 0.9rem;
  flex: 1;
}
.rankings-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 0.5rem;
}
.section-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #10b981; /* Green for Top Performers */
  margin-bottom: 0.75rem;
  letter-spacing: 0.05em;
}
.section-title.attention {
  color: #ef4444; /* Red for Needs Attention */
}
.ranking-row {
  margin-bottom: 0.75rem;
}
.row-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}
.bar-container {
  width: 100%;
  height: 6px;
  background-color: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  background-color: #10b981;
  border-radius: 3px;
}
.bar-fill.attention {
  background-color: #ef4444;
}
</style>
