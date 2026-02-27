import { createWebHistory, createRouter } from 'vue-router'

import AlchemyPage from './../components/pages/AlchemyPage.vue'

export const ROUTES = {
  INDEX: 'INDEX',
}

const routes = [
  {
    name: ROUTES.INDEX,
    path: '/',
    component: AlchemyPage
  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})