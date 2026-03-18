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
        
        <div class="ranking-section" v-if="topPerformers.length > 0">
          <div class="section-title">TOP 3 PERFORMERS</div>
          <div id="topPerformersChart" class="ranking-chart-container" :style="{ height: (topPerformers.length * 40 + 40) + 'px' }"></div>
        </div>

        <div class="ranking-section" v-if="needsAttention.length > 0">
          <div class="section-title attention">TOP 3 NEEDS ATTENTION</div>
          <div id="needsAttentionChart" class="ranking-chart-container" :style="{ height: (needsAttention.length * 40 + 40) + 'px' }"></div>
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
.section-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: #10b981; /* Green for Top Performers */
  margin-bottom: 0.5rem; /* Reduced from 0.75rem */
  letter-spacing: 0.05em;
}
.section-title.attention {
  color: #ef4444; /* Red for Needs Attention */
}
.ranking-section {

  overflow: visible; /* Ensure bullets don't get clipped */
}
.ranking-chart-container {
  width: 100%;
  margin-bottom: 0.5rem;
}
</style>
