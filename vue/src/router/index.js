import { createWebHistory, createRouter } from 'vue-router'

import IndexPage from './../components/pages/IndexPage.vue'
import LocationsPage from './../components/pages/LocationsPage.vue'
import FishingPage from './../components/pages/FishingPage.vue'

export const ROUTES = {
  INDEX: 'INDEX',
  LOCATIONS: 'LOCATIONS',
  FISHING: 'FISHING',
}

const routes = [
  {
    name: ROUTES.INDEX,
    path: '/',
    component: IndexPage
  },
  {
    name: ROUTES.LOCATIONS,
    path: '/locations',
    component: LocationsPage
  },
  {
    name: ROUTES.FISHING,
    path: '/fishing/:locationId',
    component: FishingPage
  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})