import { createWebHistory, createRouter } from 'vue-router'
import GamePage from './../components/pages/GamePage.vue'
import EditorPage from './../components/pages/EditorPage.vue'

export const ROUTES = {
  EDITOR: 'EDITOR',
  GAME: 'GAME'
}

const routes = [
  {
    name: ROUTES.EDITOR,
    path: '/',
    component: EditorPage
  },
  {
    name: ROUTES.GAME,
    path: '/game',
    component: GamePage
  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})
