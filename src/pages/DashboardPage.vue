<template>
  <div class="fade-in-up dashboard-page page-fullheight">
    <section class="dashboard-surface page-fullheight">
      <div class="dashboard-menu-row">
        <nav class="dashboard-menu-pills">
          <RouterLink
            v-for="item in dashboardNavItems"
            :key="item.name"
            :to="item.path"
            class="dashboard-menu-link"
            :class="{ active: isNavItemActive(item.path) }"
          >
            {{ item.name }}
          </RouterLink>
        </nav>
        <button class="dashboard-menu-icon" title="User Profile" @click="handleLogout">
          <i class="bi bi-person-circle"></i>
        </button>
      </div>

      <div class="page-content-scrollable">
      <!-- <div class="dashboard-topbar">
        <div>
          <p class="text-secondary mb-0 small">Monitor prompt performance, compare runs, and improve quality faster.</p>
        </div>
  
      </div> -->

      <div class="row g-2 dashboard-main-grid">
        <div class="col-lg-9">
          <div class="dashboard-mosaic-heading mb-1">
            <h2 class="h6 mb-0 fw-semibold text-secondary">Best Scores by Category</h2>
            <span class="small text-secondary dashboard-mosaic-subtitle">Highest score achieved per prompt category</span>
          </div>
          <div class="dashboard-mosaic mb-2">
            <article class="card border-0 shadow-sm dashboard-profile-card dashboard-profile-highlight dashboard-card-primary">
              <div class="card-body text-center d-flex flex-column justify-content-center">
                <div class="dashboard-avatar-ring mx-auto mb-2">
                  <i class="bi bi-graph-up"></i>
                </div>
                <h5 class="mb-1">Avg Quality Score</h5>
                <h3 class="fw-semibold mb-2">{{ avgQualityDisplay }}</h3>
                <p class="small text-secondary mb-0">Overall response quality</p>
              </div>
            </article>

            <article class="card border-0 shadow-sm dashboard-chart-only-card dashboard-card-clarity">
              <div class="card-body">
                <h3 class="small mb-1 fw-semibold">Clarity</h3>
                <div v-if="clarityBestByCategoryChartData.length">
                  <div ref="clarityChartEl" class="dashboard-amchart dashboard-amchart-mini dashboard-amchart-plain"></div>
                </div>
                <p v-else class="small text-secondary mb-0">No clarity data yet.</p>
              </div>
            </article>

            <article class="card border-0 shadow-sm dashboard-chart-only-card dashboard-card-relevance">
              <div class="card-body">
                <h3 class="small mb-1 fw-semibold">Relevance</h3>
                <div v-if="relevanceBestByCategoryChartData.length">
                  <div ref="relevanceChartEl" class="dashboard-amchart dashboard-amchart-mini dashboard-amchart-plain"></div>
                </div>
                <p v-else class="small text-secondary mb-0">No relevance data yet.</p>
              </div>
            </article>

            <article class="card border-0 shadow-sm dashboard-chart-only-card dashboard-card-coherence">
              <div class="card-body">
                <h3 class="small mb-1 fw-semibold">Coherence</h3>
                <div v-if="coherenceBestByCategoryChartData.length" ref="coherenceChartEl" class="dashboard-amchart dashboard-amchart-mini dashboard-amchart-plain"></div>
                <p v-else class="small text-secondary mb-0">No coherence data yet.</p>
              </div>
            </article>

            <article class="card border-0 shadow-sm dashboard-chart-only-card dashboard-card-completeness">
              <div class="card-body">
                <h3 class="small mb-1 fw-semibold">Completeness</h3>
                <div v-if="completenessBestByCategoryChartData.length" ref="completenessChartEl" class="dashboard-amchart dashboard-amchart-mini dashboard-amchart-plain"></div>
                <p v-else class="small text-secondary mb-0">No completeness data yet.</p>
              </div>
            </article>
          </div>

          <!-- Focusing Section: Response Time Trend -->
          <article class="card border-0 shadow-sm dashboard-chart-card dashboard-card-trend">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h2 class="h6 mb-0 fw-semibold">Response Time Trend</h2>
                </div>
              </div>
              <div v-if="trendResponseData.length" ref="trendChartEl" class="dashboard-amchart dashboard-amchart-trend"></div>
              <p v-else class="small text-secondary mb-0">No response time data yet.</p>
              
              <!-- Legend -->
              <div v-if="trendResponseData.length" class="d-flex justify-content-center gap-4 mt-3 dashboard-trend-legend">
                <div class="d-flex align-items-center gap-2">
                  <span class="dashboard-trend-legend-dot"></span>
                  <span class="small text-secondary">Response Time (ms)</span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div class="col-lg-3">
          <article class="card border-0 shadow-sm dashboard-side-card mb-2">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h2 class="h6 mb-0 fw-semibold">Latest 3 Experiments</h2>
              </div>

              <div v-if="recentExperiments.length" class="vstack gap-2">
                <button
                  v-for="exp in recentExperiments"
                  :key="exp._id"
                  class="btn dashboard-meeting-row text-start"
                  @click="router.push('/experiments')"
                >
                  <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
                    <div class="grow">
                      <p class="mb-0 fw-semibold small">Experiment {{ shortId(exp._id) }}</p>
                      <p class="small text-secondary mb-0 dashboard-exp-date">{{ formatDate(exp.createdAt) }}</p>
                    </div>
                    <i class="bi bi-arrow-up-right small"></i>
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <span class="badge dashboard-exp-prompts-badge">
                      <i class="bi bi-zoom"></i> {{ exp.prompts.length }} prompts
                    </span>
                    <span v-if="typeof exp.avgQualityScore === 'number'" class="small text-secondary">{{ exp.avgQualityScore }}/100</span>
                  </div>
                </button>
              </div>
              <p v-else class="small text-secondary mb-0">No experiments yet.</p>
              
              <button class="btn btn-link p-0 text-decoration-none small mt-2 dashboard-link-cta" @click="router.push('/experiments')">
                See all experiments <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </article>

          <article class="card border-0 shadow-sm dashboard-side-card">
            <div class="card-body">
              <h2 class="h6 mb-1 fw-semibold">Top 3 Tested Prompt Categories</h2>
              <div v-if="topCategories.length" ref="categoryChartEl" class="dashboard-amchart dashboard-amchart-mini"></div>
              <p v-else class="small text-secondary mb-0">No category data yet.</p>
            </div>
          </article>
        </div>
      </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import * as am5 from '@amcharts/amcharts5';
