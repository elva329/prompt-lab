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
          <div class="section-title">TOP PERFORMERS</div>
          <div v-for="item in topPerformers" :key="item.id" class="ranking-row">
            <div class="row-header">
              <span class="prompt-label">{{ item.label }}</span>
              <span class="prompt-value">{{ item.score }}</span>
            </div>
            <div class="bar-container">
              <div :id="'chart-' + item.id" class="chart-div"></div>
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
              <div :id="'chart-' + item.id" class="chart-div"></div>
            </div>
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

      this.topPerformers.forEach(item => {
        this.createBarChart(`chart-${item.id}`, item.score, 0x10b981); // Green
      });

      this.needsAttention.forEach(item => {
        this.createBarChart(`chart-${item.id}`, item.score, 0xef4444); // Red
      });
    },
    createBarChart(divId, value, colorHex) {
      let root = am5.Root.new(divId);
      this.roots.push(root);

      root.setThemes([am5themes_Animated.new(root)]);

      let chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
        paddingBottom: 0,
        layout: root.verticalLayout
      }));

      let yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: am5xy.AxisRendererY.new(root, {
          minGridDistance: 10,
          inversed: true
        })
      }));
      yAxis.get("renderer").grid.template.set("forceHidden", true);
      yAxis.get("renderer").labels.template.set("forceHidden", true);
      yAxis.data.setAll([{ category: "1" }]);

      let xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
        min: 0,
        max: 100,
        strictMinMax: true,
        renderer: am5xy.AxisRendererX.new(root, {})
      }));
      xAxis.get("renderer").grid.template.set("forceHidden", true);
      xAxis.get("renderer").labels.template.set("forceHidden", true);

      let series = chart.series.push(am5xy.ColumnSeries.new(root, {
        xAxis: xAxis,
        yAxis: yAxis,
        valueXField: "value",
        categoryYField: "category",
        fill: am5.color(colorHex),
        stroke: am5.color(colorHex)
      }));

      series.columns.template.setAll({
        height: am5.percent(100),
        cornerRadiusBR: 3,
        cornerRadiusTR: 3,
        cornerRadiusBL: 3,
        cornerRadiusTL: 3,
        strokeOpacity: 0
      });

      series.data.setAll([{ category: "1", value: value }]);
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
  padding: 1.5rem;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
.card-content {
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
.chart-div {
  height: 100%;
  width: 100%;
}
</style>
