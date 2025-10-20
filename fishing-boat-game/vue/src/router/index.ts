import { createRouter, createWebHistory } from 'vue-router'
import GameView from '../views/GameView.vue'
import InventoryView from '../views/InventoryView.vue'
import FishingMinigame from '../views/FishingMinigame.vue'
import { ROUTE_GAME, ROUTE_INVENTORY, ROUTE_FISHING } from './constants'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: ROUTE_GAME,
      component: GameView
    },
    {
      path: '/inventory',
      name: ROUTE_INVENTORY,
      component: InventoryView
    },
    {
      path: '/fishing',
      name: ROUTE_FISHING,
      component: FishingMinigame
    }
  ]
})

export default router
