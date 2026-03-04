const MUTATIONS = {
    SET_ISFINISHED: "SET_ISFINISHED",
    SET_ISSTARTED: "SET_ISSTARTED"
}

export default {
    namespaced: true,
    state() {
        return {
            isGameFinished: false,
            isGameStarted: false
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
        }
    },
    actions: {
        changeIsFinished: (store, value) => {
            store.commit(MUTATIONS.SET_ISFINISHED, value)
        },
        stopGame: (store) => {
            store.commit(MUTATIONS.SET_ISFINISHED, true)
            store.dispatch("field/initStopGame", null, { root: true })
            store.dispatch("cube/resetCentralCubePosition", null, {root: true})
        },
        startGame: (store) => {
            store.commit(MUTATIONS.SET_ISSTARTED, true)
            store.dispatch("field/initStartGame", null, { root: true })
            store.dispatch("cube/setPositionCentralCubeToDefault", null, { root: true })
        }
    }
}
