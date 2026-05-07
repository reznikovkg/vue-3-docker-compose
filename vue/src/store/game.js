const MUTATIONS = {
    SET_FLASKS: 'SET_FLASKS',
    SET_CURRENT_FLASK: 'SET_CURRENT_FLASK',
    MOVE_LIQUID: 'MOVE_LIQUID',
    SET_GAME_WON: 'SET_GAME_WON',
    SET_TIME: 'SET_TIME',
    SET_BEST_TIMES: 'SET_BEST_TIMES',
    SET_HARD_MODE_BEST_TIMES: 'SET_HARD_MODE_BEST_TIMES',
    SET_HARD_MODE: 'SET_HARD_MODE',
    SET_BLOCKED_FLASK: 'SET_BLOCKED_FLASK',
    SET_GAME_STARTED: 'SET_GAME_STARTED'
}

export default {
    namespaced: true,
    state () {
        return {
            flasks: [],
            currentFlask: null,
            gameWon: false,
            maxLayers: 4,
            time: 0,
            timerId: null,
            bestTimes: [],
            hardModeBestTimes: [],
            hardMode: false,
            blockedFlask: null,
            gameStarted: false
        }
    },
    getters: {
        getFlasks: (state) => state.flasks,
        getCurrentFlask: (state) => state.currentFlask,
        getGameWon: (state) => state.gameWon,
        getMaxLayers: (state) => state.maxLayers,
        getTime: (state) => state.time,
        getBestTimes: (state) => state.bestTimes,
        getHardModeBestTimes: (state) => state.hardModeBestTimes,
        getHardMode: (state) => state.hardMode,
        getBlockedFlask: (state) => state.blockedFlask,
        getGameStarted: (state) => state.gameStarted
    },
    mutations: {
        [MUTATIONS.SET_FLASKS]: (state, flasks) => {
            state.flasks = flasks
        },
        [MUTATIONS.SET_CURRENT_FLASK]: (state, flask) => {
            if (state.currentFlask === flask) {
                state.currentFlask = null
            } else {
                state.currentFlask = flask
            }
        },
        [MUTATIONS.MOVE_LIQUID]: (state, { fromFlask, toFlask }) => {
            const fromLayers = state.flasks[fromFlask]
            const toLayers = state.flasks[toFlask]
            const topColor = fromLayers[fromLayers.length - 1]
            // Считаем, сколько верхних слоёв одного цвета
            let sameColorCount = 0
            for (let i = fromLayers.length - 1; i >= 0; i--) {
                if (fromLayers[i] === topColor) {
                    sameColorCount++
                } else {
                    break
                }
            }
            // Сколько места в целевой колбе
            const spaceInToFlask = state.maxLayers - toLayers.length
            // Сколько реально перельём
            const amountToMove = Math.min(sameColorCount, spaceInToFlask)
            // Переливаем
            for (let i = 0; i < amountToMove; i++) {
                toLayers.push(topColor)
            }
            fromLayers.splice(fromLayers.length - amountToMove, amountToMove)
        },
        [MUTATIONS.SET_GAME_WON]: (state, won) => {
            state.gameWon = won
        },
        [MUTATIONS.SET_TIME]: (state, time) => {
            state.time = time
        },
        [MUTATIONS.SET_BEST_TIMES]: (state, times) => {
            state.bestTimes = times
            localStorage.setItem('bestTimes', JSON.stringify(times))
        },
        [MUTATIONS.SET_HARD_MODE_BEST_TIMES]: (state, times) => {
            state.hardModeBestTimes = times
            localStorage.setItem('hardModeBestTimes', JSON.stringify(times))
        },
        [MUTATIONS.SET_HARD_MODE]: (state, mode) => {
            state.hardMode = mode
        },
        [MUTATIONS.SET_BLOCKED_FLASK]: (state, index) => {
            state.blockedFlask = index
        },
        [MUTATIONS.SET_GAME_STARTED]: (state, started) => {
            state.gameStarted = started
        }
    },
    actions: {
        initGame({ commit, state, dispatch }) {
            const colours = []
            for (let i = 1; i <= 4; i++) {
                colours.push(i)
            }
            let layers = []
            colours.forEach(colour => {
                for (let i = 0; i < state.maxLayers; i++) {
                    layers.push(colour)
                }
            })
            //Перемешиваем слои
            layers = layers.sort(() => Math.random() - 0.5)
            const flasks = []
            for (let i = 0; i < colours.length + 2; i++) { //две пустые колбы для манёвра
                flasks.push([])
            }
            let flaskIndex = 0
            layers.forEach(layer => {
                flasks[flaskIndex].push(layer)
                flaskIndex = (flaskIndex + 1) % (colours.length + 2)
            })
            commit(MUTATIONS.SET_FLASKS, flasks)
            commit(MUTATIONS.SET_CURRENT_FLASK, null)
            commit(MUTATIONS.SET_GAME_WON, false)
            commit(MUTATIONS.SET_TIME, 0)
            dispatch('stopTimer') //останавливаем таймер, если он был запущен
            commit(MUTATIONS.SET_GAME_STARTED, false)
            //if (state.hardMode) {
                //dispatch('blockRandomFlask')
            //}
        },
        startGame({ commit, state, dispatch }) {
            if (!state.gameStarted) {
                commit(MUTATIONS.SET_GAME_STARTED, true)
                const actionsToDispatch = ['startTimer']
                if (state.hardMode) {
                    actionsToDispatch.push('blockRandomFlask')
                }
                actionsToDispatch.forEach(action => dispatch(action))
            }
        },
        startTimer({ commit, state }) {
            if (state.timerId) {
                return
            }
            state.timerId = setInterval(() => {
                commit(MUTATIONS.SET_TIME, state.time + 1)
            }, 1000)
        },
        stopTimer({ commit, state }) {
            if (state.timerId) {
                clearInterval(state.timerId)
                state.timerId = null
            }
        },
        saveRecord({ commit, state }) {
            const newTime = state.time
            const baseTimes = state.hardMode ? state.hardModeBestTimes : state.bestTimes
            const times = [...baseTimes, newTime].sort((a, b) => a - b).slice(0, 10)
            if (state.hardMode) {
                commit(MUTATIONS.SET_HARD_MODE_BEST_TIMES, times)
            } else {
                commit(MUTATIONS.SET_BEST_TIMES, times)
            }
        },
        blockRandomFlask({ commit, state }) {
            if (!state.hardMode) {
                return
            }
            const options = state.flasks.map((_, index) => index).filter(index => index !== state.currentFlask)
            if (options.length){
                const blocked = options[Math.floor(Math.random() * options.length)]
                commit(MUTATIONS.SET_BLOCKED_FLASK, blocked)
            }
        },
        tryMove({ commit, state, dispatch }, { fromFlask, toFlask }) {
            if (state.hardMode && state.blockedFlask !== null){
                if (fromFlask === state.blockedFlask || toFlask === state.blockedFlask) {
                    commit(MUTATIONS.SET_CURRENT_FLASK, null)
                    return
                }
            }
            const fromLayers = state.flasks[fromFlask]
            const toLayers = state.flasks[toFlask]
            if (fromFlask === toFlask || fromLayers.length === 0 || toLayers.length === state.maxLayers) {
                return
            }
            const canMove = toLayers.length === 0 || 
                            fromLayers[fromLayers.length - 1] === toLayers[toLayers.length - 1]
            const hasSpace = toLayers.length < state.maxLayers
            if (canMove && hasSpace) {
                commit(MUTATIONS.MOVE_LIQUID, { fromFlask, toFlask })    
                const gameWon = state.flasks.every(flask => {
                    return flask.length === 0 || 
                    (flask.every(layer => layer === flask[0]) && flask.length === state.maxLayers)
                })
                commit(MUTATIONS.SET_GAME_WON, gameWon)
                if (gameWon) {
                    dispatch('stopTimer')
                    dispatch('saveRecord')
                }
            }
            commit(MUTATIONS.SET_CURRENT_FLASK, null)
            if (state.hardMode && !state.gameWon) {
                dispatch('blockRandomFlask')
            }
        },
        toggleHardMode({ commit, state, dispatch }, isEnabled) {
            commit(MUTATIONS.SET_HARD_MODE, isEnabled)
            if (isEnabled) {
                dispatch('blockRandomFlask')
            } else {
                dispatch('setBlockedFlask', null)
            }
        },
        setTime({ commit }, time) {
            commit(MUTATIONS.SET_TIME, time)
        },
        setHardMode({ commit }, mode) {
            commit(MUTATIONS.SET_HARD_MODE, mode)
        },
        setBlockedFlask({ commit }, index) {
            commit(MUTATIONS.SET_BLOCKED_FLASK, index)
        },
        setBestTimes({ commit }, times) {
            commit(MUTATIONS.SET_BEST_TIMES, times)
        },
        setHardModeBestTimes({ commit }, times) {
            commit(MUTATIONS.SET_HARD_MODE_BEST_TIMES, times)
        },
        setCurrentFlask({ commit }, index) {
            commit(MUTATIONS.SET_CURRENT_FLASK, index)
        }
    }
}

export { MUTATIONS }