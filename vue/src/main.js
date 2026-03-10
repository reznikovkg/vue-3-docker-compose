import './assets/main.scss'

import { createApp } from 'vue'

import App from './App.vue'
import { router, ROUTES } from '@/router'
import store from './store'

const routesPlugin = {
  install(app) {
    app.config.globalProperties.$routes = ROUTES
  },
}

createApp(App).use(router).use(routesPlugin).use(store).mount('#project')
