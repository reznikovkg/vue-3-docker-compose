import { createWebHistory, createRouter } from 'vue-router'

import IndexPage from './../components/pages/IndexPage.vue'
import RecorderPage from './../components/pages/RecorderPage.vue'
import ExamplePage from './../components/pages/ExamplePage.vue'
import EditorPage from './../components/pages/EditorPage.vue'

export const ROUTES = {
  EXAMPLE: 'EXAMPLE',
  INDEX: 'INDEX',
  RECORDER: 'RECORDER',
  EDITOR: 'EDITOR',
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
  {
    name: ROUTES.EDITOR,
    path: '/recorder/:id/edit',
    component: EditorPage
  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})
