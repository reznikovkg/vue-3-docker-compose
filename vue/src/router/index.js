import { createWebHistory, createRouter } from 'vue-router'
import Game from "@/components/pages/Game.vue";

export const ROUTES = {
  EXAMPLE: 'EXAMPLE',
  INDEX: 'INDEX',
}

const routes = [
  {
    name: ROUTES.INDEX,
    path: '/',
    component: Game
  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})
