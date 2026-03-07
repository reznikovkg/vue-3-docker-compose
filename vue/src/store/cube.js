const MUTATIONS = {
    SET_CENTRAL_CUBE_POSITION: 'SET_CENTRAL_CUBE_POSITION',
    CLEAR_ATTACHED_PIECES: 'CLEAR_ATTACHED_PIECES'
}

export default {
  namespaced: true,
  state () {
    return {
        centralCubePosition: {
            x: 0,
            y: 0    
        },
        attachedPieces: []
    }
  },
  getters: {
    getCentralCubePosition: (state) => state.centralCubePosition,
    getAttachedPieces: (state) => state.attachedPieces,
  },
  mutations: {
    [MUTATIONS.SET_CENTRAL_CUBE_POSITION]: (state, newPosition) => 
        state.centralCubePosition = newPosition,
    [MUTATIONS.CLEAR_ATTACHED_PIECES]: (state) => 
        state.attachedPieces = []
  },
  actions: {
    clearAttachedPieces: (store) => {
        store.commit(MUTATIONS.CLEAR_ATTACHED_PIECES)
    },
    resetCentralCubePosition: (store) => {
        store.commit(MUTATIONS.SET_CENTRAL_CUBE_POSITION, { x: 0, y: 0 })
    },
    setPositionCentralCubeToDefault: (store) => {
        const size = store.rootGetters['field/getFieldSize']
        const center = Math.ceil(size / 2)

        store.commit(MUTATIONS.SET_CENTRAL_CUBE_POSITION, { x: center, y: center })
    },
    changeCentralCubePosition: (store, newPosition) => {
        let center = Math.ceil(store.rootGetters['field/getFieldSize'] / 2)
        let edge = store.rootGetters['field/getFieldSize']
        let oldPosition = store.state.centralCubePosition

        let attachedPiecesAbroad = false
        store.state.attachedPieces.forEach(piece => {
            attachedPiecesAbroad ||= newPosition.x + piece.x <= 1 || newPosition.x + piece.x >= edge ||
            newPosition.y + piece.y <= 1 || newPosition.y + piece.y >= edge
        })

        if(newPosition.x > 1 && newPosition.x < edge &&
            newPosition.y > 1 && newPosition.y < edge && !attachedPiecesAbroad
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
            store.dispatch('game/stopGame', null, { root: true })
        }
    }
  }
}