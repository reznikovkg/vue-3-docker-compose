import { createWebHistory, createRouter } from 'vue-router';

import MainPage from '../pages/MainPage.vue';

import Layout from '@/modules/Layout.vue';
import GamePage from '@/pages/GamePage.vue';
import LevelsPage from '@/pages/LevelsPage.vue';
import RulesPage from '@/pages/RulesPage.vue';

export const ROUTES = {
  MAIN: 'MAIN',
  GAME: 'GAME',
  RULES: 'RULES',
  LEVELS: 'LEVELS',
};

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      {
        name: ROUTES.MAIN,
        path: '',
        component: MainPage,
      },
      {
        name: ROUTES.RULES,
        path: 'rules',
        component: RulesPage,
      },
      {
        name: ROUTES.LEVELS,
        path: 'game',
        component: LevelsPage,
      },
      {
        name: ROUTES.GAME,
        path: 'game/:id',
        component: GamePage,
      },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
});
