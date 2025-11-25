import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ShopPage from '../views/ShopPage.vue'
import InventoryPage from '../views/InventoryPage.vue'
import { locations } from '@/data/locations'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/location/:id',
    name: 'FishingLocation',
    component: () => import('../components/FishingArea.vue'),
    props: (route) => {
      const id = parseInt(route.params.id as string)
      const location = locations.find(loc => loc.id === id)
      return { location }
    }
  },
  {
    path: '/shop',
    name: 'ShopPage',
    component: ShopPage
  },
  {
    path: '/inventory',
    name: 'InventoryPage',
    component: InventoryPage
  },
  {
    path: '/history',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router