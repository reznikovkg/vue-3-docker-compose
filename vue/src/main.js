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

const app = createApp(App)

app.use(router)
app.use(routes)
app.use(store)
app.mount('#project')
