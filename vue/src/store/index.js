import { createStore } from 'vuex'
import list from './list'

const MUTATIONS = {
  SET_MODE: 'SET_MODE',
  ADD_SCORE: 'ADD_SCORE',
  RESET_GAME: 'RESET_GAME',
  HIT_SUCCESS: 'HIT_SUCCESS',
  HIT_FAIL: 'HIT_FAIL',
  ADD_SHOT: 'ADD_SHOT',
  REMOVE_SHOT: 'REMOVE_SHOT',
  ADD_BOMB: 'ADD_BOMB',
  USE_BOMB: 'USE_BOMB',
  SET_BOMB_MODE: 'SET_BOMB_MODE'
}
export const SCORE = {
  HIT: { large: 10, medium: 5, small: 2 },
  MISS: { large: -5, medium: -3, small: -1 },
  FALL: { large: -10, medium: -6, small: -3 }
}
export default createStore({
  state () {
    return {
      mode: 'manual',
      score: 0,
      combo: 1,
      comboMax: 5,
      missCombo: 1,
      missComboMax: 7,
      successfulHits: 0,
      bombs: 0,
      bombMode: false,
      shots: []
    }
  },
  getters: {
    score: s => s.score,
    mode: s => s.mode,
    combo: s => s.combo,
    bombs: s => s.bombs,
    bombMode: s => s.bombMode,
    shots: s => s.shots
  },
  mutations: {
    [MUTATIONS.SET_MODE](state, mode) {
      state.mode = mode
    },
    [MUTATIONS.RESET_GAME](state) {
      state.score = 0
      state.combo = 1
      state.missCombo = 1
      state.successfulHits = 0
      state.bombs = 0
      state.shots = []
    },
    [MUTATIONS.HIT_SUCCESS](state) {
      state.successfulHits++
      state.combo = Math.min(state.combo * 1.2, state.comboMax)
      if (state.successfulHits % 10 === 0) {
        state.bombs++
      }
    },
    [MUTATIONS.HIT_FAIL](state) {
      state.missCombo = Math.min(state.missCombo * 1.3, state.missComboMax)
    },
    [MUTATIONS.ADD_SCORE](state, value) {
      state.score += value
    },
    [MUTATIONS.ADD_SHOT](state, shot) {
      state.shots.push(shot)
    },
    [MUTATIONS.REMOVE_SHOT](state, id) {
      state.shots = state.shots.filter(s => s.id !== id)
    },
    [MUTATIONS.ADD_BOMB](state) {
      state.bombs++
    },
    [MUTATIONS.USE_BOMB](state) {
      if (state.bombs > 0) state.bombs--
    },
    [MUTATIONS.SET_BOMB_MODE](state, val) {
      state.bombMode = val
    },
  },
  actions: {
  hitSuccess({ commit, state }, size) {
    const combo = state.combo
    commit(MUTATIONS.HIT_SUCCESS)
    const baseScore = SCORE.HIT[size] 
    const value = Math.round(baseScore * combo)
    commit(MUTATIONS.ADD_SCORE, value)
    state.missCombo = 1
  },
  hitFail({ commit, state }, size) {
    const missCombo = state.missCombo
    commit(MUTATIONS.HIT_FAIL)
    const penalty = Math.round(SCORE.MISS[size] * missCombo)
    commit(MUTATIONS.ADD_SCORE, penalty)
    state.combo = 1
  },
  fallPenalty({ commit, state }, size) {
    const penalty = SCORE.FALL[size]
    commit(MUTATIONS.ADD_SCORE, penalty)
  },
  addShot({ commit }, shot) {
    commit(MUTATIONS.ADD_SHOT, shot)
  },
  removeShot({ commit }, id) {
    commit(MUTATIONS.REMOVE_SHOT, id)
  },
  useBomb({ commit, state }) {
    if (state.bombs <= 0) return false
    commit(MUTATIONS.USE_BOMB)
    commit(MUTATIONS.SET_BOMB_MODE, true)
    return true
  }
}
})
