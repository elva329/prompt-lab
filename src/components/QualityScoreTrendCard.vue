<template>
  <div class="quality-card mb-4">
    <div class="quality-card-inner px-4 py-3">
      <div class="d-flex align-items-center gap-2 mb-2">
        <div class="dot bg-teal-400"></div>
        <h5 class="quality-title mb-0">Quality Score Trend</h5>
        <span class="quality-subtitle ms-2">7-day rolling · Mar 7–13, 2026</span>
      </div>
      <div class="trend-line-chart mb-3">
        <div id="qualityTrendLineChart" style="width:100%;height:210px;"></div>
      </div>
      <div class="trend-stat-row mt-1">
        <div class="trend-stat-item">
          <div class="trend-stat-dot" style="background-color:#f87171"></div>
          <span class="trend-stat-label">Low: <span style="color:#f87171;font-weight:600">64.2</span></span>
        </div>
        <div class="trend-stat-item">
          <div class="trend-stat-dot" style="background-color:#14b8a6"></div>
          <span class="trend-stat-label">High: <span style="color:#14b8a6;font-weight:600">70.1</span></span>
        </div>
        <div class="trend-stat-item">
          <div class="trend-stat-dot" style="background-color:#94a3b8"></div>
          <span class="trend-stat-label">Avg: <span style="color:#94a3b8;font-weight:600">67.4</span></span>
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
  name: 'QualityScoreTrendCard',
  data() {
    return {
      trendData: [
        { date: 'Mar 7', score: 64.2 },
        { date: 'Mar 8', score: 66.8 },
        { date: 'Mar 9', score: 65.3 },
        { date: 'Mar 10', score: 68.5 },
        { date: 'Mar 11', score: 70.1 },
        { date: 'Mar 12', score: 67.4 },
        { date: 'Mar 13', score: 69.8 },
      ],
      _am5Root: null,
    };
  },
  mounted() {
    let root = am5.Root.new('qualityTrendLineChart');
    root.setThemes([
      am5themes_Animated.new(root)
    ]);
    let chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: 'panX',
      wheelY: 'zoomX',
      paddingTop: 20,
      paddingBottom: 20,
      paddingLeft: 20,
      paddingRight: 20,
    }));
    let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      categoryField: 'date',
      renderer: am5xy.AxisRendererX.new(root, {
        minGridDistance: 20,
        labels: {
          fill: am5.color('#94a3b8'),
          fontSize: 9.5,
          fontFamily: 'Inter, sans-serif',
        },
      }),
    }));
    xAxis.data.setAll(this.trendData);
    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {
        labels: {
          fill: am5.color('#94a3b8'),
          fontSize: 9.5,
          fontFamily: 'Inter, sans-serif',
        },
      }),
      min: 55,
      max: 75,
    }));
    let series = chart.series.push(am5xy.LineSeries.new(root, {
      name: 'Score',
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: 'score',
      categoryXField: 'date',
      stroke: am5.color('#14b8a6'),
      strokeWidth: 2.5,
      fill: am5.color('#14b8a6'),
      tension: 0.8,
    }));
    series.data.setAll(this.trendData);
    series.strokes.template.setAll({ strokeOpacity: 1 });
    series.fills.template.setAll({ fillOpacity: 0.15 });
    series.bullets.push(() => {
      return am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 3.5,
          fill: am5.color('#14b8a6'),
          stroke: am5.color('#fff'),
          strokeWidth: 2,
        })
      });
    });
    chart.set('cursor', am5xy.XYCursor.new(root, {}));
    this._am5Root = root;
  },
  beforeUnmount() {
    if (this._am5Root) {
      this._am5Root.dispose();
    }
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Inter:wght@400;500;600;700;800&display=swap');
.quality-card {
  border-radius: 1.5rem;
  background: rgba(255,255,255,0.90);
  backdrop-filter: blur(6px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  border: 1px solid rgba(255,255,255,0.6);
  transition: box-shadow 0.2s;
  min-width: 0;
  width: 100%;
  margin-left: 0;
  margin-right: 0;
}
.quality-card:hover {
  box-shadow: 0 4px 16px rgba(20, 184, 166, 0.14);
  transform: translateY(-2px);
}
.quality-card-inner {
  padding: 1.2rem 1.5rem 1.2rem 1.5rem;
  font-family: 'Inter', sans-serif;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 0.5rem;
}
.bg-teal-400 {
  background: #14b8a6;
}
.quality-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #334155;
}
.quality-subtitle {
  color: #a0aec0;
  font-size: 0.75rem;
  font-weight: 500;
}
.trend-line-chart {
  width: 100%;
  height: 220px;
  border-radius: 1.2rem;
  background: none;
  border: none;
  overflow: hidden;
  box-shadow: none;
  padding: 0.5rem 0.5rem 0 0.5rem;
}
.trend-stat-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.trend-stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.trend-stat-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.trend-stat-label {
  color: #64748b;
  font-size: 0.75rem;
  font-family: 'Inter', sans-serif;
}
</style>
