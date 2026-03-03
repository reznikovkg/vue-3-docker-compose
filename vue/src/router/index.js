import { createWebHistory, createRouter } from 'vue-router'

import IndexPage from './../components/pages/IndexPage.vue'

import BubbleGame from "@/components/BubbleGame.vue";

export const ROUTES = {
  GAME: 'GAME',
  INDEX: 'INDEX',
}

const routes = [
  {
    name: ROUTES.GAME,
    path: '/game',
    component: BubbleGame
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