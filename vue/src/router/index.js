import { createWebHistory, createRouter } from 'vue-router'

import IndexPage from './../components/pages/IndexPage.vue'
import SettingPage from './../components/pages/SettingPage.vue'
import RecordPage from './../components/pages/RecordPage.vue'

export const ROUTES = {
  SETTING: 'SETTING',
  INDEX: 'INDEX',
  RECORD: 'RECORD'
}

const routes = [
  {
    name: ROUTES.SETTING,
    path: '/setting',
    component: SettingPage
  },
  {
    name: ROUTES.RECORD,
    path: '/record',
    component: RecordPage
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