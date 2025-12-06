import { createApp, type App as VueApp, type Plugin } from 'vue';

import App from './App.vue';
import store from './store';

import { router, ROUTES } from '@/router';

import './styles/index.scss';

const routes: Plugin = {
  install(app: VueApp) {
    app.config.globalProperties.$routes = ROUTES;
  },
};

createApp(App).use(router).use(routes).use(store).mount('#project');
