<template>
  <div class="ui-card">
    <div class="card-header">
      <div class="card-dot"></div>
      <h5 class="card-title">Quality Score Trend</h5>
    </div>
    <div class="card-subtitle">7-day rolling · {{ trendData.length ? (new Date(trendData[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + '–' + new Date(trendData[trendData.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + new Date(trendData[trendData.length - 1].date).getFullYear()) : '' }}</div>
    <div class="card-body">
      <div class="trend-chart-container">
        <div id="qualityTrendLineChart" style="width:100%;height:250px;"></div>
      </div>
      <div class="trend-stat-row">
        <div class="trend-stat-item">
          <div class="trend-stat-dot" style="background-color:#f87171"></div>
          <span class="trend-stat-label">Low: <span style="color:#f87171;font-weight:600">{{ low }}</span></span>
        </div>
        <div class="trend-stat-item">
          <div class="trend-stat-dot" style="background-color:#14b8a6"></div>
          <span class="trend-stat-label">High: <span style="color:#14b8a6;font-weight:600">{{ high }}</span></span>
        </div>
          <div class="trend-stat-item">
            <div class="trend-stat-dot" style="background-color:#94a3b8"></div>
            <span class="trend-stat-label">Avg: <span style="color:#94a3b8;font-weight:600">{{ avg }}</span></span>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { fetchResultsByUserRequest } from '../lib/resultsApi'
import { appStore } from '../stores/appStore'

export default {
  name: 'QualityScoreTrendCard',
  data() {
    return {
      trendData: [],
      low: null,
      high: null,
      avg: null,
      _am5Root: null,
    };
  },
  async mounted() {
    const userId = appStore.state.user?.id || '';
    if (userId) {
      try {
        const results = await fetchResultsByUserRequest(userId);
        // Get all unique dates from results
        const dateSet = new Set(results.map(r => r.createdAt && r.createdAt.slice(0, 10)).filter(Boolean));
        const allDates = Array.from(dateSet).sort();
        // Fill missing dates between min and max
        if (allDates.length > 0) {
          const minDate = new Date(allDates[0]);
          const maxDate = new Date(allDates[allDates.length - 1]);
          const dateList = [];
          for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
            dateList.push(d.toISOString().slice(0, 10));
          }
          const dailyScores = dateList.map(dateStr => {
            const scores = results.filter(r => r.createdAt && r.createdAt.slice(0, 10) === dateStr).map(r => r.overallQuality).filter(v => typeof v === 'number');
            const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
            return { date: dateStr, value: avg };
          });
          this.trendData = dailyScores.map(d => ({ date: d.date, value: d.value }));
          // Calculate stats
          const validScores = dailyScores.map(d => d.value).filter(s => s !== null);
          this.low = validScores.length ? Math.min(...validScores).toFixed(1) : 'N/A';
          this.high = validScores.length ? Math.max(...validScores).toFixed(1) : 'N/A';
          this.avg = validScores.length ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1) : 'N/A';
        } else {
          this.trendData = [];
          this.low = this.high = this.avg = 'N/A';
        }
      } catch (e) {
        // fallback to mock data
        this.trendData = [];
        this.low = this.high = this.avg = 'N/A';
      }
    }
    // Chart code based on sample
    let root = am5.Root.new('qualityTrendLineChart');
    root.setThemes([
      am5themes_Animated.new(root)
    ]);
    root.dateFormatter.setAll({
      dateFormat: 'yyyy-MM-dd',
      dateFields: ['valueX']
    });
    let chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        focusable: true,
        panX: true,
        panY: true,
        wheelX: 'panX',
        wheelY: 'zoomX',
        pinchZoomX: true,
        paddingLeft: 0,
        paddingBottom: 50
      })
    );
    // Update axis label font style and size to match sample
    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        maxDeviation: 0.5,
        groupData: false,
        baseInterval: {
          timeUnit: 'day',
          count: 1
        },
        renderer: am5xy.AxisRendererX.new(root, {
          pan: 'zoom',
          minGridDistance: 70,
          minorGridEnabled: true
        }),
        tooltip: am5.Tooltip.new(root, {})
      })
    );
    xAxis.get('renderer').labels.template.setAll({
      fontSize: 12,
      fontFamily: 'Manrope, sans-serif',
      fontWeight: '700',
      fill: am5.color('#687083')
    });
    // Set y-axis intervals to a few custom values for more granularity
    // Use renderer settings to force more grid lines and labels
    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        maxDeviation: 1,
        min: 0,
        max: 100,
        strictMinMax: true,
        renderer: am5xy.AxisRendererY.new(root, {
          pan: 'zoom',
          minGridDistance: 20,
          gridIntervals: [
            { interval: 20, count: 5 },
            { interval: 25, count: 4 },
            { interval: 50, count: 2 }
          ]
        })
      })
    );
    yAxis.get('renderer').labels.template.setAll({
      fontSize: 12,
      fontFamily: 'Manrope, sans-serif',
      fontWeight: '700',
      fill: am5.color('#687083')
    });
    yAxis.set('min', 0);
    yAxis.set('max', 100);
    yAxis.set('strictMinMax', true);
    yAxis.set('interval', 20);
    yAxis.set('numberFormat', '#');
    let series = chart.series.push(
      am5xy.LineSeries.new(root, {
        minBulletDistance: 10,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: 'value',
        valueXField: 'date',
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: 'horizontal',
          labelText: '{valueY}'
        })
      })
    );
    series.data.processor = am5.DataProcessor.new(root, {
      dateFormat: 'yyyy-MM-dd',
      dateFields: ['date']
    });
    series.data.setAll(this.trendData);
    series.bullets.push(function () {
      let circle = am5.Circle.new(root, {
        radius: 4,
        fill: series.get('fill'),
        stroke: root.interfaceColors.get('background'),
        strokeWidth: 2
      });
      return am5.Bullet.new(root, {
        sprite: circle
      });
    });
    let cursor = chart.set('cursor', am5xy.XYCursor.new(root, {
      xAxis: xAxis
    }));
    cursor.lineY.set('visible', false);
    // Add more space between the scroll bar and the chart
    chart.set('scrollbarX', am5.Scrollbar.new(root, {
      orientation: 'horizontal',
      marginTop:-5, // Add space above scrollbar
      marginBottom: 60 // Increased spacing for logo
    }));
    series.appear(1000, 100);
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
.ui-card {
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 1rem 1.2rem;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
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
  background: #38bdf8;
  display: inline-block;
}
.card-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #687083;
  font-family: 'Sora', sans-serif;
}
.card-subtitle {
  color: #a0aec0;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}
.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 250px;
}
.trend-chart-container {
  width: 100%;
  flex: 1;
  min-height: 250px;
}
.trend-stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.5rem;
  padding-top: 0.25rem;
}
.trend-stat-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.trend-stat-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.trend-stat-label {
  color: #687083;
  font-size: 0.75rem;
  font-weight: 600;
}
</style>
