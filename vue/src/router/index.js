import { createWebHistory, createRouter } from 'vue-router'
import GamePage from '../components/pages/GamePage.vue'
import IndexPage from '../components/pages/IndexPage.vue'

export const ROUTES = {
  GAME: 'GAME',
  INDEX: 'INDEX',
}

const routes = [
  {
    name: ROUTES.GAME,
    path: '/game',
    component: GamePage
  },
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