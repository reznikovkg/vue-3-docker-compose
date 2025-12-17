import { createWebHistory, createRouter, RouteRecordRaw } from 'vue-router'
import IndexPage from '@/components/pages/IndexPage.vue'

export const ROUTES = {
  INDEX: 'INDEX',
} as const

const routes: RouteRecordRaw[] = [
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