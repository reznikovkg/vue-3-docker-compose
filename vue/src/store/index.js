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
      let key = item.id
      if ((item.count ?? 0) <= 1) {
        state.objects = state.objects.filter(item => item.id !== key)
        return
      }
      item.count -= 1
    },
    [MUTATIONS.TRY_ACTIVATE]: (state, item) => {
      let id = item.id
      let object = state.objects.find(item => item.id === id)
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
    loadScenes: async (store) => {
      store.commit(MUTATIONS.START_LOADING)
      const response = await fetch(`/levels/${store.getters.getNextLevel}.json`)
      const data = await response.json()
      await store.dispatch('inventory/reset')
      store.commit(MUTATIONS.SET_SCENES, data)
    },
    interactWithItem: async (store, item) => {
      store.commit(MUTATIONS.STOP_PLAYER)
      if(item.type === 'item') {
        if(store.getters['inventory/getEmptySlotsCount'] <= 0) {
          return
        }
        store.commit(MUTATIONS.TRY_TAKE, item)
        let itemKey = item.id.split('.')[0]
        await store.dispatch('inventory/addToInventory', {id: itemKey, count: 1})
        return
      }
      if(item.isActive) {
        return
      }
      let selected = store.getters['inventory/getSelectedItem']
      if(item.condition && selected.id !== item.condition) {
        return
      }
      if(item.condition) {
        await store.dispatch('inventory/useSelectedItem')
      }
      store.commit(MUTATIONS.TRY_ACTIVATE, item)
      let reward = item.reward
      if(reward) {
        await store.dispatch('inventory/addToInventory', {id: reward.id, count: reward.count})
      }
    },
    selectObject: async (store, item) => {
      let speed = 1
      store.commit(MUTATIONS.STOP_PLAYER)
      if (!item) {
        return
      }
      let intervalId = setInterval(() => {
        let pos = store.getters.getPlayerTransform
        let x = item.x - pos.x
        let y = item.y - pos.y
        let magnitude = Math.sqrt(x * x + y * y)
        let dx = x * speed / magnitude
        let dy = y * speed / magnitude
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
