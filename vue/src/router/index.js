import { createWebHistory, createRouter } from 'vue-router'
import { getLocations } from '../content/locations'
import HomePage from './../components/pages/HomePage.vue'
import FishingPage from '@/components/pages/FishingPage.vue'

export const ROUTES = {
  EXAMPLE: 'EXAMPLE',
  HOME: 'HOME',
}

const routes = [
  {
    name: ROUTES.HOME,
    path: '/',
    component: HomePage
  },
  {
    path: '/location/:id',
    name: 'FishingLocation',
    component: FishingPage,
    props: (route) => {
      const location = getLocations().find(loc => loc.id == route.params.id)
      if (!location) {
        route.router.push("/")
      }
      return { location }
    },
    beforeEnter: (to, from, next) => {
      const location = getLocations().find(loc => loc.id == to.params.id)
      if (!location) {
        next({ name: ROUTES.HOME })
      } else {
        next()
      }
    }
  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})