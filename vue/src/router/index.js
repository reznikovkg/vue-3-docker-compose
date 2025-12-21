import { createWebHistory, createRouter } from 'vue-router'

import IndexPage  from './../components/pages/IndexPage.vue'
import GamePage from "../components/pages/GamePage.vue";

export const ROUTES = {
  INDEX: 'INDEX',
  GAME_PAGE:'GAME_PAGE'
}

const routes = [
  {
    name: ROUTES.INDEX,
    path: '/',
    component: IndexPage
  },
  {
    name: ROUTES.GAME_PAGE,
    path: '/game',
    component: GamePage,
    props: true

  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})