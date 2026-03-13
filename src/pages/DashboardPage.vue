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
        <div class="row dashboard-main-grid">
          <div class="col-lg-9">
            <div class="dashboard-mosaic">
              <ProfileCard :avgQualityDisplay="avgQualityDisplay" />
              <ClarityCard
                :clarityBestByCategoryData="clarityBestByCategoryChartData"
                :onChartEl="setClarityChartEl"
              />
              <RelevanceCard
                :relevanceBestByCategoryData="relevanceBestByCategoryChartData"
                :onChartEl="setRelevanceChartEl"
              />
              <CoherenceCard
                :coherenceBestByCategoryData="coherenceBestByCategoryChartData"
                :onChartEl="setCoherenceChartEl"
              />
              <CompletenessCard
                :completenessBestByCategoryData="completenessBestByCategoryChartData"
                :onChartEl="setCompletenessChartEl"
              />
            </div>

            <!-- Focusing Section: Response Time Trend -->
            <TrendCard :trendResponseData="trendResponseData" :onChartEl="setTrendChartEl" />
          </div>

          <div class="col-lg-3 ps-0">
            <!-- <article class="card border-0 shadow-sm dashboard-side-card mb-2">
              <div class="card-body">
                <h2 class="h6 mb-2 fw-semibold">Project Completed</h2>
                <div class="dashboard-project-completed-stats">
                  <div class="dashboard-project-donut">
                    <div class="dashboard-donut" style="width:100px;height:100px;border-radius:50%;background:conic-gradient(#4b6bff 0% 50%, #ffbfae 50% 75%, #e6edff 75% 100%);"></div>
                  </div>
                  <div class="dashboard-project-legend mt-3">
                    <div><span class="dot done"></span> Project Done 50%</div>
                    <div><span class="dot progress"></span> In Progress 25%</div>
                    <div><span class="dot backlog"></span> Backlog 15%</div>
                  </div>
                </div>
              </div>
            </article> -->
            
            <ProjectCompletedModernDonut class="mb-2" />

            <TopCategoriesCard :topCategories="topCategories" :onChartEl="setCategoryChartEl" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import ProfileCard from '../components/dashboard/ProfileCard.vue';
import ClarityCard from '../components/dashboard/ClarityCard.vue';
import RelevanceCard from '../components/dashboard/RelevanceCard.vue';
import CoherenceCard from '../components/dashboard/CoherenceCard.vue';
import CompletenessCard from '../components/dashboard/CompletenessCard.vue';
import TrendCard from '../components/dashboard/TrendCard.vue';
import TopCategoriesCard from '../components/dashboard/TopCategoriesCard.vue';
import ProjectCompletedModernDonut from '../components/ProjectCompletedModernDonut.vue';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';
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
const trendChartEl: Ref<HTMLElement | null> = ref(null);
const categoryChartEl: Ref<HTMLElement | null> = ref(null);
const clarityChartEl: Ref<HTMLElement | null> = ref(null);
const relevanceChartEl: Ref<HTMLElement | null> = ref(null);
const coherenceChartEl: Ref<HTMLElement | null> = ref(null);
const completenessChartEl: Ref<HTMLElement | null> = ref(null);
let trendChartRoot: am5.Root | null = null;
let categoryChartRoot: am5.Root | null = null;
let clarityChartRoot: am5.Root | null = null;
let relevanceChartRoot: am5.Root | null = null;
let coherenceChartRoot: am5.Root | null = null;
let completenessChartRoot: am5.Root | null = null;

function setTrendChartEl(el: HTMLElement | null): void {
  trendChartEl.value = el;
}

function setCategoryChartEl(el: HTMLElement | null): void {
  categoryChartEl.value = el;
}

function setClarityChartEl(el: HTMLElement | null): void {
  clarityChartEl.value = el;
}

function setRelevanceChartEl(el: HTMLElement | null): void {
  relevanceChartEl.value = el;
}

function setCoherenceChartEl(el: HTMLElement | null): void {
  coherenceChartEl.value = el;
}

function setCompletenessChartEl(el: HTMLElement | null): void {
  completenessChartEl.value = el;
}
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

// Daily metrics computed property
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


// Limit for best-by-category charts
const bestByCategoryChartLimit = 7;

// Helper: get best by category for a metric
function getBestByCategoryData(metricKey: 'clarity' | 'relevance' | 'coherence' | 'completeness') {
  const categoryMap = new Map();
  for (const result of metricResults.value) {
    const cat = result.category || 'Uncategorized';
    const score = result[metricKey] || 0;
    if (!categoryMap.has(cat) || score > categoryMap.get(cat)) {
      categoryMap.set(cat, score);
    }
  }
  return Array.from(categoryMap.entries())
    .map(([category, maxValue]) => ({ category, [`max${metricKey.charAt(0).toUpperCase() + metricKey.slice(1)}`]: maxValue }))
    .sort((a, b) => b[`max${metricKey.charAt(0).toUpperCase() + metricKey.slice(1)}`] - a[`max${metricKey.charAt(0).toUpperCase() + metricKey.slice(1)}`]);
}

const clarityBestByCategoryData = computed(() => getBestByCategoryData('clarity'));
const relevanceBestByCategoryData = computed(() => getBestByCategoryData('relevance'));
const coherenceBestByCategoryData = computed(() => getBestByCategoryData('coherence'));
const completenessBestByCategoryData = computed(() => getBestByCategoryData('completeness'));

