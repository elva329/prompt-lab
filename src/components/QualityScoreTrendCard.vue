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
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      pinchZoomX: true,
      paddingLeft: 0
    }));
    let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "none"
    }));
    cursor.lineY.set("visible", false);

    // Convert trendData to date format
    let trendData = this.trendData.map((d, i) => {
      // Use index as day offset from Mar 7, 2026
      let base = new Date(2026, 2, 7); // Mar is month 2 (0-indexed)
      base.setDate(base.getDate() + i);
      return {
        date: base.getTime(),
        value: d.score
      };
    });

    let xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
      maxDeviation: 0.5,
      baseInterval: {
        timeUnit: "day",
        count: 1
      },
      renderer: am5xy.AxisRendererX.new(root, {
        minGridDistance: 80,
        minorGridEnabled: true,
        pan: "zoom",
        labels: {
          fill: am5.color('#687083'),
          fontSize: 8,
          fontFamily: 'Manrope, sans-serif',
          fontWeight: '700',
        }
      }),
      tooltip: am5.Tooltip.new(root, {})
    }));
    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      maxDeviation: 1,
      renderer: am5xy.AxisRendererY.new(root, {
        pan: "zoom",
        labels: {
          fill: am5.color('#687083'),
          fontSize: 8,
          fontFamily: 'Manrope, sans-serif',
          fontWeight: '700',
        }
      })
    }));
    let series = chart.series.push(am5xy.SmoothedXLineSeries.new(root, {
      name: "Score",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      valueXField: "date",
      sequencedInterpolation: true,
      tooltip: am5.Tooltip.new(root, {
        labelText: "{valueY}"
      })
    }));
    series.strokes.template.setAll({ strokeWidth: 2 });
    series.bullets.push(function () {
      return am5.Bullet.new(root, {
        locationY: 0,
        sprite: am5.Circle.new(root, {
          radius: 4,
          stroke: root.interfaceColors.get("background"),
          strokeWidth: 2,
          fill: series.get("fill")
        })
      });
    });
    chart.set("scrollbarX", am5.Scrollbar.new(root, {
      orientation: "horizontal"
    }));
    series.data.setAll(trendData);
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
  font-size: 0.8rem;
  font-weight: 700;
  color: #687083;
  font-family: 'Sora', sans-serif;
}
.quality-subtitle {
  color: #687083;
  font-size: 0.68rem;
  font-weight: 700;
  font-family: 'Manrope', sans-serif;
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
  color: #687083;
  font-size: 0.68rem;
  font-weight: 700;
  font-family: 'Manrope', sans-serif;
}
</style>
