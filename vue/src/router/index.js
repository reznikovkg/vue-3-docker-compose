import { createWebHistory, createRouter } from 'vue-router'

import GamePage from './../components/pages/GamePage.vue'
import OptionPage from './../components/pages/OptionPage.vue'
import MainMenuPage from './../components/pages/MainMenuPage.vue'


export const ROUTES = {
    GAME: 'GAME',
    OPTION: 'OPTION',
    MAINMENU: 'MAINMENU',
}

const routes = [
    {
        name: ROUTES.GAME,
        path: '/game',
        component: GamePage
    },
    {
        name: ROUTES.OPTION,
        path: '/option',
        component: OptionPage
    },
    {
        name: ROUTES.MAINMENU,
        path: '/',
        component: MainMenuPage
    },
]

export const router = createRouter({
    history: createWebHistory('/'),
    routes,
})