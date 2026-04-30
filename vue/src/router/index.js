import { createWebHistory, createRouter } from 'vue-router'
import GamePage from '@/components/pages/GamePage.vue'

export const ROUTES = {
  EXAMPLE: 'EXAMPLE',
  INDEX: 'INDEX',
  GAME: 'GAME',
}

const routes = [
  {
    name: ROUTES.GAME,
    path: '/game',
    component: GamePage
  }
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})