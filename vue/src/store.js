import { createStore } from 'vuex'
import { generateZonesForChunk } from './fishZones'

const LS_KEY = 'myGameData'

const SET_CHUNK = 'SET_CHUNK'
const REMOVE_CHUNK = 'REMOVE_CHUNK'
const MOVE_BOAT = 'MOVE_BOAT'
const MOVE_BOAT_BY = 'MOVE_BOAT_BY'
const SET_BOAT_POSITION = 'SET_BOAT_POSITION'
const ADD_FISH = 'ADD_FISH'

const BOAT_SPEED = 1

function saveToLS(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state))
}

function loadFromLS() {
  const data = localStorage.getItem(LS_KEY)
  return data
    ? JSON.parse(data)
    : {
        boat: { x: 0, y: 0 },
        chunks: {},
        ownedFish: []
      }
}

export default createStore({
  state: loadFromLS(),

  getters: {
  
  },

  mutations: {
    [SET_BOAT_POSITION](state, { x, y }) {
      state.boat.x = x
      state.boat.y = y
      saveToLS(state)
    },
    [MOVE_BOAT_BY](state, { dx, dy }) {
      state.boat.x += dx
      state.boat.y += dy
      saveToLS(state)
    },
    [SET_CHUNK](state, { key, chunk }) {
      state.chunks[key] = chunk
      saveToLS(state)
    },
    [REMOVE_CHUNK](state, key) {
      delete state.chunks[key]
      saveToLS(state)
    },
    [ADD_FISH](state, fish) {
      state.ownedFish.push(fish)
      saveToLS(state)
    }
  },

  actions: {
    moveBoat({ commit, state }, direction) {
      let { x, y } = state.boat

      switch (direction) {
        case 'up': y -= BOAT_SPEED; break
        case 'down': y += BOAT_SPEED; break
        case 'left': x -= BOAT_SPEED; break
        case 'right': x += BOAT_SPEED; break
      }

      commit(SET_BOAT_POSITION, { x, y })
    },

    updateChunks({ state, commit }, { cx, cy }) {
      const needed = new Set()

      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const x = cx + dx
          const y = cy + dy
          const key = `${x},${y}`

          needed.add(key)

          if (!state.chunks[key]) {
            const zones = generateZonesForChunk(x, y)
            commit(SET_CHUNK, { key, chunk: { zones } })
          }
        }
      }

      for (const key in state.chunks) {
        if (!needed.has(key)) {
          commit(REMOVE_CHUNK, key)
        }
      }
    },

    addFish({ commit }, fish) {
      commit(ADD_FISH, fish)
    }
  }
})