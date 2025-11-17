import { createStore } from 'vuex'
import { DictophoneModule }  from './dict/dictophone.js'


export default createStore({
  modules: {
    dictophone: DictophoneModule
  },
  strict: process.env.NODE_ENV !== 'production'
})

