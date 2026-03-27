import { createStore } from 'vuex'
import list from './list'
import gameRoad from './game-road'

export const MUTATIONS = {
  INCREMENT: 'INCREMENT',
  SET_COUNT: 'SET_COUNT',
  SET_CURRENT_SCORE: 'SET_CURRENT_SCORE',
  SET_BEST_SCORE: 'SET_BEST_SCORE',
}

export const ACTIONS = {
  RUN_INCREMENT: 'runIncrement',
  SET_COUNT: 'setCount',
  SAVE_SCORE: 'saveScore',
}

const getRoadBoundsAtY = (yPx, canvasSize, tunnelTopRatio) => {
  const centerX = canvasSize.width / 2
  const topWidth = canvasSize.width * tunnelTopRatio
  const widthAtY = topWidth + (canvasSize.width - topWidth) * Math.min(1, Math.max(0, yPx / canvasSize.height))
  const leftPx = centerX - widthAtY / 2

  return {
    leftPx,
    widthPx: widthAtY,
  }
}

export default createStore({
  state: () => ({
    count: 0,
    currentScore: 0,
    bestScore: 0,
  }),
  getters: {
    getCount: (state) => state.count,
    getCount2: (state) => state.count * 2,
    getCurrentScore: (state) => state.currentScore,
    getBestScore: (state) => state.bestScore,
    getCarStyle: () => ({ car, isPlayer, canvasSize, roadWidth, tunnelTopRatio }) => {
      const scale = canvasSize.scale
      const centerYpx = (car.y + car.height / 2) * scale
      const bounds = getRoadBoundsAtY(centerYpx, canvasSize, tunnelTopRatio)
      const centerXpx = bounds.leftPx + (car.x / roadWidth) * bounds.widthPx

      const gameHeight = canvasSize.height / scale
      const depthRatio = Math.max(0, Math.min(1, (car.y + car.height / 2) / gameHeight))
      const sizeScale = isPlayer ? 1 : 0.72 + 0.28 * depthRatio

      const width = car.width * scale * sizeScale
      const height = car.height * scale * sizeScale

      const roadCenterX = bounds.leftPx + bounds.widthPx / 2
      const roadHalfWidth = bounds.widthPx / 2
      const offsetRatio = roadHalfWidth > 0 ? (centerXpx - roadCenterX) / roadHalfWidth : 0
      const maxTiltDeg = 22
      const tiltDeg = isPlayer ? offsetRatio * maxTiltDeg : 0

      const baseColor = isPlayer ? '#3b82f6' : (car.color || '#9ca3af')

      return {
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate3d(${centerXpx}px, ${centerYpx}px, 0) translate(-50%, -50%) scale(${sizeScale}) rotateX(40deg) rotateY(${tiltDeg}deg)`,
        '--car-color': baseColor,
      }
    },
  },
  mutations: {
    [MUTATIONS.INCREMENT]: (state, value) => {
      state.count += value
    },
    [MUTATIONS.SET_COUNT]: (state, value) => {
      state.count = value
    },
    [MUTATIONS.SET_CURRENT_SCORE]: (state, value) => {
      state.currentScore = value
    },
    [MUTATIONS.SET_BEST_SCORE]: (state, value) => {
      state.bestScore = value
    },
  },
  actions: {
    [ACTIONS.RUN_INCREMENT]: (store, value) => {
      store.commit(MUTATIONS.INCREMENT, value)
    },
    [ACTIONS.SET_COUNT]: (store, payload) => {
      const { value, timeout = 0 } = payload
      setTimeout(() => {
        store.commit(MUTATIONS.SET_COUNT, value)
      }, timeout)
    },
    [ACTIONS.SAVE_SCORE]: (store, value) => {
      const bestScore = store.state.bestScore
      store.commit(MUTATIONS.SET_CURRENT_SCORE, value)

      if (value > bestScore) {
        store.commit(MUTATIONS.SET_BEST_SCORE, value)
      }
    },
  },
  modules: {
    list,
    gameRoad,
  },
})
