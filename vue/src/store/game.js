import { centers, oncomingCenters } from '../data/centers.js'

const MAX_SPEED = 3.5
const FAST_ACCEL = 0.012
const SLOW_ACCEL = 0.0015
const STUN_MS = 500
const INVULN_TICKS = 16
const BOOST_MS = 5000
const RECORD_KEY = 'raceRecord'
const CAR_COLORS = ['#4a7fd4', '#4fae5c', '#e8c64a', '#e88a3a']

const MUTATIONS = {
  SET_SCORE: 'SET_SCORE',
  SET_RECORD: 'SET_RECORD',
  SET_SPEED: 'SET_SPEED',
  SET_STUNNED: 'SET_STUNNED',
  SET_INVULNERABLE: 'SET_INVULNERABLE',
  SET_IS_OVER: 'SET_IS_OVER',
  SET_PLAYER_X: 'SET_PLAYER_X',
  SET_PLAYER_LIVES: 'SET_PLAYER_LIVES',
  ADD_OBSTACLE: 'ADD_OBSTACLE',
  REMOVE_OBSTACLE: 'REMOVE_OBSTACLE',
  SET_OBSTACLE_HIT: 'SET_OBSTACLE_HIT',
  ADD_BONUS: 'ADD_BONUS',
  REMOVE_BONUS: 'REMOVE_BONUS',
  INCREASE_CAR_ID: 'INCREASE_CAR_ID',
  REMOVE_OFFSCREEN: 'REMOVE_OFFSCREEN',
  RESET: 'RESET',
}

const randomCenter = () => centers[Math.floor(Math.random() * centers.length)]
const randomColor = () => CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)]
const randomChangeTimer = () => Math.floor(60 + Math.random() * 100)

