import { createWebHistory, createRouter } from 'vue-router'

import GamePage from './../components/pages/GamePage.vue'

export const ROUTES = {
  GAME: 'GAME'
}

const routes = [
  {
    name: ROUTES.GAME,
    path: '/',
    component: GamePage
  }
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})