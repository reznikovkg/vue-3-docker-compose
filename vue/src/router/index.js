import { createWebHistory, createRouter } from 'vue-router'

import LandingPage from './../components/pages/LandingPage.vue'
import SurvivalPage from './../components/pages/SurvivalPage.vue'

export const ROUTES = {
 SURVIVAL: 'SURVIVAL',
  INDEX: 'INDEX',
}

const routes = [
  {
    name: ROUTES.SURVIVAL,
        path: '/survival',
        component: SurvivalPage
  },
  {
    name: ROUTES.INDEX,
    path: '/',
    component: LandingPage
  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})