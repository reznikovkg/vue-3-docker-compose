import { createWebHistory, createRouter } from 'vue-router'
import Game from '@/components/Game.vue'

export const ROUTES = {
  GAME: 'game',
}

const routes = [
  {
    path: '/',
    name: ROUTES.GAME,
    component: Game,
    props: { rows: 20, columns: 10 }  // Передаем props через роутер
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})