import * as am5percent from '@amcharts/amcharts5/percent';
import * as am5radar from '@amcharts/amcharts5/radar';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

import { fetchUserByEmailRequest } from '../lib/authApi';
import { fetchExperimentsRequest, type ExperimentRecord } from '../lib/experimentsApi';
import { fetchPrompts } from '../lib/promptsApi';
import {
  fetchResultsByUserRequest,
  fetchResultsByExperimentRequest,
  fetchResultsSummaryRequest,
  type ExperimentResultRow,
} from '../lib/resultsApi';
import { appStore } from '../stores/appStore';

const router = useRouter();
const route = useRoute();
const totalPrompts = ref(0);
const experiments = ref<ExperimentRecord[]>([]);
const metricResults = ref<ExperimentResultRow[]>([]);
const trendChartEl = ref<HTMLElement | null>(null);
const categoryChartEl = ref<HTMLElement | null>(null);
const clarityChartEl = ref<HTMLElement | null>(null);
const relevanceChartEl = ref<HTMLElement | null>(null);
const coherenceChartEl = ref<HTMLElement | null>(null);
const completenessChartEl = ref<HTMLElement | null>(null);
let trendChartRoot: am5.Root | null = null;
let categoryChartRoot: am5.Root | null = null;
let clarityChartRoot: am5.Root | null = null;
let relevanceChartRoot: am5.Root | null = null;
let coherenceChartRoot: am5.Root | null = null;
let completenessChartRoot: am5.Root | null = null;
const dashboardSummary = ref({
  experimentsRun: 0,
  avgQualityScore: null as number | null,
  topCategories: [] as Array<{ name: string; count: number }>,
});

const firstName = computed(() => {
  const email = appStore.state.user?.email;
  if (!email) {
    return 'Researcher';
  }

  return email.split('@')[0];
});

