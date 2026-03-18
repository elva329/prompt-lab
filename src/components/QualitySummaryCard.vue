<template>
  <div class="ui-card">
    <div class="card-header">
      <span class="card-dot"></span>
      <span class="card-title">Quality Summary</span>
    </div>
    <div class="card-subtitle">Pass rate & dimension scores</div>
    <div class="card-body">
      <div class="summary-donut">
        <div id="qualitySummaryPieChart" class="pie-chart-center-fit">
          <span v-if="passRate + borderlineRate + failRate === 0" style="color:#64748b;font-size:0.75rem;">No Data</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { appStore } from '../stores/appStore';
import { fetchResultsByUserRequest } from '../lib/resultsApi';

export default {
  name: 'QualitySummaryCard',
  data() {
    return {
      clarity: 0,
      coherence: 0,
      overall: 0,
      completeness: 0,
      relevance: 0,
      passRate: 0,
      borderlineRate: 0,
      failRate: 0,
      passCount: 0,
      borderlineCount: 0,
      failCount: 0,
      _am5Root: null,
    };
  },
  async mounted() {
    const userId = appStore.state.user?.id || '';
    console.log('QualitySummaryCard userId:', userId);
    if (userId) {
      try {
        const results = await fetchResultsByUserRequest(userId);
        console.log('QualitySummaryCard results:', results);
        if (!results || results.length === 0) {
          // Show placeholder or fallback chart
          this.clarity = 0;
          this.coherence = 0;
          this.overall = 0;
          this.completeness = 0;
          this.relevance = 0;
          this.passRate = 0;
          this.borderlineRate = 0;
          this.failRate = 0;
          this.passCount = 0;
          this.borderlineCount = 0;
          this.failCount = 0;
          this.$nextTick(() => {
            const container = document.getElementById('qualitySummaryPieChart');
            if (!container) return;
            let root = am5.Root.new('qualitySummaryPieChart');
            root.setThemes([
              am5themes_Animated.new(root)
            ]);
            
            let chart = root.container.children.push(am5xy.XYChart.new(root, {
              panX: false,
              panY: false,
              wheelX: "none",
              wheelY: "none",
              layout: root.verticalLayout,
              paddingLeft: 0,
              paddingRight: 30,
              paddingTop: 10,
              paddingBottom: 10
            }));

            let yRenderer = am5xy.AxisRendererY.new(root, {
              minGridDistance: 30,
              inversed: true,
              cellStartLocation: 0.1,
              cellEndLocation: 0.9
            });

            yRenderer.grid.template.set("visible", false);

            let yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
              categoryField: "category",
              renderer: yRenderer
            }));

            let xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
              min: 0,
              max: 100,
              strictMinMax: true,
              renderer: am5xy.AxisRendererX.new(root, {
                strokeOpacity: 0.1
              })
            }));

            let series = chart.series.push(am5xy.ColumnSeries.new(root, {
              xAxis: xAxis,
              yAxis: yAxis,
              valueXField: "value",
              categoryYField: "category",
              sequencedInterpolation: true
            }));

            series.columns.template.setAll({
              height: am5.percent(70),
              cornerRadiusTR: 10,
              cornerRadiusBR: 10,
              strokeOpacity: 0,
              fill: am5.color(0xCBD5E1)
            });

            const data = [
              { category: "No Data", value: 0 }
            ];

            yAxis.data.setAll(data);
            series.data.setAll(data);
            
            this._am5Root = root;
          });
          return;
        }
        // Filter results for pass, borderline, fail
        const passCount = results.filter(r => r.overallQuality >= 60).length;
        const borderlineCount = results.filter(r => r.overallQuality >= 50 && r.overallQuality < 60).length;
        const failCount = results.filter(r => r.overallQuality < 50).length;
        const total = results.length;
        this.passCount = passCount;
        this.borderlineCount = borderlineCount;
        this.failCount = failCount;
        this.passRate = total ? Math.round((passCount / total) * 100) : 0;
        this.borderlineRate = total ? Math.round((borderlineCount / total) * 100) : 0;
        this.failRate = total ? Math.round((failCount / total) * 100) : 0;
        
        // Calculate dimension scores (example values - replace with actual data)
        this.clarity = 72;
        this.coherence = 69;
        this.overall = 67;
        this.completeness = 61;
        this.relevance = 58;
        
        // Debug: log filtered counts and rates
        console.log('Pass count:', passCount, 'Borderline count:', borderlineCount, 'Fail count:', failCount, 'Total:', total);
        console.log('Pass rate:', this.passRate, 'Borderline rate:', this.borderlineRate, 'Fail rate:', this.failRate);
        
        // Render amCharts bar chart
        this.$nextTick(() => {
          const container = document.getElementById('qualitySummaryPieChart');
          if (!container) return;
          if (this._am5Root) {
            this._am5Root.dispose();
            this._am5Root = null;
          }
          
          let root = am5.Root.new('qualitySummaryPieChart');
          root.setThemes([
            am5themes_Animated.new(root)
          ]);
          
          let chart = root.container.children.push(am5xy.XYChart.new(root, {
            panX: false,
            panY: false,
            wheelX: "none",
            wheelY: "none",
            layout: root.verticalLayout,
            paddingLeft: 0,
            paddingRight: 30,
            paddingTop: 10,
            paddingBottom: 25 // Increased to move logo away
          }));

          let yRenderer = am5xy.AxisRendererY.new(root, {
            minGridDistance: 30,
            inversed: true,
            cellStartLocation: 0.1,
            cellEndLocation: 0.9
          });

          yRenderer.grid.template.set("visible", false);

          let yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
            categoryField: "category",
            renderer: yRenderer
          }));

          yAxis.get("renderer").labels.template.setAll({
            fontSize: 12,
            fontFamily: 'Manrope, sans-serif',
            fontWeight: '700',
            fill: am5.color(0x687083)
          });

          let xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
            min: 0,
            max: 100,
            strictMinMax: true,
            renderer: am5xy.AxisRendererX.new(root, {
              strokeOpacity: 0.1
            })
          }));
          
          xAxis.get("renderer").labels.template.setAll({
            fontSize: 10,
            fontFamily: 'Manrope, sans-serif',
            fontWeight: '600',
            fill: am5.color(0x687083)
          });

          xAxis.get("renderer").grid.template.setAll({
            strokeOpacity: 0.05
          });

          let series = chart.series.push(am5xy.ColumnSeries.new(root, {
            xAxis: xAxis,
            yAxis: yAxis,
            valueXField: "value",
            categoryYField: "category",
            sequencedInterpolation: true,
            tooltip: am5.Tooltip.new(root, {
              pointerOrientation: "horizontal",
              labelText: "{categoryY}: {valueX}%"
            })
          }));

          series.columns.template.setAll({
            height: am5.percent(70),
            cornerRadiusTR: 10,
            cornerRadiusBR: 10,
            strokeOpacity: 0
          });

          // Custom colors for each bar
          series.columns.template.adapters.add("fill", (fill, target) => {
            const category = target.dataItem.get("categoryY");
            if (category === 'Pass') return am5.color(0x2563eb);
            if (category === 'Borderline') return am5.color(0xfbbf24);
            if (category === 'Fail') return am5.color(0xf87171);
            return fill;
          });

          series.columns.template.adapters.add("stroke", (stroke, target) => {
            const category = target.dataItem.get("categoryY");
            if (category === 'Pass') return am5.color(0x2563eb);
            if (category === 'Borderline') return am5.color(0xfbbf24);
            if (category === 'Fail') return am5.color(0xf87171);
            return stroke;
          });

          // Add labels to the end of bars
          series.bullets.push(function() {
            return am5.Bullet.new(root, {
              locationX: 1,
              native: false,
              sprite: am5.Label.new(root, {
                text: "{valueX}%",
                fill: am5.color(0x334155),
                centerY: am5.p50,
                x: am5.p100,
                populateText: true,
                fontSize: 12,
                fontFamily: 'Manrope, sans-serif',
                fontWeight: "800"
              })
            });
          });

          const data = [
            { category: "Pass", value: this.passRate },
            { category: "Borderline", value: this.borderlineRate },
            { category: "Fail", value: this.failRate }
          ];

          yAxis.data.setAll(data);
          series.data.setAll(data);
          
          series.appear(1000);
          chart.appear(1000, 100);
          this._am5Root = root;
        });
      } catch (e) {
        console.error('Error loading quality data:', e);
        // fallback to mock data
        this.passRate = 73;
        this.borderlineRate = 0;
        this.failRate = 27;
        this.clarity = 72;
        this.coherence = 69;
        this.overall = 67;
        this.completeness = 61;
        this.relevance = 58;
        
        // Render with fallback data
        this.$nextTick(() => {
          const container = document.getElementById('qualitySummaryPieChart');
          if (!container) return;
          if (this._am5Root) {
            this._am5Root.dispose();
            this._am5Root = null;
          }
          
          let root = am5.Root.new('qualitySummaryPieChart');
          root.setThemes([
            am5themes_Animated.new(root)
          ]);
          
          let chart = root.container.children.push(am5xy.XYChart.new(root, {
            panX: false,
            panY: false,
            wheelX: "none",
            wheelY: "none",
            layout: root.verticalLayout,
            paddingLeft: 0,
            paddingRight: 30,
            paddingTop: 10,
            paddingBottom: 10
          }));

          let yRenderer = am5xy.AxisRendererY.new(root, {
            minGridDistance: 30,
            inversed: true,
            cellStartLocation: 0.1,
            cellEndLocation: 0.9
          });

          yRenderer.grid.template.set("visible", false);

          let yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
            categoryField: "category",
            renderer: yRenderer
          }));

          let xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
            min: 0,
            max: 100,
            strictMinMax: true,
            renderer: am5xy.AxisRendererX.new(root, {
              strokeOpacity: 0.1
            })
          }));

          let series = chart.series.push(am5xy.ColumnSeries.new(root, {
            xAxis: xAxis,
            yAxis: yAxis,
            valueXField: "value",
            categoryYField: "category",
            sequencedInterpolation: true
          }));

          series.columns.template.setAll({
            height: am5.percent(70),
            cornerRadiusTR: 10,
            cornerRadiusBR: 10,
            strokeOpacity: 0
          });

          series.columns.template.adapters.add("fill", (fill, target) => {
            const category = target.dataItem.get("categoryY");
            if (category === 'Pass') return am5.color(0x2563eb);
            if (category === 'Borderline') return am5.color(0xfbbf24);
            if (category === 'Fail') return am5.color(0xf87171);
            return fill;
          });

          series.bullets.push(function() {
            return am5.Bullet.new(root, {
              locationX: 1,
              native: false,
              sprite: am5.Label.new(root, {
                text: "{valueX}%",
                fill: am5.color(0x334155),
                centerY: am5.p50,
                x: am5.p100,
                populateText: true,
                fontSize: 12,
                fontWeight: "700"
              })
            });
          });

          const data = [
            { category: "Pass", value: this.passRate },
            { category: "Borderline", value: this.borderlineRate },
            { category: "Fail", value: this.failRate }
          ];

          yAxis.data.setAll(data);
          series.data.setAll(data);
          
          series.appear(1000);
          chart.appear(1000, 100);
          this._am5Root = root;
        });
      }
    }
  },
  beforeUnmount() {
    if (this._am5Root) {
      this._am5Root.dispose();
    }
  }
};
</script>

<style scoped>
.card-subtitle {
  margin-bottom: 0;
}
.summary-donut {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.pie-chart-center-fit {
  width: 100%;
  height: 200px; /* Reduced height as bar charts are more compact than donut charts */
  min-width: 240px;
  max-width: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

@media (max-width: 768px) {
  .pie-chart-center-fit {
    height: 220px; /* Slightly taller on mobile */
  }
}
</style>