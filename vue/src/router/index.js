import { createWebHistory, createRouter } from 'vue-router';

import IndexPage from '@/components/pages/IndexPage.vue';
import FishingPage from '@/components/pages/FishingPage.vue';

export const ROUTES = {
  FISHING: 'FISHING',
  INDEX: 'INDEX',
};

const routes = [
  {
    name: ROUTES.FISHING,
    path: '/fishing',
    component: FishingPage,
  },
  {
    name: ROUTES.INDEX,
    path: '/',
    component: IndexPage,
  },
];

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
});
