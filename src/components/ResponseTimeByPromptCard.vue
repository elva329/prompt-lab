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
          <circle cx="40" cy="40" r="32" fill="none" stroke="#f1f5f9" stroke-width="12" />
          <circle cx="40" cy="40" r="32" fill="none" stroke="#f87171" stroke-width="12" 
                  :stroke-dasharray="`${slowPercent} 100`" 
                  pathLength="100" transform="rotate(-90 40 40)" />
          <circle cx="40" cy="40" r="32" fill="none" stroke="#fbbf24" stroke-width="12" 
                  :stroke-dasharray="`${mediumPercent} 100`" 
                  :stroke-dashoffset="-slowPercent" 
                  pathLength="100" transform="rotate(-90 40 40)" />
          <circle cx="40" cy="40" r="32" fill="none" stroke="#38bdf8" stroke-width="12" 
                  :stroke-dasharray="`${fastPercent} 100`" 
                  :stroke-dashoffset="-(slowPercent + mediumPercent)" 
                  pathLength="100" transform="rotate(-90 40 40)" />
        </svg>
        <div class="donut-legend">
          <div class="legend-row"><span class="legend-dot fast"></span>Fast <span class="legend-value">{{ fastPercent }}%</span></div>
          <div class="legend-row"><span class="legend-dot medium"></span>Medium <span class="legend-value">{{ mediumPercent }}%</span></div>
          <div class="legend-row"><span class="legend-dot slow"></span>Slow <span class="legend-value">{{ slowPercent }}%</span></div>
        </div>
      </div>
      <div class="response-scores">
        <div class="scores-title">AVG. RESPONSE TIMES</div>
        <div v-if="loading" class="loading-state">Loading...</div>
        <div v-else-if="!avgTimes.length" class="empty-state">No data available.</div>
        <div v-else>
          <div v-for="item in sortedAvgTimes" :key="item.promptId" class="score-row">
            <span class="score-label">{{ getPromptTitle(item.promptId) }}</span>
            <div class="score-bar-wrapper">
              <div class="score-bar" :class="getSpeedClass(item.avg)" :style="{ width: calcBarWidth(item.avg) }"></div>
            </div>
            <span class="score-value">{{ item.avg.toFixed(1) }}s</span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="warningMessage" class="response-warning">
      <span class="warning-icon">⚠️</span> <span class="warning-text">{{ warningMessage }}</span>
    </div>
  </div>
</template>

<script>
import { fetchResultsByUserRequest } from '../lib/resultsApi';
import { appStore } from '../stores/appStore';

export default {
  name: 'ResponseTimeByPromptCard',
  data() {
    return {
      avgTimes: [],
      loading: true,
      warningMessage: '',
      fastCount: 0,
      mediumCount: 0,
      slowCount: 0,
      totalRuns: 0,
    };
  },
  computed: {
    sortedAvgTimes() {
      return [...this.avgTimes].sort((a, b) => a.avg - b.avg);
    },
    totalPrompts() {
      return this.avgTimes.length;
    },
    fastPercent() {
      if (this.totalPrompts === 0) return 0;
      return Math.round((this.fastCount / this.totalPrompts) * 100);
    },
    mediumPercent() {
      if (this.totalPrompts === 0) return 0;
      return Math.round((this.mediumCount / this.totalPrompts) * 100);
    },
    slowPercent() {
      if (this.totalPrompts === 0) return 0;
      return 100 - this.fastPercent - this.mediumPercent;
    }
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
        if (typeof r.responseTimeMs === 'number') grouped[r.promptId].push(r.responseTimeMs);
      });

      const avgTimesData = Object.entries(grouped).map(([promptId, times]) => {
        if (times.length === 0) return { promptId, avg: 0, count: 0 };
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        return {
          promptId,
          avg: avg / 1000, // ms to s
          count: times.length
        };
      }).filter(item => item.count > 0);

      this.avgTimes = avgTimesData;
      this.totalRuns = results.length;

      // Calculate distribution
      let fast = 0, medium = 0, slow = 0;
      avgTimesData.forEach(item => {
        if (item.avg <= 1.5) fast++;
        else if (item.avg <= 3) medium++;
        else slow++;
      });
      this.fastCount = fast;
      this.mediumCount = medium;
      this.slowCount = slow;

      // Generate warning message
      if (avgTimesData.length > 1) {
        const sorted = [...avgTimesData].sort((a, b) => a.avg - b.avg);
        const fastest = sorted[0];
        const slowest = sorted[sorted.length - 1];
        const diff = slowest.avg - fastest.avg;
        if (diff > 0.5) {
          const slowestTitle = this.getPromptTitle(slowest.promptId);
          const fastestTitle = this.getPromptTitle(fastest.promptId);
          this.warningMessage = `Prompt ${slowestTitle} is the slowest — ${diff.toFixed(1)}s slower than Prompt ${fastestTitle}`;
        }
      }
    } catch (e) {
      console.error("Failed to fetch response times:", e);
      this.avgTimes = [];
    }
    this.loading = false;
  },
  methods: {
    getPromptTitle(promptId) {
      // Per user request, display the promptId directly instead of resolving to a title from the prompts library.
      // This ensures the data shown directly reflects the 'results' collection from the database.
      return promptId;
    },
    getSpeedClass(avg) {
      if (avg <= 1.5) return 'fast';
      if (avg <= 3) return 'medium';
      return 'slow';
    },
    calcBarWidth(avg) {
      const max = this.avgTimes.length ? Math.max(...this.avgTimes.map(a => a.avg)) : 1;
      if (max === 0) return '0%';
      const percent = (avg / max) * 100;
      return Math.max(5, percent) + '%';
    }
  }
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
  gap: 0.5rem;
  font-family: 'Inter', sans-serif;
}
.response-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.response-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #38bdf8;
  display: inline-block;
}
.response-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #687083;
  font-family: 'Sora', sans-serif;
}
.response-subtitle {
  color: #a0aec0;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}
.response-main {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  flex: 1;
}
.response-donut {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}
.donut-legend {
  margin-top: 1rem;
  font-size: 0.85rem;
  width: 100%;
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
}
.legend-dot.fast { background: #38bdf8; }
.legend-dot.medium { background: #fbbf24; }
.legend-dot.slow { background: #f87171; }
.legend-value {
  font-weight: 700;
  margin-left: auto;
  color: #334155;
}
.response-scores {
  flex: 1;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.scores-title {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.loading-state, .empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
  font-size: 0.9rem;
}
.score-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.score-label {
  width: 100px;
  color: #334155;
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.score-bar-wrapper {
  flex: 1;
  height: 8px;
  background: #f1f5f9;
  border-radius: 6px;
  overflow: hidden;
}
.score-bar {
  height: 100%;
  border-radius: 6px;
  transition: width 0.3s ease-in-out;
}
.score-bar.fast { background: #38bdf8; }
.score-bar.medium { background: #fbbf24; }
.score-bar.slow { background: #f87171; }
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
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}
.warning-icon {
  font-size: 1.1rem;
}
.warning-text {
  color: #f87171;
}
</style>