const avgQualityDisplay = computed(() => {
  if (typeof dashboardSummary.value.avgQualityScore !== 'number') {
    return 'N/A';
  }

  return `${dashboardSummary.value.avgQualityScore}/100`;
});

const recentExperiments = computed(() => {
  return experiments.value
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
});
const topCategories = computed(() => dashboardSummary.value.topCategories.slice(0, 3));
const topCategoriesTotal = computed(() => {
  const total = topCategories.value.reduce((sum, item) => sum + item.count, 0);
  return total > 0 ? total : 1;
});

const trendResponseData = computed(() => {
  if (metricResults.value.length) {
    return metricResults.value
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((result) => {
        const date = new Date(result.createdAt);
        const timeString = date.toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        return {
          timestamp: timeString,
          responseTimeMs: result.responseTimeMs || 0,
        };
      });
  }

  return [];
});
const metricDailyData = computed(() => {
  const grouped = new Map<
    string,
    {
      day: string;
      responseTimeMsTotal: number;
      clarityTotal: number;
      relevanceTotal: number;
      completenessTotal: number;
      count: number;
    }
  >();

  for (const result of metricResults.value) {
    const date = new Date(result.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const existing = grouped.get(key) ?? {
      day: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      responseTimeMsTotal: 0,
      clarityTotal: 0,
      relevanceTotal: 0,
      completenessTotal: 0,
      count: 0,
    };

    existing.responseTimeMsTotal += result.responseTimeMs || 0;
    existing.clarityTotal += result.clarity || 0;
    existing.relevanceTotal += result.relevance || 0;
    existing.completenessTotal += result.completeness || 0;
    existing.count += 1;
    grouped.set(key, existing);
  }

  return Array.from(grouped.entries())
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-7)
    .map(([, value]) => ({
      day: value.day,
      responseTimeMs: Math.round(value.responseTimeMsTotal / value.count),
      clarity: Math.round(value.clarityTotal / value.count),
      relevance: Math.round(value.relevanceTotal / value.count),
      completeness: Math.round(value.completenessTotal / value.count),
    }));
});

const clarityBestByCategoryData = computed(() => {
  const bestByCategory = new Map<string, { category: string; maxClarity: number; tests: number }>();

  for (const result of metricResults.value) {
    const category = (result.category || 'Uncategorized').trim() || 'Uncategorized';
    const clarity = typeof result.clarity === 'number' ? result.clarity : 0;
    const existing = bestByCategory.get(category);
    if (!existing) {
      bestByCategory.set(category, { category, maxClarity: clarity, tests: 1 });
      continue;
    }

    existing.tests += 1;
    existing.maxClarity = Math.max(existing.maxClarity, clarity);
  }

  return Array.from(bestByCategory.values()).sort((a, b) => b.maxClarity - a.maxClarity);
});

const relevanceBestByCategoryData = computed(() => {
  const bestByCategory = new Map<string, { category: string; maxRelevance: number; tests: number }>();

  for (const result of metricResults.value) {
    const category = (result.category || 'Uncategorized').trim() || 'Uncategorized';
    const relevance = typeof result.relevance === 'number' ? result.relevance : 0;
    const existing = bestByCategory.get(category);
    if (!existing) {
      bestByCategory.set(category, { category, maxRelevance: relevance, tests: 1 });
      continue;
    }

    existing.tests += 1;
    existing.maxRelevance = Math.max(existing.maxRelevance, relevance);
  }

  return Array.from(bestByCategory.values()).sort((a, b) => b.maxRelevance - a.maxRelevance);
});

const coherenceBestByCategoryData = computed(() => {
  const bestByCategory = new Map<string, { category: string; maxCoherence: number; tests: number }>();

  for (const result of metricResults.value) {
    const category = (result.category || 'Uncategorized').trim() || 'Uncategorized';
    const coherence = typeof result.coherence === 'number' ? result.coherence : 0;
    const existing = bestByCategory.get(category);
    if (!existing) {
      bestByCategory.set(category, { category, maxCoherence: coherence, tests: 1 });
      continue;
    }

    existing.tests += 1;
    existing.maxCoherence = Math.max(existing.maxCoherence, coherence);
  }

  return Array.from(bestByCategory.values()).sort((a, b) => b.maxCoherence - a.maxCoherence);
});

