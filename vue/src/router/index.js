import { createWebHistory, createRouter } from 'vue-router'

import IndexPage  from './../components/pages/IndexPage.vue'
import DictophonePage  from '../components/pages/DictophonePage.vue'
import DictophoneEditor from "../components/pages/DictophoneEditorPage.vue";
import GamePage from "../components/pages/GamePage.vue";

export const ROUTES = {
  INDEX: 'INDEX',
  DICTOPHONE: 'DICTOPHONE',
  DICTOPHONE_EDITOR: 'DICTOPHONE_EDITOR',
  GAME_PAGE:'GAME_PAGE'
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
    component: DictophoneEditor,
    props: true

  },
  {
    name: ROUTES.GAME_PAGE,
    path: '/game',
    component: GamePage,
    props: true

  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})