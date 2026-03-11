import { createWebHistory, createRouter } from 'vue-router'

import IndexPage from './../components/pages/IndexPage.vue'
import LocationsPage from './../components/pages/LocationsPage.vue'
import FishingPage from './../components/pages/FishingPage.vue'
import ShopPage from './../components/pages/ShopPage.vue'
import InventoryPage from './../components/pages/InventoryPage.vue'

export const ROUTES = {
  INDEX: 'INDEX',
  LOCATIONS: 'LOCATIONS',
  FISHING: 'FISHING',
  SHOP: 'SHOP',
  INVENTORY: 'INVENTORY'
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
  {
    name: ROUTES.SHOP,
    path: '/shop',
    component: ShopPage
  },
  {
    name: ROUTES.INVENTORY,
    path: '/inventory',
    component: InventoryPage
  }
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})