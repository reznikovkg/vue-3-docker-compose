import { createWebHistory, createRouter } from 'vue-router'
import IndexPage from './../components/pages/IndexPage.vue'
import GamingPage from './../components/pages/GamingPage.vue'

export const ROUTES = {
  INDEX: 'INDEX',
  GAME: 'GAME',
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
    component: GamingPage
  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})