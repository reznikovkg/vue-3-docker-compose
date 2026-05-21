import { createWebHistory, createRouter } from 'vue-router'

import WaterSortPage from "@/components/pages/WaterSortPage.vue";

export const ROUTES = {
  WATERSORT: 'WATERSORT'
}

const routes = [
  {
    name: ROUTES.WATERSORT,
    path: '/',
    component: WaterSortPage
  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})