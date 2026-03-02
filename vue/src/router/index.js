import { createWebHistory, createRouter } from 'vue-router'

import TowerDefensePage from './../components/pages/TowerDefensePage.vue'

export const ROUTES = {
  TOWER_DEFENSE: 'TOWER_DEFENSE',
}

const routes = [
  {
    name: ROUTES.TOWER_DEFENSE,
    path: '/',
    component: TowerDefensePage
  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})
