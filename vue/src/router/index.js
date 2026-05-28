import { createWebHistory, createRouter } from 'vue-router'

import IndexPage from './../components/pages/IndexPage.vue'
import ExamplePage from './../components/pages/ExamplePage.vue'
import PromPage from './../components/pages/PromPage.vue'
import FigureEditorPage from './../components/pages/FigureEditorPage.vue'

export const ROUTES = {
  EXAMPLE: 'EXAMPLE',
  INDEX: 'INDEX',
  PROM: 'PROM',
  EDITOR: 'EDITOR',
}

const routes = [
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
  {
    name: ROUTES.PROM,
    path: '/prom',
    component: PromPage
  },
  {
    name: ROUTES.EDITOR,
    path: '/editor',
    component: FigureEditorPage
  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})
