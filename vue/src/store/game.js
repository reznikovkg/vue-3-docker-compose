import { createStore } from 'vuex'

const MUTATIONS = {
  INC_BITE: 'INC_BITE',
  SET_CASTING: 'SET_CASTING',
  SET_BITING: 'SET_BITING',
  SET_BITING_INTERVAL: 'SET_BITING_INTERVAL',
  SET_PROGRESS: 'SET_PROGRESS',
  SET_REELING: 'SET_REELING',
  SET_INTERVAL: 'SET_INTERVAL',
  CLEAR_INTERVAL: 'CLEAR_INTERVAL',
  RESET_PROGRESS: 'RESET_PROGRESS',
  SET_NOTIFICATION: 'SET_NOTIFICATION',
  SET_NOTIFICATION_INTERVAL: 'SET_NOTIFICATION_INTERVAL'
}

export default {
  namespaced: true,
  state: {
    totalBiteCount: 0,
    casting: false,
    biting: false,
    bitingInterval: null,
    progress: 0,
    isReeling: false,
    reelInterval: null,
    notification: null,
    notificationInterval: null
  },
  getters: {
    isCasting: (state) => state.casting,
    isBiting: (state) => state.biting,
    totalBiteCount: (state) => state.totalBiteCount,
    progress: (state) => state.progress,
    notification: (state) => state.notification
  },
  mutations: {
    [MUTATIONS.INC_BITE]: (state, value) => {
      state.totalBiteCount += 1
    },
    [MUTATIONS.SET_CASTING]: (state, value) => {
      state.casting = value
    },
    [MUTATIONS.SET_BITING]: (state, value) => {
      state.biting = value
    },
    [MUTATIONS.SET_BITING_INTERVAL]: (state, interval) => {
      state.bitingInterval = interval
    },
    [MUTATIONS.SET_PROGRESS]: (state, value) => {
      state.progress = value
    },
    [MUTATIONS.SET_REELING]: (state, value) => {
      state.isReeling = value
    },
    [MUTATIONS.SET_INTERVAL]: (state, intervalId) => {
      if (state.reelInterval) {
        clearInterval(state.reelInterval)
      }
      state.reelInterval = intervalId
    },
    [MUTATIONS.CLEAR_INTERVAL]: (state) => {
      if (state.reelInterval) {
        clearInterval(state.reelInterval)
        state.reelInterval = null
      }
    },
    [MUTATIONS.RESET_PROGRESS]: (state) => {
      state.progress = 0
    },
    [MUTATIONS.SET_NOTIFICATION]: (state, value) => {
      state.notification = value
    },
    [MUTATIONS.SET_NOTIFICATION_INTERVAL]: (state, value) => {
      state.notificationInterval = value
    },
  },
  actions: {
    startCasting: (store) => {
      store.commit(MUTATIONS.SET_CASTING, true)
      store.dispatch('scheduleBiting')
      store.dispatch('showNotification', {
        notification: 'Ожидание поклевки...'
      })
    },
    scheduleBiting: (store) => {
      store.dispatch('stopBiting')
      
      const nextBiteTime = Math.floor(Math.random() * 9000) + 1000
      console.log("Поклевка через " + nextBiteTime)
      const timeoutId = setTimeout(() => {
        store.dispatch('startBiting')
      }, nextBiteTime)
      store.commit(MUTATIONS.SET_BITING_INTERVAL, timeoutId)
    },
    startBiting: (store) => {
      if (!store.getters.isCasting
          || store.getters.isBiting
      ) {
        return;
      }
      store.commit(MUTATIONS.SET_PROGRESS, 0)
      store.commit(MUTATIONS.SET_BITING, true)

      const timeoutId = setTimeout(() => {
        store.dispatch('stopBiting')
      }, 10000)
      store.commit(MUTATIONS.SET_BITING_INTERVAL, timeoutId)
      
      store.dispatch('showNotification', {
        notification: 'Рыба клюет! Тяните удочку!'
      })
    },
    stopBiting: (store) => {
      if (store.state.bitingInterval) {
        store.dispatch('onFailedReeling')
        store.dispatch('resetReeling')
      }
    },
    startReeling: (store) => {
      if (store.state.isReeling) 
        return
      
      store.commit(MUTATIONS.SET_REELING, true)
      
      const intervalId = setInterval(() => {
        store.dispatch('updateProgress')
      }, 50)
      
      store.commit(MUTATIONS.SET_INTERVAL, intervalId)
    },
    updateProgress: (store) => {
      store.commit(MUTATIONS.SET_PROGRESS, store.state.progress + 2)
      const newProgress = store.state.progress
      
      if (newProgress >= 100) {
        store.commit(MUTATIONS.SET_PROGRESS, 100)
        store.dispatch('onSuccessReeling')
        store.dispatch('resetReeling')
      } else {
        store.commit(MUTATIONS.SET_PROGRESS, newProgress)
      }
    },
    stopReeling: (store) => {
      store.commit(MUTATIONS.SET_REELING, false)
      store.commit(MUTATIONS.CLEAR_INTERVAL)
    },
    resetReeling: (store) => {
      store.dispatch('stopReeling')
      store.commit(MUTATIONS.SET_PROGRESS, 0)
      store.commit(MUTATIONS.SET_CASTING, false)
      store.commit(MUTATIONS.SET_BITING, false)
      clearTimeout(store.state.bitingInterval)
      store.commit(MUTATIONS.SET_BITING_INTERVAL, null)
    },
    onSuccessReeling: (store) => {
      store.commit(MUTATIONS.INC_BITE)
      store.dispatch('showNotification', {
          notification: 'Вы поймали рыбу!'
      })
    },
    onFailedReeling: (store) => {
      store.dispatch('showNotification', {
          notification: 'Рыба сорвалась!'
      })
    },
    resetProgress: (store) => {
      store.commit(MUTATIONS.RESET_PROGRESS)
    },
    reset: (store) => {
      clearTimeout(store.state.bitingInterval)
      store.commit(MUTATIONS.SET_BITING_INTERVAL, null)
      store.commit(MUTATIONS.CLEAR_INTERVAL)
      store.commit(MUTATIONS.SET_REELING, false)
      store.commit(MUTATIONS.SET_CASTING, false)
      store.commit(MUTATIONS.SET_BITING, false)
    },
    showNotification: (store, payload) => {
      const { notification, duration = 0 } = payload
      store.commit(MUTATIONS.SET_NOTIFICATION, notification)
      if (duration > 0) {
        const intervalId = setInterval(() => {
          store.dispatch('closeNotification')
        }, duration)
        
        store.commit(MUTATIONS.SET_NOTIFICATION_INTERVAL, intervalId)
      }
    },
    closeNotification: (store) => {
      if (store.notificationInterval !== null) {
        clearTimeout(store.state.notificationInterval)
        store.commit(MUTATIONS.SET_NOTIFICATION_INTERVAL, null)
      }
      store.commit(MUTATIONS.SET_NOTIFICATION, null)
    }
  }
}