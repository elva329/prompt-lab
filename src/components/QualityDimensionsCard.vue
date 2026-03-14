<template>
  <div class="quality-dimensions-card mb-4 p-0">
    <div class="quality-dimensions-inner px-4 py-3">
      <div class="d-flex align-items-center gap-2 mb-2">
        <div class="dot bg-orange-400"></div>
        <h5 class="quality-title mb-0">Quality Dimensions</h5>
        <span class="quality-subtitle ms-2">Avg scores · 153 runs</span>
      </div>
      <!-- Radar chart placeholder -->
      <div class="radar-chart mb-3">
        <div id="qualityRadarChart" style="width:100%;height:185px;"></div>
      </div>
      <!-- Dimension pills -->
      <div class="dimension-pills mt-1">
        <span class="dimension-pill" v-for="d in dimensions" :key="d.subject">
          <span class="dimension-pill-label">{{ d.subject }}</span>
          <span class="dimension-pill-value">{{ d.score }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5radar from '@amcharts/amcharts5/radar';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

export default {
  name: 'QualityDimensionsCard',
  data() {
    return {
      dimensions: [
        { subject: 'Clarity', score: 72 },
        { subject: 'Relevance', score: 58 },
        { subject: 'Coherence', score: 69 },
        { subject: 'Completeness', score: 61 },
        { subject: 'Overall', score: 67 },
      ],
      _am5Root: null,
    };
  },
  mounted() {
    let root = am5.Root.new('qualityRadarChart');
    root.setThemes([
      am5themes_Animated.new(root)
    ]);
    let chart = root.container.children.push(am5radar.RadarChart.new(root, {
      panX: false,
      panY: false,
      wheelX: 'panX',
      wheelY: 'zoomX',
      paddingTop: 20,
      paddingBottom: 20,
      paddingLeft: 20,
      paddingRight: 20,
      radius: am5.percent(85)
    }));
    let cursor = chart.set('cursor', am5radar.RadarCursor.new(root, {
      behavior: 'zoomX'
    }));
    cursor.lineY.set('visible', false);
    let xRenderer = am5radar.AxisRendererCircular.new(root, {
      minGridDistance: 20,
      strokeOpacity: 0.15,
      stroke: am5.color(0xf97316)
    });
    xRenderer.labels.template.setAll({
      radius: 18,
      fontSize: 13,
      fontWeight: '600',
      fill: am5.color(0xf97316),
      paddingBottom: 6
    });
    let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      maxDeviation: 0,
      categoryField: 'subject',
      renderer: xRenderer,
      tooltip: am5.Tooltip.new(root, {})
    }));
    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5radar.AxisRendererRadial.new(root, {
        strokeOpacity: 0.12,
        stroke: am5.color(0xf97316)
      }),
      min: 0,
      max: 100,
      strictMinMax: true,
      numberFormat: '#',
      extraMin: 0.05,
      extraMax: 0.05
    }));
    let series = chart.series.push(am5radar.RadarLineSeries.new(root, {
      name: 'Score',
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: 'score',
      categoryXField: 'subject',
      tooltip: am5.Tooltip.new(root, {
        labelText: '{valueY}'
      }),
      stroke: am5.color(0xf97316),
      fill: am5.color(0xf97316),
      fillOpacity: 0.13,
      strokeWidth: 2
    }));
    series.strokes.template.setAll({ strokeWidth: 2, stroke: am5.color(0xf97316) });
    series.fills.template.setAll({ fillOpacity: 0.13 });
    series.bullets.push(function () {
      return am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 6,
          fill: am5.color(0xf97316),
          stroke: am5.color(0xffffff),
          strokeWidth: 2
        })
      });
    });
    // Set data
    let data = this.dimensions.map(d => ({ subject: d.subject, score: d.score }));
    series.data.setAll(data);
    xAxis.data.setAll(data);
    // Animate chart and series in
    series.appear(1000);
    chart.appear(1000, 100);
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
@import url('https://fonts.googleapis.com/css?family=Inter:wght@400;500;600;700;800&display=swap');
.quality-dimensions-card {
  border-radius: 1.5rem;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(6px);
  box-shadow: none;
  border: none;
  transition: box-shadow 0.3s, transform 0.3s;
  min-width: 0;
  width: 100%;
  max-width: 480px;
  margin-left: 0;
  margin-right: 0;
  float: left;
}
.quality-dimensions-card:hover {
  box-shadow: 0 8px 24px rgba(249, 115, 22, 0.14);
  transform: translateY(-2px);
}
.quality-dimensions-inner {
  padding: 1.2rem 1.5rem 1.2rem 1.5rem;
  font-family: 'Inter', sans-serif;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 0.5rem;
}
.bg-orange-400 {
  background: #f97316;
}
.quality-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3748;
}
.quality-subtitle {
  color: #94a3b8;
  font-size: 0.68rem;
  font-weight: 500;
}
.radar-chart {
  width: 100%;
  height: 220px;
  border-radius: 1.2rem;
  background: none;
  border: none;
  overflow: hidden;
  box-shadow: none;
  padding: 0.5rem 0.5rem 0 0.5rem;
}
.dimension-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.dimension-pill {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: #ffe7c2;
  border-radius: 999px;
  padding: 0.2rem 0.7rem;
}
.dimension-pill-label {
  color: #f97316;
  /* Ensure orange color is applied and not overridden */
  font-weight: 700;
  font-size: 0.75rem;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 0.65rem;
}
.dimension-pill-value {
  color: #b45309;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 0.65rem;
}
</style>
