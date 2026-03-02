const MUTATIONS = {
    SET_CENTRAL_CUBE_POSITION: 'SET_CENTRAL_CUBE_POSITION'
}

export default {
  namespaced: true,
  state () {
    return {
        centralCubePosition: {
            x: 0,
            y: 0    
        },
    }
  },
  getters: {
    getCentralCubePosition: (state) => state.centralCubePosition,
  },
  mutations: {
    [MUTATIONS.SET_CENTRAL_CUBE_POSITION]: (state, newPosition) => {
        let edge = Math.abs(Math.ceil(state.size / 2))
        let xAbs = Math.abs(newPosition.x)
        let yAbs = Math.abs(newPosition.y)

        if(xAbs < edge && yAbs < edge)
            state.centralCubePosition = newPosition
        else
            state.centralCubePosition = {
                x: 0,
                y: 0
            }
    }
  },
  actions: {
    changeCentralCubePosition: (store, newPosition) => {
        let size = store.getFieldSize()
        let edge = Math.abs(Math.ceil(size / 2))
        let xAbs = Math.abs(newPosition.x)
        let yAbs = Math.abs(newPosition.y)

        if(xAbs < edge && yAbs < edge)
            store.commit(MUTATIONS.SET_CENTRAL_CUBE_POSITION, newPosition)
        else
        {
            store.commit(MUTATIONS.SET_CENTRAL_CUBE_POSITION, {
                x: 0,
                y: 0
            })
            store.commit(MUTATIONS.SET_ISFINISHED, true)
        }
    }
  }
}