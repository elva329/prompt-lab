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
import * as am5percent from '@amcharts/amcharts5/percent';
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
            let chart = root.container.children.push(am5percent.PieChart.new(root, {
              layout: root.verticalLayout,
              innerRadius: am5.percent(50)
            }));
            let series = chart.series.push(am5percent.PieSeries.new(root, {
              valueField: 'value',
              categoryField: 'category',
              alignLabels: false
            }));
            series.labels.template.setAll({
              textType: 'circular',
              centerX: 0,
              centerY: 0,
              fontSize:6
            });
            series.data.setAll([
              { value: 1, category: 'No Data' }
            ]);
            series.appear(1000, 100);
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
        
        // Render amCharts pie chart
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
          
          // Create chart with balanced size
          let chart = root.container.children.push(am5percent.PieChart.new(root, {
            layout: root.verticalLayout,
            innerRadius: am5.percent(50),
            width: container.offsetWidth,
            height: container.offsetHeight,
          }));
          
          let series = chart.series.push(am5percent.PieSeries.new(root, {
            valueField: 'value',
            categoryField: 'category',
            alignLabels: false,
            radius: am5.percent(80), // Balanced radius
          }));
          
          // Hide labels on slices
          series.labels.template.setAll({
            visible: false
          });
          
          // Hide ticks
          series.ticks.template.setAll({
            visible: false
          });
          
          // Custom slice colors
          series.get('colors').set('colors', [
            am5.color(0x2563eb), // Pass
            am5.color(0xfbbf24), // Borderline
            am5.color(0xf87171), // Fail
          ]);
          
          // Always show all three categories, even if value is 0
          series.data.setAll([
            { value: this.passRate, category: 'Pass ≥60' },
            { value: this.borderlineRate, category: 'Borderline 50-59' },
            { value: this.failRate, category: 'Fail <50' }
          ]);
          
          // Create legend with vertical layout - positioned at the bottom with space for logo
          let legend = chart.children.push(am5.Legend.new(root, {
            centerX: am5.percent(50),
            x: am5.percent(50),
            marginTop: 5,
            marginBottom: 20, // Space for amCharts logo
            width: am5.percent(90),
            layout: root.verticalLayout,
            paddingLeft: 10,
            paddingRight: 10,
          }));
          
          // Style the legend labels
          legend.labels.template.setAll({
            fontSize: 12,
            fontWeight: '600',
            fill: am5.color(0x334155),
            textAlign: 'left',
            width: 100,
            oversizedBehavior: 'wrap'
          });
          
          // Style the value labels (percentages)
          legend.valueLabels.template.setAll({
            fontSize: 12,
            fontWeight: '700',
            fill: am5.color(0x334155),
            textAlign: 'right',
            width: 40
          });
          
          // Style the legend markers (colored dots)
          legend.markers.template.setAll({
            width: 10,
            height: 10,
            radius: 10,
            marginRight: 8
          });
          
          // Add spacing between legend items
          legend.itemContainers.template.setAll({
            marginBottom: 5,
            paddingTop: 2,
            paddingBottom: 2,
            width: am5.percent(100)
          });
          
          // Connect legend to series
          legend.data.setAll(series.dataItems);
          
          series.appear(1000, 100);
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
          
          // Create chart with balanced size
          let chart = root.container.children.push(am5percent.PieChart.new(root, {
            layout: root.verticalLayout,
            innerRadius: am5.percent(50),
            width: container.offsetWidth,
            height: container.offsetHeight,
          }));
          
          let series = chart.series.push(am5percent.PieSeries.new(root, {
            valueField: 'value',
            categoryField: 'category',
            alignLabels: false,
            radius: am5.percent(80), // Balanced radius
          }));
          
          series.labels.template.setAll({ visible: false });
          series.ticks.template.setAll({ visible: false });
          
          series.get('colors').set('colors', [
            am5.color(0x2563eb), // Pass
            am5.color(0xfbbf24), // Borderline
            am5.color(0xf87171), // Fail
          ]);
          
          series.data.setAll([
            { value: this.passRate, category: 'Pass ≥60' },
            { value: this.borderlineRate, category: 'Borderline 50-59' },
            { value: this.failRate, category: 'Fail <50' }
          ]);
          
          // Legend with vertical layout - positioned at the bottom with space for logo
          let legend = chart.children.push(am5.Legend.new(root, {
            centerX: am5.percent(50),
            x: am5.percent(50),
            marginTop: 5,
            marginBottom: 20, // Space for amCharts logo
            width: am5.percent(90),
            layout: root.verticalLayout,
            paddingLeft: 10,
            paddingRight: 10,
          }));
          
          legend.labels.template.setAll({
            fontSize: 12,
            fontWeight: '600',
            fill: am5.color(0x334155),
            textAlign: 'left',
            width: 100,
            oversizedBehavior: 'wrap'
          });
          
          legend.valueLabels.template.setAll({
            fontSize: 12,
            fontWeight: '700',
            fill: am5.color(0x334155),
            textAlign: 'right',
            width: 40
          });
          
          legend.markers.template.setAll({
            width: 10,
            height: 10,
            radius: 10,
            marginRight: 8
          });
          
          legend.itemContainers.template.setAll({
            marginBottom: 5,
            paddingTop: 2,
            paddingBottom: 2,
            width: am5.percent(100)
          });
          
          legend.data.setAll(series.dataItems);
          series.appear(1000, 100);
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
  height: 100%;
  min-width: 240px;
  max-width: 320px;
  max-height: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}
</style>