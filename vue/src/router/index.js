import { createWebHistory, createRouter } from 'vue-router'

import IndexPage from './../components/pages/IndexPage.vue'
import ExamplePage from './../components/pages/ExamplePage.vue'
import TetrisPage from './../components/pages/TetrisPage.vue'
import ShapeEditor from '@/components/pages/ShapeEditor.vue'

export const ROUTES = {
  EXAMPLE: 'EXAMPLE',
  INDEX: 'INDEX',
  TETRIS: 'TETRIS',
  EDITOR: 'EDITOR'
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
    name: ROUTES.TETRIS,
    path: '/tetris',
    component: TetrisPage
  },
  {
    name: ROUTES.EDITOR,
    path: '/editor',
    component: ShapeEditor
  }
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})