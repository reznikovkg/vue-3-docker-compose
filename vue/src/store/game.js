const MUTATIONS = {
    SET_ISFINISHED: "SET_ISFINISHED",
    SET_ISSTARTED: "SET_ISSTARTED",
    SET_MOVE_INTERVAL: "SET_MOVE_INTERVAL",
    SET_SCORE: "SET_SCORE",
    ADD_SCORE: "ADD_SCORE",
    DECREASE_TIMER: "DECREASE_TIMER",
    INCREASE_TIMER: "INCREASE_TIMER",
    SET_TIMER: "SET_TIMER",
    SET_TIMER_INTERVAL: "SET_TIMER_INTERVAL"
}

export const DECREASE_TIMER_VALUE_DEFAULT = 0.5
export const INCREASE_TIMER_VALUE_DEFAULT = 60
const BASE_GAME_SPEED = 500
const BASE_SPEED_KOEF = 7

export default {
    namespaced: true,
    state() {
        return {
            isGameFinished: false,
            isGameStarted: false,
            moveInterval: null,
            timerInterval: null,
            score: 0,
            timer: 60
        }
    },
    getters: {
        getIsFinished: (state) => state.isGameFinished,
        getIsGameStarted: (state) => state.isGameStarted,
        getScore: (state) => state.score,
        getTimer: state => state.timer
    },
    mutations: {
        [MUTATIONS.SET_ISFINISHED]: (state, value) => {
            state.isGameFinished = value
        },
        [MUTATIONS.SET_ISSTARTED]: (state, value) => {
            state.isGameStarted = value
        },
        [MUTATIONS.SET_MOVE_INTERVAL]: (state, value) => {
            if (!value) clearInterval(state.moveInterval)
            state.moveInterval = value
        },
        [MUTATIONS.SET_SCORE]: (state, value) => {
            state.score = Math.max(value, 0)
        },
        [MUTATIONS.ADD_SCORE]: (state, value) => {
            state.score += value
            if (state.score < 0) state.score = 0
        },
        [MUTATIONS.DECREASE_TIMER]: (state, value) => {
            state.timer -= value
        },
        [MUTATIONS.INCREASE_TIMER]: (state, value) => {
            state.timer += value
        },
        [MUTATIONS.SET_TIMER]: (state, value) => {
            state.timer = value
        },
        [MUTATIONS.SET_TIMER_INTERVAL]: (state, value) => {
            if (!value) clearInterval(state.timerInterval)
            state.timerInterval = value
        }
    },
    actions: {
        changeIsFinished: (store, value) => {
            store.commit(MUTATIONS.SET_ISFINISHED, value)
        },
        setScore: (store, value) => {
            store.commit(MUTATIONS.SET_SCORE, value)
        },
        addScore: (store, value) => {
            store.commit(MUTATIONS.ADD_SCORE, value)
        },
        checkGameEnd: (store) => {
            const centralCubePosition = store.rootGetters['cube/getCentralCubePosition']
            const attachedPieces = store.rootGetters['cube/getAttachedPieces']
            const fieldSize = store.rootGetters['field/getFieldSize']
            let attachedPiecesAbroad = false
            attachedPieces.forEach(piece => {
                attachedPiecesAbroad ||= centralCubePosition.x + piece.x <= 1 || centralCubePosition.x + piece.x >= fieldSize ||
                centralCubePosition.y + piece.y <= 1 || centralCubePosition.y + piece.y >= fieldSize
            })
            if (attachedPiecesAbroad || centralCubePosition.x <= 1 || centralCubePosition.x >= fieldSize ||
                centralCubePosition.y <= 1 || centralCubePosition.y >= fieldSize) {
                console.log("end")
                const center = Math.ceil(fieldSize / 2)
                const oldPosition = {
                    x: centralCubePosition.x,
                    y: centralCubePosition.y
                }
                const newPosition = {
                    x: center,
                    y: center
                }

                store.dispatch('cube/setPositionCentralCubeToDefault', null, { root: true })
                store.dispatch('field/changeCentralCubePosition', 
                    { oldPosition, newPosition }, { root: true })
                store.dispatch('game/stopGame', null, { root: true })
            }
        },
        updateTimer: (store, { isIncrease, decreaseValue, increaseValue }) => {
            let timer = store.state.timer

            if (!isIncrease) {
                if(timer >= decreaseValue)
                    store.commit(MUTATIONS.DECREASE_TIMER, decreaseValue)
                else
                    store.dispatch('stopGame')
            } 
            else 
                store.commit(MUTATIONS.INCREASE_TIMER, increaseValue)
        },
        stopGame: (store) => {
            store.commit(MUTATIONS.SET_MOVE_INTERVAL, null)
            store.commit(MUTATIONS.SET_ISFINISHED, true)
            store.commit(MUTATIONS.SET_ISSTARTED, false)
            store.commit(MUTATIONS.SET_TIMER, 60)
            store.commit(MUTATIONS.SET_TIMER_INTERVAL, null)
            store.dispatch("field/initStopGame", null, { root: true })
            store.dispatch("cube/resetCentralCubePosition", null, {root: true})
            store.dispatch("cube/clearAttachedPieces", null, { root: true })
            store.dispatch("field/clearField", null, { root: true })
        },

        startSpeedUp: store => {
            if (!store.state.isGameStarted) return

            store.commit(MUTATIONS.SET_MOVE_INTERVAL, null)
            store.commit(MUTATIONS.SET_MOVE_INTERVAL, setInterval(() => {
                store.dispatch("field/movePiece", null, { root: true })
            }, BASE_GAME_SPEED / BASE_SPEED_KOEF))
        },

        stopSpeedUp: store => {
            if (!store.state.isGameStarted) return

            store.commit(MUTATIONS.SET_MOVE_INTERVAL, null)
            store.commit(MUTATIONS.SET_MOVE_INTERVAL, setInterval(() => {
                store.dispatch("field/movePiece", null, { root: true })
            }, BASE_GAME_SPEED))
        },

        startGame: (store) => {
            store.commit(MUTATIONS.SET_ISSTARTED, true)
            store.commit(MUTATIONS.SET_ISFINISHED, false)
            store.commit(MUTATIONS.SET_TIMER, 60)

            store.commit(MUTATIONS.SET_MOVE_INTERVAL, setInterval(() => {
                store.dispatch("field/movePiece", null, { root: true })
            }, BASE_GAME_SPEED))

            store.commit(MUTATIONS.SET_TIMER_INTERVAL, setInterval(() => {
                store.dispatch('updateTimer', {
                    isIncrease: false,
                    decreaseValue: DECREASE_TIMER_VALUE_DEFAULT,
                    increaseValue: INCREASE_TIMER_VALUE_DEFAULT
                })
            }, BASE_GAME_SPEED))
            store.dispatch("field/initStartGame", null, { root: true })
            store.dispatch("cube/setPositionCentralCubeToDefault", null, { root: true })
        }
    }
}
