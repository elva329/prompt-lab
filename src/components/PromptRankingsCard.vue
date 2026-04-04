<template>
  <div class="ui-card">
    <div class="card-header">
      <span class="card-dot"></span>
      <span class="card-title">Prompt Rankings</span>
    </div>
    
    <div class="card-body">
      <div v-if="loading" class="loading-state">Loading...</div>
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
                <span class="prompt-name">{{ item.label.replace(/Prompt /, '') }}</span>
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
                <span class="prompt-name">{{ item.label.replace(/Prompt /, '') }}</span>
                <span class="score-bar attention" :style="{ width: item.score + '%'}"></span>
                <span class="score-value attention">{{ item.score }}</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { fetchResultsByUserRequest } from '../lib/resultsApi';
import { appStore } from '../stores/appStore';

export default {
  name: 'PromptRankingsCard',
  data() {
    return {
      topPerformers: [],
      needsAttention: [],
      loading: true,
      roots: [],
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
          score: parseFloat(avg.toFixed(1)),
        };
      }).sort((a, b) => b.score - a.score); // Rank from high to low

      // Needs Attention: Score < 60 (Sorted worst first), Limit to top 3
      this.needsAttention = processedData
        .filter(item => item.score < 60)
        .sort((a, b) => a.score - b.score)
        .slice(0, 3)
        .map((item, index) => ({ ...item, label: `#${index + 1} Prompt ${item.id}` }));

      // Top Performers: Score >= 60 (Sorted best first), Limit to top 3
      this.topPerformers = processedData
        .filter(item => item.score >= 60)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((item, index) => ({ ...item, label: `#${index + 1} Prompt ${item.id}` }));

      this.loading = false;

      this.$nextTick(() => {
        this.initCharts();
      });
    } catch (e) {
      console.error("Failed to fetch prompt rankings:", e);
      this.topPerformers = [];
      this.needsAttention = [];
      this.loading = false;
    }
  },
  beforeUnmount() {
    this.roots.forEach(root => root.dispose());
  },
  methods: {
    initCharts() {
      this.roots.forEach(root => root.dispose());
      this.roots = [];

      if (this.topPerformers.length > 0) {
        this.createRankingChart('topPerformersChart', this.topPerformers, 0x10b981);
      }

      if (this.needsAttention.length > 0) {
        this.createRankingChart('needsAttentionChart', this.needsAttention, 0xef4444);
      }
    },
    createRankingChart(divId, data, colorHex) {
      let root = am5.Root.new(divId);
      this.roots.push(root);

      root.setThemes([am5themes_Animated.new(root)]);

      let chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        paddingLeft: 5,
        paddingRight: 5,
        paddingTop: 15, // Increased to avoid clipping top labels
        paddingBottom: 25, // Increased to move logo away
        layout: root.verticalLayout
      }));

      let yRenderer = am5xy.AxisRendererY.new(root, {
        minGridDistance: 20,
        inversed: true,
        cellStartLocation: 0.2, // Move first bar down for its label
        cellEndLocation: 0.8
      });
      yRenderer.grid.template.set("visible", false);
      yRenderer.labels.template.set("visible", false);

      let yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: "label",
        renderer: yRenderer
      }));

      let xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
        min: 0,
        max: 100,
        strictMinMax: true,
        renderer: am5xy.AxisRendererX.new(root, {})
      }));
      xAxis.get("renderer").grid.template.set("visible", false);
      xAxis.get("renderer").labels.template.set("visible", false);

      let series = chart.series.push(am5xy.ColumnSeries.new(root, {
        xAxis: xAxis,
        yAxis: yAxis,
        valueXField: "score",
        categoryYField: "label",
        sequencedInterpolation: true
      }));

      series.columns.template.setAll({
        height: 6, // Restored to small height
        cornerRadiusBR: 3,
        cornerRadiusTR: 3,
        cornerRadiusBL: 3,
        cornerRadiusTL: 3,
        strokeOpacity: 0,
        fill: am5.color(colorHex)
      });

      // Label bullet (Above the bar, left aligned)
      series.bullets.push(function() {
        return am5.Bullet.new(root, {
          locationY: 0, 
          locationX: 0,
          sprite: am5.Label.new(root, {
            text: "{label}",
            fill: am5.color(0x334155),
            centerY: am5.p100,
            x: 0,
            dy: -2, // Slightly increased from -1
            populateText: true,
            fontSize: 11, 
            fontFamily: 'Manrope, sans-serif',
            fontWeight: "700"
          })
        });
      });

      // Score bullet (Above the bar, right aligned)
      series.bullets.push(function() {
        return am5.Bullet.new(root, {
          locationY: 0,
          locationX: 1,
          sprite: am5.Label.new(root, {
            text: "{score}",
            fill: am5.color(colorHex), 
            centerY: am5.p100,
            centerX: am5.p100,
            x: am5.p100,
            dy: -2, // Slightly increased from -1
            populateText: true,
            fontSize: 11, 
            fontFamily: 'Manrope, sans-serif',
            fontWeight: "800"
          })
        });
      });

      const chartData = data.map(item => ({
        ...item
      }));

      yAxis.data.setAll(chartData);
      series.data.setAll(chartData);
      series.appear(1000);
      chart.appear(1000, 100);
    }
  }
};
</script>

<style scoped>
.ui-card {
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 1rem 1.2rem; /* Reduced from 1.5rem */
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.25rem; /* Reduced from 0.5rem */
  font-family: 'Inter', sans-serif;
  transition: box-shadow 0.2s, transform 0.2s;
}
.ui-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
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
  background: #38bdf8; /* Standardized primary dot color */
  display: inline-block;
}
.card-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #687083;
  font-family: 'Sora', sans-serif;
}
.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  overflow: visible; /* Prevent vertical scrollbar */
  padding-bottom: 10px;
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
  gap: 1rem; /* Reduced from 1.5rem */
  margin-top: 0.25rem; /* Reduced from 0.5rem */
  padding-top: 2px;
}

/* Section header styles */
.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.section-header.top {
  color: #10b981;
}
.section-header.attention {
  color: #ef4444;
}
.icon {
  font-size: 1rem;
}
.header-label {
  background: #e0f7f3;
  border-radius: 0.3rem;
  padding: 0.1rem 0.5rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.section-header.attention .header-label {
  background: #ffe4e4;
}

/* Ranking list styles */
.ranking-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.ranking-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-family: 'Inter', sans-serif;
}
.rank-circle {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.85rem;
  background: #f0fdf4;
  color: #10b981;
}
.rank-circle.attention {
  background: #fff1f1;
  color: #ef4444;
}
.prompt-name {
  flex: 1;
  font-weight: 600;
  color: #334155;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.score-bar {
  height: 0.6rem;
  border-radius: 0.3rem;
  margin: 0 0.5rem;
  min-width: 2rem;
  max-width: 8rem;
  background: #d1fae5;
}
.score-bar.top {
  background: linear-gradient(90deg, #10b981 60%, #d1fae5 100%);
}
.score-bar.attention {
  background: linear-gradient(90deg, #ef4444 60%, #ffe4e4 100%);
}
.score-value {
  font-weight: 700;
  font-size: 0.85rem;
  margin-left: 0.2rem;
}
.score-value.top {
  color: #10b981;
}
.score-value.attention {
  color: #ef4444;
}

/* Add ranking-row for two-column layout */
.ranking-row {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}
.ranking-section {

  overflow: visible; /* Ensure bullets don't get clipped */
  flex: 1;
}
.ranking-chart-container {
  width: 100%;
  margin-bottom: 0.5rem;
}
</style>
