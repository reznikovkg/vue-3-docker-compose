const MUTATIONS = {
    SET_FLASKS: 'SET_FLASKS',
    SET_CURRENT_FLASK: 'SET_CURRENT_FLASK',
    MOVE_LIQUID: 'MOVE_LIQUID',
    SET_GAME_WON: 'SET_GAME_WON'
}

export default {
    namespaced: true,
    state () {
        return {
            flasks: [],
            currentFlask: null,
            gameWon: false,
            maxLayers: 4
        }
    },
    getters: {
        getFlasks: (state) => state.flasks,
        getCurrentFlask: (state) => state.currentFlask,
        getGameWon: (state) => state.gameWon,
        getMaxLayers: (state) => state.maxLayers
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
        }
    },
    actions: {
        initGame({ commit, state }) {
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
        },
        tryMove({ commit, state }, { fromFlask, toFlask }) {
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
            }
            commit(MUTATIONS.SET_CURRENT_FLASK, null)
        }
    }
}

export { MUTATIONS }