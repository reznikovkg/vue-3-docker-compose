import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import { router, ROUTES } from '@/router/index.js'

const routes = {
  install(app, options) {
    console.log(ROUTES)
    app.config.globalProperties.$routes = ROUTES
  }
}

createApp(App)
  .use(router)
  .use(routes)
  .use(store)
  .mount('#project')
