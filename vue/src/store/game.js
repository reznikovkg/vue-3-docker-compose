const MUTATIONS = {
    SET_ISFINISHED: "SET_ISFINISHED",
    SET_ISSTARTED: "SET_ISSTARTED",
    SET_MOVE_INTERVAL: "SET_MOVE_INTERVAL"
}

export default {
    namespaced: true,
    state() {
        return {
            isGameFinished: false,
            isGameStarted: false,
            moveInterval: null
        }
    },
    getters: {
        getIsFinished: (state) => state.isGameFinished,
        getIsGameStarted: (state) => state.isGameStarted
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
        }
    },
    actions: {
        changeIsFinished: (store, value) => {
            store.commit(MUTATIONS.SET_ISFINISHED, value)
        },
        stopGame: (store) => {
            store.commit(MUTATIONS.SET_MOVE_INTERVAL, null)
            store.commit(MUTATIONS.SET_ISFINISHED, true)
            store.commit(MUTATIONS.SET_ISSTARTED, false)
            store.dispatch("field/initStopGame", null, { root: true })
            store.dispatch("cube/resetCentralCubePosition", null, {root: true})
            store.dispatch("cube/clearAttachedPieces", null, { root: true })
            store.dispatch("field/clearField", null, { root: true })
        },
        startGame: (store) => {
            store.commit(MUTATIONS.SET_ISSTARTED, true)
            store.commit(MUTATIONS.SET_ISFINISHED, false)
            store.dispatch("field/initStartGame", null, { root: true })
            store.dispatch("cube/setPositionCentralCubeToDefault", null, { root: true })
            store.commit(MUTATIONS.SET_MOVE_INTERVAL, setInterval(() => {
                store.dispatch("field/movePiece", null, { root: true })
            }, 500))
        }
    }
}
