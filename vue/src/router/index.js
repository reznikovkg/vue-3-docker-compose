import { createRouter, createWebHistory } from 'vue-router'
import IndexPage from '../components/pages/IndexPage.vue'
import GamePage from '../components/pages/GamePage.vue'

const routes = [
  {
    path: '/',
    name: 'index',
    component: IndexPage
  },
  {
    path: '/game',
    name: 'game',
    component: GamePage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router