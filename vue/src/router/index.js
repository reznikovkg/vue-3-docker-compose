import { createRouter, createWebHistory } from 'vue-router'
import IndexPage from '@/components/pages/IndexPage.vue'
import ExamplePage from '@/components/pages/ExamplePage.vue'

const routes = [
  {
    path: '/',
    name: 'index',
    component: IndexPage,
  },
  {
    path: '/game',
    name: 'game',
    component: ExamplePage,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
