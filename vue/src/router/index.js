import { createWebHistory, createRouter } from 'vue-router'

import IndexPage from './../components/pages/IndexPage.vue'
import PourGamePage from './../components/pages/PourGamePage.vue'
import ExamplePage from './../components/pages/ExamplePage.vue'

export const ROUTES = {
  EXAMPLE: 'EXAMPLE',
  INDEX: 'INDEX',
  POUR_GAME: 'POUR_GAME',
}

const routes = [
  {
    name: ROUTES.EXAMPLE,
    path: '/example',
    component: ExamplePage
  },
  {
    name: ROUTES.INDEX,
    path: '/',
    component: IndexPage
  },
  {
    name: ROUTES.POUR_GAME,
    path: '/pour-game',
    component: PourGamePage
  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})
