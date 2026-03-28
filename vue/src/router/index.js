import { createWebHistory, createRouter } from 'vue-router'

import IndexPage from './../components/pages/IndexPage.vue'
import ExamplePage from './../components/pages/ExamplePage.vue'
import TagGamePage from "@/components/pages/TagGamePage.vue"
import RecordsPage from "@/components/pages/RecordsPage.vue"

export const ROUTES = {
  EXAMPLE: 'EXAMPLE',
  INDEX: 'INDEX',
  TAG_GAME: 'TAG_GAME',
  RECORDS: 'RECORDS'
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
    name: ROUTES.TAG_GAME,
    path: '/game',
    component: TagGamePage
  },
  {
    name: ROUTES.RECORDS,
    path: '/records',
    component: RecordsPage
  }
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})
