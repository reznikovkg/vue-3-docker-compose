import { createWebHistory, createRouter } from 'vue-router'

//import IndexPage from '../components/pages/Alchemist.vue'
//import ExamplePage from './../components/pages/ExamplePage.vue'
import Alchemist from '../components/pages/Alchemist.vue'

export const ROUTES = {
  ALCHEMMIST:'ALCHEMIST',
  
}

const routes = [
  {
    name: ROUTES.ALCHEMIST,
    path: '/',
    component: Alchemist
  }
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})