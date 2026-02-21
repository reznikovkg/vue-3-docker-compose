import { createWebHistory, createRouter } from 'vue-router'

import IndexPage from './../components/pages/IndexPage.vue'
import ExamplePage from './../components/pages/ExamplePage.vue'
import CounterAndButtonPage from './../components/pages/CounterAndButtonPage.vue'

export const ROUTES = {
  COUNTERANDBUTTON: 'COUNTERANDBUTTON',
  EXAMPLE: 'EXAMPLE',
  INDEX: 'INDEX',
}

const routes = [
  {
    name: ROUTES.COUNTERANDBUTTON,
    path: '/counterbutton',
    component: CounterAndButtonPage
  },
  {
    name: ROUTES.EXAMPLE,
    path: '/example',
    component: ExamplePage
  },
  {
    name: ROUTES.INDEX,
    path: '/',
    component: IndexPage
  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})