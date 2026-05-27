import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router' 
import store from './store'

//const app = createApp(App) 
 
createApp(App)
  .use(router)
  //.use(routes)
  .use(store)
  .mount('#app')
