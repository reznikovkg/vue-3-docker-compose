const MUTATIONS = {
    SET_CENTRAL_CUBE_POSITION: 'SET_CENTRAL_CUBE_POSITION',
    CLEAR_ATTACHED_PIECES: 'CLEAR_ATTACHED_PIECES',
    ADD_PIECE: 'ADD_PIECE',
    REMOVE_LEVEL_PIECES: 'REMOVE_LEVEL_PIECES'
}

export const ROTATE_DIRECTION = {
    LEFT: 0,
    RIGHT: 1
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
        state.attachedPieces = [],
    [MUTATIONS.ADD_PIECE]: (state, piece) => 
        state.attachedPieces.push(piece),
    [MUTATIONS.REMOVE_LEVEL_PIECES]: (state, level) => {
        state.attachedPieces = state.attachedPieces.filter(
            piece => Math.max(Math.abs(piece.x), Math.abs(piece.y)) != level
        )
    }
  },
  actions: {
    clearAttachedPieces: (store) => {
        store.commit(MUTATIONS.CLEAR_ATTACHED_PIECES)
    },
    resetCentralCubePosition: (store) => {
        store.commit(MUTATIONS.SET_CENTRAL_CUBE_POSITION, { x: 0, y: 0 })
    },
    addPiece: (store, piece) => {
        store.commit(MUTATIONS.ADD_PIECE, piece)
    },
    removeLevelPieces: (store, level) => {
        store.state.attachedPieces.forEach(
            piece => {
                if (Math.max(Math.abs(piece.x), Math.abs(piece.y)) == level)
                    store.dispatch('field/setNumber', {position: {x: store.state.centralCubePosition.x + piece.x - 1,
                y: store.state.centralCubePosition.y + piece.y - 1}, number: 0}, { root: true })
            }
        )
        store.commit(MUTATIONS.REMOVE_LEVEL_PIECES, level)
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
        store.commit(MUTATIONS.SET_CENTRAL_CUBE_POSITION, newPosition)
        store.dispatch('field/changeCentralCubePosition', 
            { oldPosition, newPosition }, 
            { root: true })
        store.dispatch('field/checkFigureAttachment', null, { root: true })
    },
    rotateIsland: (store, rotateDirection) => {
        let xs = store.state.attachedPieces.map(pieceCoord => pieceCoord.x)
        let ys = store.state.attachedPieces.map(pieceCoord => pieceCoord.y)

        console.log(xs)
        console.log(ys)
    }
  }
}