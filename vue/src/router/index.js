import { createWebHistory, createRouter } from 'vue-router'

import HomePage from '@/components/pages/HomePage.vue'
import IndexPage from '@/components/pages/IndexPage.vue'
import ExamplePage from '@/components/pages/ExamplePage.vue'

export const ROUTES = {
  HOME: 'HOME',
  GAME: 'GAME',
  RESULT: 'RESULT',
}

const routes = [
  {
    path: '/',
    redirect: { name: ROUTES.HOME }
  },
  {
    name: ROUTES.HOME,
    path: '/home',
    component: HomePage
  },

  // TODO edit to /game and /result
  {
    name: ROUTES.GAME,
    path: '/game',
    component: ExamplePage
  },
  {
    name: ROUTES.RESULT,
    path: '/result',
    component: IndexPage
  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})