const completenessBestByCategoryData = computed(() => {
  const bestByCategory = new Map<string, { category: string; maxCompleteness: number; tests: number }>();

  for (const result of metricResults.value) {
    const category = (result.category || 'Uncategorized').trim() || 'Uncategorized';
    const completeness = typeof result.completeness === 'number' ? result.completeness : 0;
    const existing = bestByCategory.get(category);
    if (!existing) {
      bestByCategory.set(category, { category, maxCompleteness: completeness, tests: 1 });
      continue;
    }

    existing.tests += 1;
    existing.maxCompleteness = Math.max(existing.maxCompleteness, completeness);
  }

  return Array.from(bestByCategory.values()).sort((a, b) => b.maxCompleteness - a.maxCompleteness);
});

const bestByCategoryChartLimit = 7;
const clarityBestByCategoryChartData = computed(() => clarityBestByCategoryData.value.slice(0, bestByCategoryChartLimit));
const relevanceBestByCategoryChartData = computed(() =>
  relevanceBestByCategoryData.value.slice(0, bestByCategoryChartLimit),
);
const coherenceBestByCategoryChartData = computed(() =>
  coherenceBestByCategoryData.value.slice(0, bestByCategoryChartLimit),
);
const completenessBestByCategoryChartData = computed(() =>
  completenessBestByCategoryData.value.slice(0, bestByCategoryChartLimit),
);

const avgCompleteness = computed(() => {
  if (!metricResults.value.length) {
    return 0;
  }

  const total = metricResults.value.reduce((sum, item) => sum + (item.completeness || 0), 0);
  return Math.round(total / metricResults.value.length);
});

const coherenceBandData = computed(() => {
  const buckets = {
    Excellent: 0,
    Good: 0,
    Fair: 0,
    Low: 0,
  };

  for (const result of metricResults.value) {
    const score = result.coherence || 0;
    if (score >= 80) {
      buckets.Excellent += 1;
    } else if (score >= 60) {
      buckets.Good += 1;
    } else if (score >= 40) {
      buckets.Fair += 1;
    } else {
      buckets.Low += 1;
    }
  }

  return Object.entries(buckets)
    .map(([band, value]) => ({ band, value }))
    .filter((item) => item.value > 0);
});

const categoryChartData = computed(() => {
  return topCategories.value.map((item) => ({
    category: item.name,
    count: item.count,
  }));
});

const dashboardNavItems = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Prompts', path: '/prompts' },
  { name: 'Favorites', path: '/favorites' },
  { name: 'Experiments', path: '/experiments' },
];

function isNavItemActive(path: string): boolean {
  if (path === '/experiments') {
    return route.path === '/experiments' || route.path.startsWith('/experiments/');
  }

  return route.path === path;
}

function handleLogout(): void {
  appStore.logout();
  router.push('/');
}

function shortId(value: string): string {
  return value.slice(-6).toUpperCase();
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function getCategoryColor(index: number): string {
  const colors = ['primary', 'success', 'warning', 'info', 'danger', 'secondary'];
  return colors[index % colors.length];
}

function disposeCharts(): void {
  trendChartRoot?.dispose();
  categoryChartRoot?.dispose();
  clarityChartRoot?.dispose();
  relevanceChartRoot?.dispose();
  coherenceChartRoot?.dispose();
  completenessChartRoot?.dispose();
  trendChartRoot = null;
  categoryChartRoot = null;
  clarityChartRoot = null;
  relevanceChartRoot = null;
  coherenceChartRoot = null;
  completenessChartRoot = null;
}

function renderTrendChart(): void {
  if (!trendChartEl.value || !trendResponseData.value.length) {
    return;
  }

  trendChartRoot?.dispose();

  const root = am5.Root.new(trendChartEl.value);
  trendChartRoot = root;
  root.setThemes([am5themes_Animated.new(root)]);

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: 'none',
      wheelY: 'none',
      layout: root.verticalLayout,
    }),
  );

  const xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: 'timestamp',
      renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 50, opposite: false }),
    }),
  );

  xAxis.get('renderer').labels.template.setAll({
    fill: am5.color(0x5f6a82),
    fontSize: 10,
    rotation: -45,
    textAlign: 'end',
  });

  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {}),
      min: 0,
      extraMax: 0.25,
    }),
  );

  yAxis.get('renderer').labels.template.setAll({
    fill: am5.color(0x7a849b),
    fontSize: 11,
  });

  const series = chart.series.push(
    am5xy.LineSeries.new(root, {
      name: 'Response Time (ms)',
      xAxis,
      yAxis,
      valueYField: 'responseTimeMs',
      categoryXField: 'timestamp',
      stroke: am5.color(0x4b6bff),
      fill: am5.color(0x4b6bff),
      tooltip: am5.Tooltip.new(root, { labelText: '{timestamp}: {valueY}ms' }),
    }),
  );
  series.strokes.template.setAll({ strokeWidth: 2.8 });
  series.bullets.push(() => am5.Bullet.new(root, {
    sprite: am5.Circle.new(root, {
      radius: 3,
      fill: am5.color(0x4b6bff),
    }),
  }));

  xAxis.data.setAll(trendResponseData.value);
  series.data.setAll(trendResponseData.value);
}

