import { OBJECTS } from '@/store/field'

const MUTATIONS = {
    SET_CENTRAL_CUBE_POSITION: 'SET_CENTRAL_CUBE_POSITION',
    CLEAR_ATTACHED_PIECES: 'CLEAR_ATTACHED_PIECES',
    ADD_PIECE: 'ADD_PIECE',
    REMOVE_LEVEL_PIECES: 'REMOVE_LEVEL_PIECES',
    SET_ATTACHED_PIECES: 'SET_ATTACHED_PIECES'
}

export const ROTATE_DIRECTION = {
    LEFT: 0,
    RIGHT: 1
}

export default {
  namespaced: true,
  state () {
    return {
            // от (1, 1)
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
    },
    [MUTATIONS.SET_ATTACHED_PIECES]: (state, value) => {
        state.attachedPieces = value
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
        let xs = store.state.attachedPieces.map(pieceCoord => pieceCoord.x).sort()
        let ys = store.state.attachedPieces.map(pieceCoord => pieceCoord.y).sort()

        let { xCenter, yCenter } = {
            xCenter: store.state.centralCubePosition.x - 1,
            yCenter: store.state.centralCubePosition.y - 1
        } 

        let e1 = xs.reduce((acc, val) => ({
            min: Math.min(acc.min, val),
            max: Math.max(acc.max, val)
        }), { min: xs[0], max: xs[0] })
        
        let e2 = ys.reduce((acc, val) => ({
            min: Math.min(acc.min, val),
            max: Math.max(acc.max, val)
        }), { min: ys[0], max: ys[0] })

        let { localXLeft, localXRight } = {
            localXLeft: e1.min,
            localXRight: e1.max
        }

        let { localYBottom, localYTop } = {
            localYBottom: e2.max,
            localYTop: e2.min
        }

        let { edgeXLeft, edgeXRight } = {
            edgeXLeft: localXLeft + xCenter,
            edgeXRight: localXRight + xCenter
        }

        let { edgeYBottom, edgeYTop } = {
            edgeYBottom: localYBottom + yCenter,
            edgeYTop: localYTop + yCenter
        }

        let newLocalYBottom, newLocalYTop
        let newLocalXLeft, newLocalXRight

        switch (rotateDirection) {
            case ROTATE_DIRECTION.LEFT:
                newLocalYBottom = -localXLeft
                newLocalYTop = -localXRight
                newLocalXLeft = localYTop
                newLocalXRight = localYBottom
                break
            case ROTATE_DIRECTION.RIGHT:
                newLocalYBottom = localXRight
                newLocalYTop = localXLeft
                newLocalXLeft = -localYBottom
                newLocalXRight = -localYTop
                break
        }

        let { newEdgeXLeft, newEdgeXRight } = {
            newEdgeXLeft: newLocalXLeft + xCenter,
            newEdgeXRight: newLocalXRight + xCenter
        }

        let { newEdgeYBottom, newEdgeYTop } = {
            newEdgeYBottom: newLocalYBottom + yCenter,
            newEdgeYTop: newLocalYTop + yCenter
        }

        let fieldSize = store.rootGetters["field/getFieldSize"]

        // Новая область фигуры не выходит за границы поля
        if ((!newEdgeXLeft > 1 && newEdgeXRight < fieldSize &&
            newEdgeYTop > 1 && newEdgeYBottom < fieldSize
        ))
            return

        let currentPiece = store.rootGetters["field/getCurrentPiece"]

        // Надвигающиеся фигура вне старой и новой области фигуры
        // if (!(
        //     () && ()
        // ))
        //     return

        // поворот

        let rotate = (rotateDirection, { x, y }) => {
            switch (rotateDirection) {
                case ROTATE_DIRECTION.RIGHT:
                    return {x: -y, y: x}
                case ROTATE_DIRECTION.LEFT:
                    return {x: y, y: -x}
            }
        }

        console.log('RotateDirection: ' + rotateDirection)

        let fieldCopy = store.rootGetters['field/getField'].map(row => [...row])
        let attachedPiecesCopy = store.state.attachedPieces.map(oldCoords => {
            let newCoordLocal = rotate(rotateDirection, oldCoords)
            let newCoordAbsolute = {x: newCoordLocal.x + xCenter, y: newCoordLocal.y + yCenter}
            let oldCoordAbsolute = {x: oldCoords.x + xCenter, y: oldCoords.y + yCenter}

            fieldCopy[oldCoordAbsolute.y][oldCoordAbsolute.x] = OBJECTS.NONE
            fieldCopy[newCoordAbsolute.y][newCoordAbsolute.x] = OBJECTS.ATTACHED_CUBE

            return newCoordLocal
        })

        store.commit(MUTATIONS.SET_ATTACHED_PIECES, attachedPiecesCopy)
        store.dispatch('field/setField', fieldCopy, {root: true})
    }
  }
}