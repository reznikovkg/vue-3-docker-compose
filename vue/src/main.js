import './assets/main.css'

import { createApp } from 'vue'
import { createStore } from 'vuex'
import App from './App.vue'
import puzzle from './store/puzzle'
import { router, ROUTES } from '@/router/index.js'

const routes = {
  install(app, options) {
    console.log(ROUTES)
    app.config.globalProperties.$routes = ROUTES
  }
}

const store = createStore({
  modules: {
    puzzle,
  },
})

createApp(App)
    .use(router)
    .use(routes)
    .use(store)
    .mount('#project')