function renderCategoryChart(): void {
  if (!categoryChartEl.value || !categoryChartData.value.length) {
    return;
  }

  categoryChartRoot?.dispose();

  const minHeight = Math.max(130, categoryChartData.value.length * 44 + 24);
  categoryChartEl.value.style.height = `${minHeight}px`;

  const root = am5.Root.new(categoryChartEl.value);
  categoryChartRoot = root;
  root.setThemes([am5themes_Animated.new(root)]);

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: 'none',
      wheelY: 'none',
      layout: root.verticalLayout,
    }),
  );

  const yAxis = chart.yAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: 'category',
      renderer: am5xy.AxisRendererY.new(root, { minGridDistance: 12 }),
    }),
  );

  yAxis.get('renderer').labels.template.setAll({
    fill: am5.color(0x5f6a82),
    fontSize: 11,
  });

  const xAxis = chart.xAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererX.new(root, {}),
      min: 0,
      strictMinMax: false,
      extraMax: 0.15,
    }),
  );

  xAxis.get('renderer').labels.template.setAll({
    fill: am5.color(0x7a849b),
    fontSize: 10,
  });

  const series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      xAxis,
      yAxis,
      valueXField: 'count',
      categoryYField: 'category',
      sequencedInterpolation: true,
      tooltip: am5.Tooltip.new(root, { labelText: '{categoryY}: {valueX}' }),
    }),
  );

  series.columns.template.setAll({
    height: am5.percent(58),
    cornerRadiusTR: 8,
    cornerRadiusBR: 8,
    strokeOpacity: 0,
    fill: am5.color(0x4b6bff),
  });

  yAxis.data.setAll(categoryChartData.value);
  series.data.setAll(categoryChartData.value);
}

function renderClarityChart(): void {
  if (!clarityChartEl.value || !clarityBestByCategoryChartData.value.length) {
    return;
  }

  clarityChartRoot?.dispose();

  const minHeight = Math.max(160, clarityBestByCategoryChartData.value.length * 34 + 24);
  clarityChartEl.value.style.height = `${minHeight}px`;

  const root = am5.Root.new(clarityChartEl.value);
  clarityChartRoot = root;
  root.setThemes([am5themes_Animated.new(root)]);

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: 'none',
      wheelY: 'none',
      layout: root.verticalLayout,
    }),
  );

  const yAxis = chart.yAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: 'category',
      renderer: am5xy.AxisRendererY.new(root, { minGridDistance: 10 }),
    }),
  );

  const xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
    renderer: am5xy.AxisRendererX.new(root, {}),
    min: 0,
    max: 100,
    strictMinMax: true,
  }));

  yAxis.get('renderer').labels.template.setAll({ fontSize: 10, fill: am5.color(0x5f6a82) });
  xAxis.get('renderer').labels.template.setAll({ fontSize: 10, fill: am5.color(0x7a849b) });

  const series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      xAxis,
      yAxis,
      valueXField: 'maxClarity',
      categoryYField: 'category',
      sequencedInterpolation: true,
      tooltip: am5.Tooltip.new(root, { labelText: '{categoryY}: {valueX}/100 (best)' }),
    }),
  );

  series.columns.template.setAll({
    height: am5.percent(60),
    cornerRadiusTR: 8,
    cornerRadiusBR: 8,
    strokeOpacity: 0,
    fill: am5.color(0x4f8cff),
  });

  yAxis.data.setAll(clarityBestByCategoryChartData.value);
  series.data.setAll(clarityBestByCategoryChartData.value);
}

