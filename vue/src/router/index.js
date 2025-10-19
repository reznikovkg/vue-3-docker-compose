import { createWebHistory, createRouter } from 'vue-router'

import  IndexPage  from './../components/pages/IndexPage.vue'
import  DictophonePage  from '../components/pages/DictophonePage.vue'


export const ROUTES = {
  INDEX: 'INDEX',
  DICTOPHONE: 'DICTOPHONE'
}

const routes = [
  {
    name: ROUTES.INDEX,
    path: '/',
    component: IndexPage
  },
      {
    name: ROUTES.DICTOPHONE,
    path: '/dictophone',
    component: DictophonePage
  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})