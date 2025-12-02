import { createWebHistory, createRouter } from 'vue-router'

import IndexPage  from './../components/pages/IndexPage.vue'
import DictophonePage  from '../components/pages/DictophonePage.vue'
import DictophoneEditor from "../components/pages/DictophoneEditorPage.vue";


export const ROUTES = {
  INDEX: 'INDEX',
  DICTOPHONE: 'DICTOPHONE',
  DICTOPHONE_EDITOR: 'DICTOPHONE_EDITOR'
}

const routes = [
  {
    name: ROUTES.INDEX,
    path: '/',
    component: IndexPage
  },
      {
    name: ROUTES.DICTOPHONE,
    path: '/dictophone',
    component: DictophonePage
  },
  {
    name: ROUTES.DICTOPHONE_EDITOR,
    path: '/dictophone-editor/:id',
    component: DictophoneEditor


  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})