export default {
  namespaced: true,
  state () {
    return {
      score: 0,
      record: parseInt(localStorage.getItem(RECORD_KEY) || '0'),
      speed: 1,
      carId: 0,
      player: {
        x: 62.5,
        lives: 3,
      },
      obstacles: [],
      bonuses: [],
      spawnProgress: 0,
      spawnGap: 45,
      invulnerable: 0,
      isStunned: false,
      isOver: false,
    }
  },
  getters: {
    getScore: (state) => state.score,
    getRecord: (state) => state.record,
    getSpeed: (state) => state.speed,
    getPlayer: (state) => state.player,
    getObstacles: (state) => state.obstacles,
    getBonuses: (state) => state.bonuses,
    getInvulnerable: (state) => state.invulnerable,
    getIsStunned: (state) => state.isStunned,
    getIsOver: (state) => state.isOver,
  },
  mutations: {
    [MUTATIONS.SET_SCORE]: (state, payload) => {
      state.score = payload
    },
    [MUTATIONS.SET_RECORD]: (state, payload) => {
      state.record = payload
    },
    [MUTATIONS.SET_SPEED]: (state, payload) => {
      state.speed = payload
    },
    [MUTATIONS.SET_STUNNED]: (state, payload) => {
      state.isStunned = payload
    },
    [MUTATIONS.SET_INVULNERABLE]: (state, payload) => {
      state.invulnerable = payload
    },
    [MUTATIONS.SET_IS_OVER]: (state, payload) => {
      state.isOver = payload
    },
    [MUTATIONS.SET_PLAYER_X]: (state, payload) => {
      state.player.x = payload
    },
    [MUTATIONS.SET_PLAYER_LIVES]: (state, payload) => {
      state.player.lives = payload
    },
    [MUTATIONS.ADD_OBSTACLE]: (state, obstacle) => {
      state.obstacles.push(obstacle)
    },
    [MUTATIONS.REMOVE_OBSTACLE]: (state, id) => {
      const index = state.obstacles.findIndex((obstacle) => obstacle.id === id)
      if (index !== -1) {
        state.obstacles.splice(index, 1)
      }
    },
    [MUTATIONS.SET_OBSTACLE_HIT]: (state, id) => {
      const obstacle = state.obstacles.find((obstacle) => obstacle.id === id)
      if (obstacle) {
        obstacle.hit = true
      }
    },
    [MUTATIONS.ADD_BONUS]: (state, bonus) => {
      state.bonuses.push(bonus)
    },
    [MUTATIONS.REMOVE_BONUS]: (state, id) => {
      const index = state.bonuses.findIndex((bonus) => bonus.id === id)
      if (index !== -1) {
        state.bonuses.splice(index, 1)
      }
    },
    [MUTATIONS.INCREASE_CAR_ID]: (state) => {
      state.carId++
    },
    [MUTATIONS.REMOVE_OFFSCREEN]: (state) => {
      state.obstacles = state.obstacles.filter((obstacle) => obstacle.y < 120)
      state.bonuses = state.bonuses.filter((bonus) => bonus.y < 120)
    },
    [MUTATIONS.RESET]: (state) => {
      state.score = 0
      state.speed = 1
      state.player.x = 62.5
      state.player.lives = 3
      state.obstacles = []
      state.bonuses = []
      state.spawnProgress = 0
      state.spawnGap = 45
      state.invulnerable = 0
      state.isStunned = false
      state.isOver = false
    },
  },
  actions: {
    updatePlayerX({ commit }, payload) {
      const clamped = Math.min(87.5, Math.max(12.5, payload))
      commit(MUTATIONS.SET_PLAYER_X, clamped)
    },
    newObstacle({ state, commit }) {
      const id = state.carId
      commit(MUTATIONS.INCREASE_CAR_ID)
      const roll = Math.random()
      let obstacle
      if (roll < 0.45) {
        obstacle = {
          id,
          type: 'car',
          direction: 0,
          color: randomColor(),
          x: randomCenter(),
          y: -30,
          hit: false,
          changeTimer: randomChangeTimer(),
        }
      } else if (roll < 0.7) {
        obstacle = {
          id,
          type: 'car',
          direction: 1,
          color: randomColor(),
          x: oncomingCenters[Math.floor(Math.random() * oncomingCenters.length)],
          y: -30,
          hit: false,
          changeTimer: randomChangeTimer(),
        }
      } else if (roll < 0.85) {
        obstacle = {
          id,
          type: 'hole',
          x: randomCenter(),
          y: -30,
          hit: false,
        }
      } else {
        obstacle = {
          id,
          type: 'barrier',
          x: randomCenter(),
          y: -30,
          hit: false,
        }
      }
      commit(MUTATIONS.ADD_OBSTACLE, obstacle)
    },
    newBonus({ state, commit }) {
      const id = state.carId
      commit(MUTATIONS.INCREASE_CAR_ID)
      commit(MUTATIONS.ADD_BONUS, {
        id,
        type: Math.random() < 0.5 ? 'heart' : 'boost',
        x: randomCenter(),
        y: -30,
      })
    },
    applyBoost({ state, commit }) {
      const previous = state.speed
      commit(MUTATIONS.SET_SPEED, Math.min(previous * 1.8, 7))
      setTimeout(() => {
        if (state.speed > previous) {
          commit(MUTATIONS.SET_SPEED, previous)
        }
      }, BOOST_MS)
    },
    handleBonus({ state, commit, dispatch }, { bonusId, bonusType }) {
      if (bonusType === 'heart') {
        commit(MUTATIONS.SET_PLAYER_LIVES, Math.min(state.player.lives + 1, 5))
      } else if (bonusType === 'boost') {
        dispatch('applyBoost')
      }
      commit(MUTATIONS.REMOVE_BONUS, bonusId)
    },
    handleAccident({ state, commit, dispatch }, obstacleId) {
      const obstacle = state.obstacles.find((obstacle) => obstacle.id === obstacleId)
      if (!obstacle || obstacle.hit) return

      commit(MUTATIONS.SET_PLAYER_LIVES, state.player.lives - 1)
      commit(MUTATIONS.SET_OBSTACLE_HIT, obstacleId)
      commit(MUTATIONS.SET_INVULNERABLE, INVULN_TICKS)

      if (!state.isStunned) {
        commit(MUTATIONS.SET_STUNNED, true)
        commit(MUTATIONS.SET_SPEED, 0)
        setTimeout(() => {
          commit(MUTATIONS.SET_STUNNED, false)
        }, STUN_MS)
      }
      setTimeout(() => {
        commit(MUTATIONS.REMOVE_OBSTACLE, obstacleId)
      }, 200)

      if (state.player.lives <= 0) {
        dispatch('gameOver')
      }
    },
    gameOver({ state, commit }) {
      commit(MUTATIONS.SET_IS_OVER, true)
      if (Math.floor(state.score) > state.record) {
        commit(MUTATIONS.SET_RECORD, Math.floor(state.score))
        localStorage.setItem(RECORD_KEY, String(state.record))
      }
    },
    updateGame({ state, commit, dispatch }) {
      const worldSpeed = state.speed * 1.4

      commit(MUTATIONS.SET_SCORE, state.score + 0.05 * state.speed)

      if (!state.isStunned) {
        if (state.speed < MAX_SPEED) {
          commit(MUTATIONS.SET_SPEED, Math.min(MAX_SPEED, state.speed + FAST_ACCEL))
        } else {
          commit(MUTATIONS.SET_SPEED, state.speed + SLOW_ACCEL)
        }
      }

      if (state.invulnerable > 0) {
        commit(MUTATIONS.SET_INVULNERABLE, state.invulnerable - 1)
      }

      state.spawnProgress += worldSpeed
      if (state.spawnProgress >= state.spawnGap) {
        state.spawnProgress = 0
        state.spawnGap = 38 + Math.random() * 14
        dispatch('newObstacle')
        if (Math.random() < 0.12) {
          dispatch('newBonus')
        }
      }

      for (const obstacle of state.obstacles) {
        let step = worldSpeed
        if (obstacle.type === 'car') {
          step = obstacle.direction ? worldSpeed * 1.9 + 0.8 : worldSpeed * 0.55
          obstacle.changeTimer -= 1
          if (obstacle.changeTimer <= 0) {
            obstacle.changeTimer = randomChangeTimer()
            if (obstacle.y < 40) {
              const options = centers.filter((center) => Math.abs(center - obstacle.x) > 1)
              obstacle.x = options[Math.floor(Math.random() * options.length)]
            }
          }
        }
        obstacle.y += step
      }

      for (const bonus of state.bonuses) {
        bonus.y += worldSpeed
      }
    },
    removeObjects({ commit }) {
      commit(MUTATIONS.REMOVE_OFFSCREEN)
    },
    resetGame({ commit }) {
      commit(MUTATIONS.RESET)
    },
  },
}
