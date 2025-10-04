import { createStore } from 'vuex'
import inventory from "@/store/inventory.js";

const GAME_STATE = {
  WIN: 1,
  LOSE: -1,
  GAME: 0
}
const MUTATIONS = {
  SET_SCENES: 'SET_SCENES',
  TRY_TAKE: 'TRY_TAKE',
  TRY_ACTIVATE: 'TRY_ACTIVATE',
  MOVE_PLAYER: 'MOVE_PLAYER',
  STOP_PLAYER: 'STOP_PLAYER',
  START_LOADING: 'START_LOADING',
}

export default createStore({
  state () {
    return {
      objects: [],
      playerTransform: { x: 0, y: 0, isRun: false, toLeft: false },
      intervalId: null,
      gameState: { state: GAME_STATE.GAME, isLoading: true},
      completeCondition: null,
      backgroundName: null,
      nextLevel: 0,
      levelList: ["1", "2"],
    }
  },
  getters: {
    getSceneObjects: (state) => state.objects,
    getPlayerTransform: (state) => state.playerTransform,
    getGameState: (state) => state.gameState,
    getNextLevel: (state) => state.levelList[state.nextLevel % state.levelList.length],
    getBackgroundName: (state) => state.backgroundName,
  },
  mutations: {
    [MUTATIONS.START_LOADING](state) {
      state.gameState.isLoading = true
      state.gameState.state = GAME_STATE.GAME
    },
    [MUTATIONS.SET_SCENES]: (state, payload) => {
      state.objects = payload.objects;
      state.playerTransform = payload.playerTransform
      state.completeCondition = payload.completeCondition
      state.backgroundName = payload.background
      state.gameState.isLoading = false
      state.nextLevel += 1
    },
    [MUTATIONS.TRY_TAKE]: (state, item) => {
      const key = item.id
      if (!item.count || item.count <= 1) {
        state.objects = state.objects.filter(item => item.id !== key)
        return
      }
      item.count -= 1
    },
    [MUTATIONS.TRY_ACTIVATE]: (state, item) => {
      const id = item.id
      const object = state.objects.find(item => item.id === id)
      if(object && object.isActive === false) {
        object.isActive = true
        if (state.completeCondition.id !== item.id) {
          return
        }
        if(object[state.completeCondition.property] !== state.completeCondition.value) {
            return
        }
        state.gameState.state = GAME_STATE.WIN
      }
    },
    [MUTATIONS.MOVE_PLAYER]: (state, data) => {
      state.playerTransform.x += data.x
      state.playerTransform.y += data.y
      state.playerTransform.toLeft = data.x < 0
      state.playerTransform.isRun = true
      state.intervalId = data.intervalId
    },
    [MUTATIONS.STOP_PLAYER]: (state) => {
      state.playerTransform.isRun = false
      clearInterval(state.intervalId)
    }
  },
  actions: {
    loadScenes: (store) => {
      store.commit(MUTATIONS.START_LOADING)
      fetch(`/levels/${store.getters.getNextLevel}.json`).then(res => {
        res.json().then(data => {
          console.log(data)
          store.commit(MUTATIONS.SET_SCENES, data)
          store.dispatch('inventory/reset')
        })
      })
    },
    interactWithItem: (store, item) => {
      store.commit(MUTATIONS.STOP_PLAYER)
      if(item.type === 'item') {
        if(store.getters['inventory/getEmptySlotsCount'] <= 0) {
          return
        }
        store.commit(MUTATIONS.TRY_TAKE, item)
        const itemKey = item.id.split('.')[0]
        store.dispatch('inventory/addToInventory', {id: itemKey, count: 1})
        return
      }
      if(item.isActive) {
        return
      }
      const selected = store.getters['inventory/getSelectedItem']
      if(item.condition && selected.id !== item.condition) {
        return
      }
      if(item.condition) {
        store.dispatch('inventory/useSelectedItem')
      }
      store.commit(MUTATIONS.TRY_ACTIVATE, item)
      const reward = item.reward
      if(reward) {
        store.dispatch('inventory/addToInventory', {id: reward.id, count: reward.count})
      }
    },
    selectObject: (store, item) => {
      const speed = 1
      store.commit(MUTATIONS.STOP_PLAYER)
      if (!item) {
        return
      }
      const intervalId = setInterval(() => {
        const pos = store.getters.getPlayerTransform
        const x = item.x - pos.x
        const y = item.y - pos.y
        const magnitude = Math.sqrt(x * x + y * y)
        const dx = x * speed / magnitude
        const dy = y * speed / magnitude
        if (magnitude < 10) {
          clearInterval(intervalId)
          store.dispatch('interactWithItem', item)
          return
        }
        store.commit(MUTATIONS.MOVE_PLAYER, {x: dx, y: dy, intervalId: intervalId})
      }, 0.02)
    }
  },
  modules: {
    inventory,
  }
})
