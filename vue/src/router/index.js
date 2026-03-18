import { createWebHistory, createRouter } from 'vue-router'

import IndexPage from './../components/pages/IndexPage.vue'

export const ROUTES = {
  INDEX: 'INDEX',
}

const routes = [
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