function renderRelevanceChart(): void {
  if (!relevanceChartEl.value || !relevanceBestByCategoryChartData.value.length) {
    return;
  }

  relevanceChartRoot?.dispose();

  const minHeight = 220;
  relevanceChartEl.value.style.height = `${minHeight}px`;

  const root = am5.Root.new(relevanceChartEl.value);
  relevanceChartRoot = root;
  root.setThemes([am5themes_Animated.new(root)]);

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: 'none',
      wheelY: 'none',
    }),
  );

  const xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: 'category',
      renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 28 }),
    }),
  );

  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {}),
      min: 0,
      max: 100,
      strictMinMax: true,
    }),
  );

  xAxis.get('renderer').labels.template.setAll({
    fontSize: 10,
    fill: am5.color(0x5f6a82),
    rotation: -35,
    textAlign: 'end',
  });
  yAxis.get('renderer').labels.template.setAll({ fontSize: 10, fill: am5.color(0x7a849b) });

  const series = chart.series.push(
    am5xy.LineSeries.new(root, {
      xAxis,
      yAxis,
      valueYField: 'maxRelevance',
      categoryXField: 'category',
      stroke: am5.color(0x54c5a9),
      fill: am5.color(0x54c5a9),
      tooltip: am5.Tooltip.new(root, { labelText: '{categoryX}: {valueY}/100 (best)' }),
    }),
  );

  series.strokes.template.setAll({ strokeWidth: 2.6 });
  series.bullets.push(() =>
    am5.Bullet.new(root, {
      sprite: am5.Circle.new(root, {
        radius: 4,
        fill: am5.color(0x54c5a9),
        stroke: am5.color(0xffffff),
        strokeWidth: 2,
      }),
    }),
  );

  xAxis.data.setAll(relevanceBestByCategoryChartData.value);
  series.data.setAll(relevanceBestByCategoryChartData.value);
}

function renderCoherenceChart(): void {
  if (!coherenceChartEl.value || !coherenceBestByCategoryChartData.value.length) {
    return;
  }

  coherenceChartRoot?.dispose();

  coherenceChartEl.value.style.height = `260px`;

  const root = am5.Root.new(coherenceChartEl.value);
  coherenceChartRoot = root;
  root.setThemes([am5themes_Animated.new(root)]);

  const chart = root.container.children.push(
    am5radar.RadarChart.new(root, {
      panX: false,
      panY: false,
      wheelX: 'none',
      wheelY: 'none',
      innerRadius: am5.percent(15),
    }),
  );

  const xRenderer = am5radar.AxisRendererCircular.new(root, {});
  xRenderer.labels.template.setAll({ fontSize: 10, fill: am5.color(0x5f6a82) });

  const xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: 'category',
      renderer: xRenderer,
    }),
  );

  const yRenderer = am5radar.AxisRendererRadial.new(root, {});
  yRenderer.labels.template.setAll({ fontSize: 10, fill: am5.color(0x7a849b) });

  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      min: 0,
      max: 100,
      strictMinMax: true,
      renderer: yRenderer,
    }),
  );

  const series = chart.series.push(
    am5radar.RadarLineSeries.new(root, {
      xAxis,
      yAxis,
      valueYField: 'maxCoherence',
      categoryXField: 'category',
      stroke: am5.color(0xf6b73c),
      fill: am5.color(0xf6b73c),
      tooltip: am5.Tooltip.new(root, { labelText: '{categoryX}: {valueY}/100 (best)' }),
    }),
  );

  series.strokes.template.setAll({ strokeWidth: 2.4 });
  series.fills.template.setAll({ visible: true, fillOpacity: 0.18 });
  series.bullets.push(() =>
    am5.Bullet.new(root, {
      sprite: am5.Circle.new(root, {
        radius: 4,
        fill: am5.color(0xf6b73c),
        stroke: am5.color(0xffffff),
        strokeWidth: 2,
      }),
    }),
  );

  xAxis.data.setAll(coherenceBestByCategoryChartData.value);
  series.data.setAll(coherenceBestByCategoryChartData.value);
}

