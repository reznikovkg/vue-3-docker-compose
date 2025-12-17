import './assets/main.css'

import { createApp, App } from 'vue'
import AppComponent from './App.vue'
import store from './store'
import { router, ROUTES } from '@/router/index'

const routes = {
  install(app: App) {
    app.config.globalProperties.$routes = ROUTES
  }
}

createApp(AppComponent)
  .use(router)
  .use(routes)
  .use(store)
  .mount('#project')
