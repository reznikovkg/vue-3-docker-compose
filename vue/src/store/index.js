import { createStore } from 'vuex'
import areaPathFounder from '@/utils/areaPathFounder.js';
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
  UPDATE_PLAYER_STATE: 'UPDATE_PLAYER_STATE',
  UPDATE_PLAYER_POSITION: 'UPDATE_PLAYER_POSITION',
  START_MINIGAME: 'START_MINIGAME',
  CLOSE_MINIGAME: 'CLOSE_MINIGAME'
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
      minigame: {
       isActive: false,
       difficulty: 1,
       onSuccess: null,
       onClose: null
     }
    }
  },
  getters: {
    getSceneObjects: (state) => state.objects,
    getPlayerTransform: (state) => state.playerTransform,
    getGameState: (state) => state.gameState,
    getNextLevel: (state) => state.levelList[state.nextLevel % state.levelList.length],
    getBackgroundName: (state) => state.backgroundName,
    isMinigameActive: (state) => state.minigame.isActive,
    getMinigameData: (state) => state.minigame
  },
  mutations: {
    [MUTATIONS.START_LOADING](state) {
      state.minigame.isActive = false;
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
      if (object && object.isActive === false) {
        object.isActive = true
        if (state.completeCondition.id !== item.id) {
          return
        }
        if (object[state.completeCondition.property] !== state.completeCondition.value) {
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
    },
    [MUTATIONS.UPDATE_PLAYER_POSITION]: (state, position) => {
     if (position.x !== undefined) {
      state.playerTransform.x = position.x
     }
     if (position.y !== undefined) {
      state.playerTransform.y = position.y
     }
   },
   [MUTATIONS.UPDATE_PLAYER_STATE]: (state, character) => {
     if (character.isRun !== undefined) {
      state.playerTransform.isRun = character.isRun
     }
     if (character.toLeft !== undefined) {
      state.playerTransform.toLeft = character.toLeft
     }
   },
   [MUTATIONS.START_MINIGAME]: (state, game) => {
      state.minigame.isActive = true
      state.minigame.difficulty = game.difficulty || 1
      state.minigame.onSuccess = game.onSuccess
      state.minigame.onClose = () => {
        state.minigame.isActive = false
        if (game.onClose) {
          game.onClose()
        }
      }
   },
   [MUTATIONS.CLOSE_MINIGAME]: (state) => {
     state.minigame.isActive = false
   }
  },
  actions: {
    loadScenes: (store) => {
      store.commit(MUTATIONS.START_LOADING)
      fetch(`/levels/${store.getters.getNextLevel}.json`).then(res => {
        res.json().then(data => {
          areaPathFounder.setArea(data.moveArea)
          store.commit(MUTATIONS.SET_SCENES, data)
          store.dispatch('inventory/reset')
        })
      })
    },
    interactWithItem: (store, item) => {
      store.commit(MUTATIONS.STOP_PLAYER)
      if(item.type === 'item') {
        if (store.getters['inventory/getEmptySlotsCount'] <= 0) {
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
      let pointIndex = 0;
      const path = areaPathFounder.findShortestTrianglePath(
          store.getters.getPlayerTransform,
          {x: item.x, y: item.y}
      )
      const intervalId = setInterval(() => {
        const pos = store.getters.getPlayerTransform
        const x = path[pointIndex].x - pos.x
        const y = path[pointIndex].y - pos.y
        const magnitude = Math.sqrt(x * x + y * y)
        const dx = x * speed / magnitude
        const dy = y * speed / magnitude
        if (magnitude < 10) {
          pointIndex += 1;
          if (pointIndex >= path.length) {
            clearInterval(intervalId)
            store.dispatch('interactWithItem', item)
            return
          }
        }
        store.commit(MUTATIONS.MOVE_PLAYER, {x: dx, y: dy, intervalId: intervalId})
      }, 0.02)
    },
    movePlayer(store, point) {
      const x = point.x
      const pos = store.getters.getPlayerTransform
      const newPoint = { x: pos.x + point.x, y: pos.y + point.y }
      if (!areaPathFounder.pointInPolygon(newPoint)) {
        return
      }
      store.commit(MUTATIONS.UPDATE_PLAYER_POSITION, newPoint)
      store.commit(MUTATIONS.UPDATE_PLAYER_STATE, {
        isRun: true,
        toLeft: x < 0
      })
    },
    movePlayerToPoint(store, point) {
      store.commit(MUTATIONS.STOP_PLAYER);
      const speed = 5;
      let pointIndex = 0;
      const path = areaPathFounder.findShortestTrianglePath(
          store.getters.getPlayerTransform,
          point
      )
      const intervalId = setInterval(() => {
        const pos = store.getters.getPlayerTransform
        const x = path[pointIndex].x;
        const y = path[pointIndex].y;
        const dx = x - pos.x
        const dy = y - pos.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 5) {
          pointIndex += 1;
          if (pointIndex >= path.length) {
            clearInterval(intervalId)
            store.commit(MUTATIONS.UPDATE_PLAYER_STATE, {isRun: false})
            store.state.intervalId = null
            return
          }
        }
        const stepX = (dx / dist) * speed
        const stepY = (dy / dist) * speed
        store.commit(MUTATIONS.UPDATE_PLAYER_POSITION, {
          x: pos.x + stepX,
          y: pos.y + stepY,
        });
        store.commit(MUTATIONS.UPDATE_PLAYER_STATE, {
          isRun: true,
          toLeft: stepX < 0,
        });
      }, 16);
      store.state.intervalId = intervalId 
    },
    updatePlayerState(store, state) {
      store.commit(MUTATIONS.UPDATE_PLAYER_STATE, state)
    }
  },
  modules: {
    inventory,
  }
})
