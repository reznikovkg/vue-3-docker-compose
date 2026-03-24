import { createWebHistory, createRouter } from 'vue-router'

import IndexPage from './../components/pages/IndexPage.vue'
import ExamplePage from './../components/pages/ExamplePage.vue'
import AlchemyPage from './../components/pages/AlchemyPage.vue'

export const ROUTES = {
  EXAMPLE: 'EXAMPLE',
  INDEX: 'INDEX',
  ALCHEMY: 'ALCHEMY',
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
    name: ROUTES.ALCHEMY, 
    path: '/alchemy', 
    component: AlchemyPage
  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})