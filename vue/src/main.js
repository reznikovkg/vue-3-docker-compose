import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import { router, ROUTES } from '@/router/index.js'
import {auth} from "@/firebase/firebase";
import {onAuthStateChanged} from 'firebase/auth';

const routes = {
  install(app, options) {
    console.log(ROUTES)
    app.config.globalProperties.$routes = ROUTES
  }
}

store.dispatch('initAuthState')

createApp(App)
  .use(router)
  .use(routes)
  .use(store)
  .mount('#project')