function renderCompletenessChart(): void {
  if (!completenessChartEl.value || !completenessBestByCategoryChartData.value.length) {
    return;
  }

  completenessChartRoot?.dispose();

  completenessChartEl.value.style.height = `260px`;

  const root = am5.Root.new(completenessChartEl.value);
  completenessChartRoot = root;
  root.setThemes([am5themes_Animated.new(root)]);

  const chart = root.container.children.push(
    am5percent.PieChart.new(root, {
      innerRadius: am5.percent(55),
      layout: root.verticalLayout,
    }),
  );

  const series = chart.series.push(
    am5percent.PieSeries.new(root, {
      valueField: 'maxCompleteness',
      categoryField: 'category',
      tooltip: am5.Tooltip.new(root, { labelText: '{category}: {value}/100 (best)' }),
    }),
  );

  series.labels.template.setAll({ fontSize: 10, fill: am5.color(0x5f6a82) });
  series.ticks.template.setAll({ strokeOpacity: 0.15 });
  series.slices.template.setAll({ strokeOpacity: 0, cornerRadius: 6 });

  series.data.setAll(completenessBestByCategoryChartData.value);
}

function renderCharts(): void {
  renderTrendChart();
  renderCategoryChart();
  renderClarityChart();
  renderRelevanceChart();
  renderCoherenceChart();
  renderCompletenessChart();
}

async function loadMetricResults(userId: string): Promise<void> {
  try {
    // Try new endpoint first
    metricResults.value = await fetchResultsByUserRequest(userId);
  } catch (error) {
    console.error('Failed to fetch metric results from /api/results/by-user, trying per-experiment fallback:', error);
    // Fallback: fetch results per experiment
    try {
      const allResults: ExperimentResultRow[] = [];
      for (const exp of experiments.value) {
        const expResults = await fetchResultsByExperimentRequest(userId, exp._id);
        allResults.push(...expResults);
      }
      // Sort by createdAt descending
      metricResults.value = allResults.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (fallbackError) {
      console.error('Fallback fetch also failed:', fallbackError);
      metricResults.value = [];
    }
  }
}

async function loadExperiments(userId: string): Promise<void> {
  try {
    experiments.value = await fetchExperimentsRequest(userId);
  } catch (error) {
    console.error('Failed to fetch experiments for dashboard:', error);
    experiments.value = [];
  }
}

async function loadDashboardSummary(userId: string): Promise<void> {
  try {
    const response = await fetchResultsSummaryRequest(userId);
    dashboardSummary.value = {
      experimentsRun: response.experimentsRun,
      avgQualityScore: response.avgQualityScore,
      topCategories: response.topCategories,
    };
  } catch (error) {
    console.error('Failed to fetch dashboard summary:', error);
    dashboardSummary.value = {
      experimentsRun: 0,
      avgQualityScore: null,
      topCategories: [],
    };
  }
}

onMounted(async () => {
  let resolvedUserId = appStore.state.user?.id || '';
  if (!resolvedUserId && appStore.state.user?.email) {
    try {
      const userData = await fetchUserByEmailRequest(appStore.state.user.email);
      resolvedUserId = userData.user?.id || '';
    } catch {
      resolvedUserId = '';
    }
  }

  try {
    const response = await fetchPrompts({ limit: 1, offset: 0 });
    totalPrompts.value = response.total;
  } catch (error) {
    console.error('Failed to fetch prompts count:', error);
  }

  if (resolvedUserId) {
    await loadExperiments(resolvedUserId);
    await loadDashboardSummary(resolvedUserId);
    await loadMetricResults(resolvedUserId);
  } else {
    experiments.value = [];
    metricResults.value = [];
  }

  await nextTick();
  renderCharts();
});

watch(
  [
    metricDailyData,
    clarityBestByCategoryData,
    relevanceBestByCategoryData,
    coherenceBestByCategoryData,
    completenessBestByCategoryData,
    trendResponseData,
    categoryChartData,
    coherenceBandData,
    avgCompleteness,
  ],
  async () => {
  await nextTick();
  renderCharts();
  },
);

onBeforeUnmount(() => {
  disposeCharts();
});
</script>
