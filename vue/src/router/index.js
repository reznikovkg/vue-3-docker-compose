import { createWebHistory, createRouter } from 'vue-router'

import App from "@/App.vue";

export const ROUTES = {
  EXAMPLE: 'EXAMPLE',
  INDEX: 'INDEX',
}

const routes = [
  {
    name: ROUTES.INDEX,
    path: '/',
    component: App
  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})