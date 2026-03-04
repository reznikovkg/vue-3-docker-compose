const MUTATIONS = {
    SET_ISFINISHED: "SET_ISFINISHED"
}

export default {
    namespaced: true,
    state() {
        return {
            isFinished: false
        }
    },
    getters: {
        getIsFinished: (state) => state.isFinished
    },
    mutations: {
        [MUTATIONS.SET_ISFINISHED]: (state, value) => {
            console.log("Finished")

            state.isFinished = value
        }
    },
    actions: {
        changeIsFinished: (store, value) => {
            store.commit(MUTATIONS.SET_ISFINISHED, value)
        },
        gameIsFinished: (store) => {
            store.commit(MUTATIONS.SET_ISFINISHED, true)
        }
    }
}
