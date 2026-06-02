import { createWebHistory, createRouter } from 'vue-router'
import MainMenuPage from './../components/pages/MainMenuPage.vue'
import GamePage from './../components/pages/GamePage.vue'
import OptionPage from './../components/pages/OptionPage.vue'
export const ROUTES = {
  MENU: 'MENU',
  GAME: 'GAME',
  OPTIONS: 'OPTIONS',
}
const routes = [
  {
    name: ROUTES.MENU,
    path: '/',
    component: MainMenuPage
  },
  {
    name: ROUTES.GAME,
    path: '/game',
    component: GamePage
  },
  {
    name: ROUTES.OPTIONS,
    path: '/options',
    component: OptionPage
  },
]
export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})