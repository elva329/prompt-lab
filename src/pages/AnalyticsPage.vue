<script>
import MetricCard from '../components/MetricCard.vue';
import QualityDimensionsCard from '../components/QualityDimensionsCard.vue';

import QualityScoreTrendCard from '../components/QualityScoreTrendCard.vue';

export default {
  name: 'AnalyticsPage',
  components: {
    MetricCard,
    QualityDimensionsCard,
    QualityScoreTrendCard,
  },
};
</script>
<template>
  <div class="container mt-4">
    <h2 class="mb-4">Analytics</h2>
    <div class="row">
      <div class="col-md-3">
        <MetricCard
          iconName="flask"
          iconBg="#e7f1ff"
          iconColor="#3b82f6"
          label="AVG. OVERALL QUALITY"
          value="67.3"
          subValue="/ 100"
          trend="+4.1%"
          trendLabel="vs. last experiment batch"
          :trendUp="true"
          :progressValue="67.3"
          progressGradient="linear-gradient(90deg, #3b82f6, #2563eb)"
        />
      </div>
      <div class="col-md-3">
        <MetricCard
          iconName="stopwatch"
          iconBg="#fff7e6"
          iconColor="#f59e42"
          label="AVG. RESPONSE TIME"
          value="3,842"
          subValue="ms"
          trend="-2.3%"
          trendLabel="vs. last experiment batch"
          :trendUp="false"
          :progressValue="38"
          progressGradient="linear-gradient(90deg, #fbbf24, #f59e42)"
        />
      </div>
      <div class="col-md-3">
        <MetricCard
          iconName="list-alt"
          iconBg="#e6f7ff"
          iconColor="#0ea5e9"
          label="PROMPTS EVALUATED"
          value="1,250"
          trend="+120"
          trendLabel="since last batch"
          :trendUp="true"
          :progressValue="100"
          progressGradient="linear-gradient(90deg, #38bdf8, #0ea5e9)"
        />
      </div>
      <div class="col-md-3">
        <MetricCard
          iconName="check-double"
          iconBg="#e6fff7"
          iconColor="#059669"
          label="PASS RATE (≥60)"
          value="85%"
          trend="+2.5%"
          trendLabel="vs. last batch"
          :trendUp="true"
          :progressValue="85"
          progressGradient="linear-gradient(90deg, #10b981, #059669)"
        />
      </div>
    </div>
    <div class="row mt-4">
      <div class="col-md-6">
        <QualityDimensionsCard />
      </div>
      <div class="col-md-6">
        <QualityScoreTrendCard />
      </div>
    </div>
  </div>
</template>