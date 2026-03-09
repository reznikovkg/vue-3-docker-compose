import { createRouter, createWebHistory } from 'vue-router'

import AppFrame from '@/components/AppFrame.vue'
import BattlePage from '@/pages/BattlePage.vue'
import HandbookPage from '@/pages/HandbookPage.vue'
import HomePage from '@/pages/HomePage.vue'
import MissionsPage from '@/pages/MissionsPage.vue'

export const ROUTES = {
  HOME: 'HOME',
  MISSIONS: 'MISSIONS',
  BATTLE: 'BATTLE',
  HANDBOOK: 'HANDBOOK',
}

const routes = [
  {
    path: '/',
    component: AppFrame,
    children: [
      {
        name: ROUTES.HOME,
        path: '',
        component: HomePage,
      },
      {
        name: ROUTES.MISSIONS,
        path: 'missions',
        component: MissionsPage,
      },
      {
        name: ROUTES.BATTLE,
        path: 'battle/:missionId',
        component: BattlePage,
      },
      {
        name: ROUTES.HANDBOOK,
        path: 'handbook',
        component: HandbookPage,
      },
    ],
  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})
