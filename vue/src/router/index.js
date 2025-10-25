import { createWebHistory, createRouter } from 'vue-router'

import IndexPage from './../components/pages/IndexPage.vue'
import RecorderPage from './../components/pages/RecorderPage.vue'
import ExamplePage from './../components/pages/ExamplePage.vue'

export const ROUTES = {
  EXAMPLE: 'EXAMPLE',
  INDEX: 'INDEX',
  RECORDER: 'RECORDER',
}

const routes = [
  {
    name: ROUTES.INDEX,
    path: '/',
    component: IndexPage
  },
  {
    name: ROUTES.RECORDER,
    path: '/recorder',
    component: RecorderPage
  },
  {
    name: ROUTES.EXAMPLE,
    path: '/example',
    component: ExamplePage
  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})
