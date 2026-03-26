import { createWebHistory, createRouter } from 'vue-router'

import GamePage from '@/components/pages/GamePage.vue'

export const ROUTES = {
  GAME: '/'
}

const routes = [
  {
    path: ROUTES.GAME,
    name: 'Game',
    component: GamePage
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})