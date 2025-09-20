import { createWebHistory, createRouter } from 'vue-router'

import HomeView from './../components/HelloWorld.vue'
import AboutView from './../components/TheWelcome.vue'
import WelcomeItem from './../components/WelcomeItem.vue'

const routes = [
  { path: '/about', component: AboutView },
  { path: '/t/:id', component: WelcomeItem },
  { path: '/', component: HomeView },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})