import { createStore } from 'vuex'
import listModule from './list'
import game from './game'

const MUTATION_TYPES = {
    SET_CONFIG: 'SET_CONFIG',
    UPDATE_CONFIG_FIELD: 'UPDATE_CONFIG_FIELD',
    RESET_CONFIG: 'RESET_CONFIG'
}

const DEFAULT_CONFIG = {
    totalColors: 3,
    targetColor: 'red',
    spawnRate: 1,
    pointsForCorrect: 1,
    pointsForWrong: -5
}

export default createStore({
    state() {
        return {
            appConfig: { ...DEFAULT_CONFIG }
        }
    },
    getters: {
        appConfig: (state) => state.appConfig,
        colorsCount: (state) => state.appConfig.totalColors,
        targetColor: (state) => state.appConfig.targetColor,
        spawnRate: (state) => state.appConfig.spawnRate,
        pointsCorrect: (state) => state.appConfig.pointsForCorrect,
        pointsWrong: (state) => state.appConfig.pointsForWrong,
        spawnInterval: (state) => (1 / state.appConfig.spawnRate).toFixed(2),
        isTarget: (state) => (color) => color === state.appConfig.targetColor
    },
    mutations: {
        [MUTATION_TYPES.SET_CONFIG]: (state, newConfig) => {
            state.appConfig = { ...newConfig }
        },
        [MUTATION_TYPES.UPDATE_CONFIG_FIELD]: (state, { key, value }) => {
            if (key in state.appConfig) {
                state.appConfig[key] = value
            }
        },
        [MUTATION_TYPES.RESET_CONFIG]: (state) => {
            state.appConfig = { ...DEFAULT_CONFIG }
        }
    },
    actions: {
        saveConfig: ({ commit }, config) => {
            commit(MUTATION_TYPES.SET_CONFIG, config)
        },
        updateConfigField: ({ commit }, payload) => {
            commit(MUTATION_TYPES.UPDATE_CONFIG_FIELD, payload)
        },
        resetConfig: ({ commit }) => {
            commit(MUTATION_TYPES.RESET_CONFIG)
        }
    },
    modules: {
        list: listModule,
        game
    }
})