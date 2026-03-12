import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

const mount = () => {
  store.dispatch('loadLevel', 1)
  createApp(App)
    .use(router)
    .use(store)
    .mount('#project')
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount)
} else {
  mount()
}