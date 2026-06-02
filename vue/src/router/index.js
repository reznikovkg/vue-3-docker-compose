import { createWebHistory, createRouter } from "vue-router"

import Game from "./../components/pages/Game.vue"

export const ROUTES = {
  GAME: "GAME",
}

const routes = [
  {
    name: ROUTES.GAME,
    path: "/",
    component: Game,
  },
]

export const router = createRouter({
  history: createWebHistory("/"),
  routes,
})
