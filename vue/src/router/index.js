import { createWebHistory, createRouter } from 'vue-router'

import IndexPage from './../components/pages/IndexPage.vue'
import ExamplePage from './../components/pages/ExamplePage.vue'
import TowerDefensePage from './../components/pages/TowerDefensePage.vue'

export const ROUTES = {
  EXAMPLE: 'EXAMPLE',
  INDEX: 'INDEX',
  TOWER_DEFENSE: 'TOWER_DEFENSE',
}

const routes = [
  {
    name: ROUTES.EXAMPLE,
    path: '/example',
    component: ExamplePage
  },
  {
    name: ROUTES.TOWER_DEFENSE,
    path: '/tower-defense',
    component: TowerDefensePage
  },
  {
    name: ROUTES.INDEX,
    path: '/',
    component: IndexPage
  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})
