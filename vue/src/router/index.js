import { createWebHistory, createRouter } from 'vue-router'
import GamePage from '../pages/GamePage.vue' 
 
const routes = [
  {
    path: '/', 
    name: 'Game', 
    component: GamePage, 
  },
]

const router = createRouter({ 
  history: createWebHistory(), 
  routes, 
})

export default router 