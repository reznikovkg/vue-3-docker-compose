import { createWebHistory, createRouter } from 'vue-router'

import GamePage from './../components/pages/GamePage.vue'

export const ROUTES = {
  INDEX: 'INDEX',
}

const routes = [
  {
    name: ROUTES.INDEX,
    path: '/',
    component: GamePage
  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})