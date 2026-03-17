<template>
  <div class="metric-card mb-4">
    <div class="metric-card-inner">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div class="icon-bg d-flex align-items-center justify-content-center" :style="{ background: iconBg }">
          <font-awesome-icon :icon="iconName" size="lg" :style="{ color: iconColor }" />
        </div>
        <span :class="['trend-badge', trendUp ? 'trend-up' : 'trend-down']">
          <font-awesome-icon :icon="trendUp ? 'arrow-up' : 'arrow-down'" style="font-size: 0.7rem;" />
          <span class="ms-1">{{ trend }}</span>
        </span>
      </div>
      <p class="metric-label mb-1">{{ label }}</p>
      <div class="d-flex align-items-end gap-1 mb-1">
        <p class="metric-value mb-0">{{ value }}</p>
        <span v-if="subValue" class="metric-subvalue">{{ subValue }}</span>
      </div>
      <div v-if="chartData && chartData.length > 0" :id="uniqueChartId" class="metric-chart" style="height: 60px; width: 100%;"></div>
      <div v-else>
        <p class="metric-trend-label mb-3">{{ trendLabel }}</p>
        <div v-if="progressValue !== undefined" class="metric-progress">
          <div class="metric-progress-bar" :style="{ width: progressValue + '%', background: progressGradient }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

export default {
  name: 'MetricCard',
  props: {
    iconName: { type: [String, Array], default: 'flask' }, // FontAwesome icon name
    iconBg: { type: String, default: '#e7f1ff' }, // Icon background color
    iconColor: { type: String, default: '#3b82f6' }, // Icon color
    label: { type: String, required: true },
    value: { type: [String, Number], required: true },
    subValue: { type: String, default: '' },
    trend: { type: String, default: '' },
    trendLabel: { type: String, default: '' },
    trendUp: { type: Boolean, default: true },
    progressValue: { type: Number },
    progressGradient: { type: String, default: 'linear-gradient(90deg, #3b82f6, #2563eb)' },
    chartData: { type: Array, default: null }, // Array of objects { date: string, value: number }
    chartColor: { type: String, default: '#3b82f6' }
  },
  data() {
    return {
      uniqueChartId: 'metric-chart-' + Math.random().toString(36).substr(2, 9),
      _am5Root: null,
    };
  },
  mounted() {
    if (this.chartData && this.chartData.length > 0) {
      this.createChart();
    }
  },
  beforeUnmount() {
    if (this._am5Root) {
      this._am5Root.dispose();
    }
  },
  methods: {
    createChart() {
      let root = am5.Root.new(this.uniqueChartId);
      this._am5Root = root;
      root.setThemes([am5themes_Animated.new(root)]);

      let chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingTop: 10
      }));

      let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: "date",
        renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 10, visible: false }),
        visible: false
      }));

      let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, { visible: false }),
        visible: false
      }));

      let series = chart.series.push(am5xy.LineSeries.new(root, {
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        categoryXField: "date",
        stroke: am5.color(this.chartColor),
        strokeWidth: 2
      }));
      
      series.strokes.template.set("tension", 0.5); // Curved lines

      xAxis.data.setAll(this.chartData);
      series.data.setAll(this.chartData);
      
      series.appear(1000);
      chart.appear(1000, 100);
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Inter:wght@400;500;600;700;800&display=swap');

.metric-card {
  border-radius: 2rem;
  background: rgba(255,255,255,0.90);
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.07), 0 1.5px 3px rgba(0,0,0,0.03);
  border: 1px solid rgba(255,255,255,0.60);
  transition: box-shadow 0.3s, transform 0.3s;
}

.metric-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  transform: translateY(-2px);
}

.metric-card-inner {
  padding: 1.5rem 1rem;
  font-family: 'Inter', sans-serif;
}

.icon-bg {
  width: 36px;
  height: 36px;
  border-radius: 1rem;
  font-size: 1.2rem;
  color: #2d3748;
}

.trend-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.68rem;
  font-weight: 500;
  border-radius: 999px;
  padding: 0.25rem 0.5rem;
}

.trend-up {
  color: #059669;
  background: #e6fff7;
}

.trend-down {
  color: #e11d48;
  background: #ffe6e6;
}

.metric-label {
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.metric-value {
  color: #2d3748;
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1.1;
}

.metric-subvalue {
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 500;
}

.metric-trend-label {
  color: #94a3b8;
  font-size: 0.68rem;
}

.metric-progress {
  height: 6px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
}

.metric-progress-bar {
  height: 100%;
  border-radius: 999px;
  transition: width 0.7s;
}
</style>