import { createRouter, createWebHistory } from "vue-router";
import Main from "@/components/Main.vue";
import Game from "@/components/Game.vue";

const routes = [
  {
    path: '/',
    component: Main
  },
  {
    path: '/game',
    component: Game
  }
]

const router = createRouter({
  routes,
  history: createWebHistory()
})

export default router;