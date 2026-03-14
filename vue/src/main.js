import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import { router, ROUTES } from '@/router/index.js'

const routes = {
  install(app) {
    console.log(ROUTES)
    app.config.globalProperties.$routes = ROUTES
  },
}

const mountApp = () =>
  createApp(App).use(router).use(routes).use(store).mount('#project')

store
  .dispatch('progress/bootstrapProgress')
  .catch((error) => {
    console.error('Failed to bootstrap progress', error)
  })
  .finally(() => {
    mountApp()
  })
