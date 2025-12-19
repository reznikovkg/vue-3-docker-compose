import { createWebHistory, createRouter } from 'vue-router'

import IndexPage from './../components/pages/IndexPage.vue'
import BubbleGamePage from '../components/pages/BubbleGamePage.vue'

export const ROUTES = {
  INDEX: 'INDEX',
  BUBBLE_GAME: 'BUBBLE_GAME',
}

const routes = [
  {
    name: ROUTES.INDEX,
    path: '/',
    component: IndexPage
  },
  {
    name: ROUTES.BUBBLE_GAME,
    path: '/bubble-game',
    component: BubbleGamePage
  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})