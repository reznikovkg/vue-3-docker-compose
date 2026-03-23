import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/components/pages/HomePage.vue'
import LevelsPage from '@/components/pages/LevelsPage.vue'
import TowerDefensePage from '@/components/pages/TowerDefensePage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage
  },
  {
    path: '/levels',
    name: 'levels',
    component: LevelsPage
  },
  {
    path: '/level/:levelKey',
    name: 'tower-defense',
    component: TowerDefensePage,
    props: true
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})