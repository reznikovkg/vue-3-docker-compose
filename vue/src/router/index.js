import { createWebHistory, createRouter } from 'vue-router'

import IndexPage from '@/components/pages/IndexPage.vue'
import GamePage from '@/components/pages/GamePage.vue'
import EndPage from '@/components/pages/EndPage.vue'

export const ROUTES = {
  INDEX: 'INDEX',
  GAME: 'GAME',
  END: 'END'
}

const routes = [
  {
    name: ROUTES.INDEX,
    path: '/',
    component: IndexPage
  },
  {
    name: ROUTES.GAME,
    path: '/game',
    component: GamePage
  },
  {
    name: ROUTES.END,
    path: '/end',
    component: EndPage
  }
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})