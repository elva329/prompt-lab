import { createRouter, createWebHistory } from 'vue-router';

import AppLayout from '../components/AppLayout.vue';
import DashboardPage from '../pages/DashboardPage.vue';
import ExperimentRunnerPage from '../pages/ExperimentRunnerPage.vue';
import LandingPage from '../pages/LandingPage.vue';
import LoginPage from '../pages/LoginPage.vue';
import NotFoundPage from '../pages/NotFoundPage.vue';
import PromptsPage from '../pages/PromptsPage.vue';
import { appStore } from '../stores/appStore';

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', name: 'landing', component: LandingPage },
      { path: 'login', name: 'login', component: LoginPage },
      { path: 'dashboard', name: 'dashboard', component: DashboardPage, meta: { requiresAuth: true } },
      { path: 'prompts', name: 'prompts', component: PromptsPage, meta: { requiresAuth: true } },
      {
        path: 'experiments',
        name: 'experiments',
        redirect: { name: 'dashboard' },
        meta: { requiresAuth: true },
      },
      {
        path: 'experiments/:id',
        name: 'experiment-runner',
        component: ExperimentRunnerPage,
        meta: { requiresAuth: true },
      },
      { path: ':pathMatch(.*)*', name: 'not-found', component: NotFoundPage },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !appStore.isAuthenticated.value) {
    return { name: 'login' };
  }

  return true;
});
