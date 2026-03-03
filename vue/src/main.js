import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import './styles/game.less'

createApp(App)
  .use(store)
  .mount('#app')
