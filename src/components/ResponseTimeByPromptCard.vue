<template>
  <div class="response-time-card">
    <div class="response-header">
      <span class="response-dot"></span>
      <span class="response-title">Response Time by Prompt</span>
    </div>
    <div class="response-subtitle">Prompt speed & distribution</div>
    <div class="chart-container">
      <div v-if="loading" class="loading-state">Loading...</div>
      <div v-else-if="!avgTimes.length" class="empty-state">No data available.</div>
      <div v-else id="responseTimeChart" style="width: 100%; height: 250px;"></div>
    </div>
  </div>
</template>

<script>
import { fetchResultsByUserRequest } from '../lib/resultsApi';
import { appStore } from '../stores/appStore';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

export default {
  name: 'ResponseTimeByPromptCard',
  data() {
    return {
      avgTimes: [],
      loading: true,
      _am5Root: null,
    };
  },
  computed: {
    sortedAvgTimes() {
      return [...this.avgTimes].sort((a, b) => a.avg - b.avg);
    },
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
          promptIdLabel: `Prompt ${promptId}`,
          avg: avg / 1000, // ms to s
          count: times.length
        };
      }).filter(item => item.count > 0);

      this.avgTimes = avgTimesData;

      this.loading = false;
      this.$nextTick(() => {
        if (this.avgTimes.length > 0) {
          this.createChart();
        }
      });
    } catch (e) {
      console.error("Failed to fetch response times:", e);
      this.avgTimes = [];
      this.loading = false;
    }
  },
  beforeUnmount() {
    if (this._am5Root) {
      this._am5Root.dispose();
    }
  },
  methods: {
    createChart() {
      let root = am5.Root.new("responseTimeChart");
      this._am5Root = root;

      root.setThemes([am5themes_Animated.new(root)]);

      let chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: true,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
        paddingLeft: 0,
      }));

      let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
      cursor.lineY.set("visible", false);

      let xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30, minorGridEnabled: true });
      xRenderer.labels.template.setAll({
        rotation: -45,
        centerY: am5.p50,
        centerX: am5.p100,
        paddingRight: 10,
        fontSize: '0.8rem'
      });

      let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
        maxDeviation: 0.3,
        categoryField: "promptIdLabel",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {})
      }));

      let yRenderer = am5xy.AxisRendererY.new(root, {
        minGridDistance: 40
      });

      let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
        maxDeviation: 0.3,
        min: 0,
        extraMax: 0.1,
        renderer: yRenderer,
        numberFormat: "#.0's'"
      }));
      yAxis.children.moveValue(am5.Label.new(root, { text: "Avg. Time (s)", rotation: -90, y: am5.p50, centerX: am5.p50 }), 0);

      let series = chart.series.push(am5xy.LineSeries.new(root, {
        name: "Response Time",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "avg",
        categoryXField: "promptIdLabel",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{categoryX}: {valueY.formatNumber('#.00')}s"
        })
      }));
      
      series.strokes.template.setAll({ strokeWidth: 2 });
      series.bullets.push(() => am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, { radius: 4, fill: series.get("fill"), stroke: root.interfaceColors.get("background"), strokeWidth: 2 })
      }));

      xAxis.data.setAll(this.sortedAvgTimes);
      series.data.setAll(this.sortedAvgTimes);

      series.appear(1000);
      chart.appear(1000, 100);
    },
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
.chart-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 250px;
}
.loading-state, .empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 0.9rem;
}
</style>