const clarityBestByCategoryChartData = computed(() => clarityBestByCategoryData.value.slice(0, bestByCategoryChartLimit));
const relevanceBestByCategoryChartData = computed(() =>
  relevanceBestByCategoryData.value.slice(0, bestByCategoryChartLimit),
);
const coherenceBestByCategoryChartData = computed(() =>
  coherenceBestByCategoryData.value.slice(0, bestByCategoryChartLimit),
);

// Trend response data for the chart
const trendResponseData = computed(() => {
  return metricDailyData.value.map(item => ({
    timestamp: item.day,
    responseTimeMs: item.responseTimeMs,
    clarity: item.clarity,
    relevance: item.relevance,
    completeness: item.completeness,
  }));
});

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
  if (!trendChartEl.value) {
    return;
  }
  if (!trendResponseData.value.length) {
    return;
  }

  try {
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
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: 'timestamp',
        renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 50, opposite: false }),
      })
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
      })
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
      })
    );
    series.strokes.template.setAll({ strokeWidth: 2.8 });
    series.bullets.push(() =>
      am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 3,
          fill: am5.color(0x4b6bff),
        }),
      })
    );

    xAxis.data.setAll(trendResponseData.value);
    series.data.setAll(trendResponseData.value);
  } catch (error) {
    console.error('Error rendering trend chart:', error);
  }
}

function renderCategoryChart(): void {
  if (!categoryChartEl.value) {
    return;
  }
  if (!categoryChartData.value.length) {
    return;
  }

  try {
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
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: 'category',
        renderer: am5xy.AxisRendererY.new(root, { minGridDistance: 12 }),
      })
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
      })
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
      })
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
  } catch (error) {
    console.error('Error rendering category chart:', error);
  }
}

function renderClarityChart(): void {
  if (!clarityChartEl.value) {
    return;
  }
  if (!clarityBestByCategoryChartData.value.length) {
    return;
  }

  try {
    clarityChartRoot?.dispose();

    clarityChartEl.value.style.height = `280px`;

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
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: 'category',
        renderer: am5xy.AxisRendererY.new(root, { minGridDistance: 10 }),
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererX.new(root, {}),
        min: 0,
        max: 100,
        strictMinMax: true,
      })
    );

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
      })
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
  } catch (error) {
    console.error('Error rendering clarity chart:', error);
  }
}

function renderRelevanceChart(): void {
  if (!relevanceChartEl.value || !relevanceBestByCategoryChartData.value.length) {
    return;
  }

  relevanceChartRoot?.dispose();

  relevanceChartEl.value.style.height = `280px`;

  const root = am5.Root.new(relevanceChartEl.value);
  relevanceChartRoot = root;
  root.setThemes([am5themes_Animated.new(root)]);

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: 'none',
      wheelY: 'none',
    })
  );

  const xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: 'category',
      renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 28 }),
    })
  );

  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {}),
      min: 0,
      max: 100,
      strictMinMax: true,
    })
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
    })
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
    })
  );

  xAxis.data.setAll(relevanceBestByCategoryChartData.value);
  series.data.setAll(relevanceBestByCategoryChartData.value);
}

function renderCoherenceChart(): void {
  if (!coherenceChartEl.value || !coherenceBestByCategoryChartData.value.length) {
    return;
  }

  coherenceChartRoot?.dispose();

  coherenceChartEl.value.style.height = `340px`;

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
    })
  );

  const xRenderer = am5radar.AxisRendererCircular.new(root, {});
  xRenderer.labels.template.setAll({ fontSize: 10, fill: am5.color(0x5f6a82) });

  const xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: 'category',
      renderer: xRenderer,
    })
  );

  const yRenderer = am5radar.AxisRendererRadial.new(root, {});
  yRenderer.labels.template.setAll({ fontSize: 10, fill: am5.color(0x7a849b) });

  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      min: 0,
      max: 100,
      strictMinMax: true,
      renderer: yRenderer,
    })
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
    })
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
    })
  );

  xAxis.data.setAll(coherenceBestByCategoryChartData.value);
  series.data.setAll(coherenceBestByCategoryChartData.value);
}

function renderCompletenessChart(): void {
  if (!completenessChartEl.value || !completenessBestByCategoryChartData.value.length) {
    return;
  }

  completenessChartRoot?.dispose();

  completenessChartEl.value.style.height = `340px`;

  const root = am5.Root.new(completenessChartEl.value);
  completenessChartRoot = root;
  root.setThemes([am5themes_Animated.new(root)]);

  const chart = root.container.children.push(
    am5percent.PieChart.new(root, {
      innerRadius: am5.percent(55),
      layout: root.verticalLayout,
    })
  );

  const series = chart.series.push(
    am5percent.PieSeries.new(root, {
      valueField: 'maxCompleteness',
      categoryField: 'category',
      tooltip: am5.Tooltip.new(root, { labelText: '{category}: {value}/100 (best)' }),
    })
  );

  series.labels.template.setAll({ forceHidden: true });
  series.ticks.template.setAll({ forceHidden: true });
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
    metricResults.value = await fetchResultsByUserRequest(userId);
  } catch (error) {
    console.error('Failed to fetch metric results from /api/results/by-user, trying per-experiment fallback:', error);
    try {
      const allResults: ExperimentResultRow[] = [];
      for (const exp of experiments.value) {
        const expResults = await fetchResultsByExperimentRequest(userId, exp._id);
        allResults.push(...expResults);
      }
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

  // Wait for DOM to fully update before rendering charts
  await nextTick();
  await nextTick();
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
  { deep: true },
);

onBeforeUnmount(() => {
  disposeCharts();
});
</script>