const MUTATIONS = {
    SET_CENTRAL_CUBE_POSITION: 'SET_CENTRAL_CUBE_POSITION'
}

export default {
  namespaced: true,
  state () {
    return {
        centralCubePosition: {
            x: 1,
            y: 1    
        },
    }
  },
  getters: {
    getCentralCubePosition: (state) => state.centralCubePosition,
  },
  mutations: {
    [MUTATIONS.SET_CENTRAL_CUBE_POSITION]: (state, newPosition) => 
        state.centralCubePosition = newPosition
  },
  actions: {
    initPositionCube: (store) => {
        const size = store.rootGetters['field/getFieldSize']
        const center = Math.ceil(size / 2)

        store.commit(MUTATIONS.SET_CENTRAL_CUBE_POSITION, { x: center, y: center })
    },
    changeCentralCubePosition: (store, newPosition) => {
        let center = Math.ceil(store.rootGetters['field/getFieldSize'] / 2)
        let edge = store.rootGetters['field/getFieldSize']
        let oldPosition = store.state.centralCubePosition

        if(newPosition.x > 1 && newPosition.x < edge &&
            newPosition.y > 1 && newPosition.y < edge
        )
        {
            store.commit(MUTATIONS.SET_CENTRAL_CUBE_POSITION, newPosition)
            store.dispatch('field/changeCentralCubePosition', 
                { oldPosition, newPosition }, 
                { root: true })
        }
        else
        {
            newPosition = {
                x: center,
                y: center
            }

            store.commit(MUTATIONS.SET_CENTRAL_CUBE_POSITION, newPosition)
            store.dispatch('field/changeCentralCubePosition', 
                { oldPosition, newPosition }, 
                { root: true })
            store.dispatch('game/changeIsFinished', true, { root: true })
        }
    }
  }
}