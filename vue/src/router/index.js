import { createWebHistory, createRouter } from 'vue-router'

import IndexPage from './../components/pages/IndexPage.vue'
//import ExamplePage from './../components/pages/ExamplePage.vue'
import GamingPage from './../components/pages/GamingPage.vue'
//import PromPage from './../components/pages/PromPage.vue'

export const ROUTES = {
  //EXAMPLE: 'EXAMPLE',
  INDEX: 'INDEX',
  GAME: 'GAME',
  //PROM: 'PROM',
}

const routes = [
  // {
  //   name: ROUTES.EXAMPLE,
  //   path: '/example',
  //   component: ExamplePage
  // },
  {
    name: ROUTES.INDEX,
    path: '/',
    component: IndexPage
  },
  {
    name: ROUTES.GAME,
    path: '/game',
    //path: '/',
    component: GamingPage
  },
  // {
  //   name: ROUTES.PROM,
  //   path: '/prom',
  //   component: PromPage
  // },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})