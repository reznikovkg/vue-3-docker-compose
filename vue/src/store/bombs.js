import { OBJECTS } from "./field/objects"

const MUTATIONS = {
    ADD_BOMB: 'ADD_BOMB',
    REMOVE_BOMB: 'REMOVE_BOMB',
    CLEAR_BOMBS: 'CLEAR_BOMBS',
    UPDATE_BOMB_POSITION: 'UPDATE_BOMB_POSITION',
}

export default {
    namespaced: true,
    state(){
        return {
            bombs: []
        }
    },
    getters: {
        getBombs: (state) => state.bombs
    },
    mutations: {
        [MUTATIONS.ADD_BOMB]: (state, bomb) => {
            state.bombs.push(bomb)
        },
        [MUTATIONS.REMOVE_BOMB]: (state, index) => {
            state.bombs.splice(index, 1)
        },
        [MUTATIONS.CLEAR_BOMBS]: (state) => {
            state.bombs = []
        },
        [MUTATIONS.UPDATE_BOMB_POSITION]: (state, { index, x, y }) => {
            if (state.bombs[index]) {
                state.bombs[index].x = x
                state.bombs[index].y = y
            }
        },
    },
    actions: {
        clearBombs: (store) => {
            store.commit(MUTATIONS.CLEAR_BOMBS)
        },
        spawnBomb: (store) => {
            if (!store.rootGetters['field/isGameActive']) return
            if (store.state.bombs.length >= 3) return

            const rand = Math.random()
            let color
            if (rand <= 0.1) {
                color = OBJECTS.GREEN_BOMB
            } else {
                color = rand < 0.55 ? OBJECTS.BLACK_BOMB : OBJECTS.RED_BOMB
            }

            const side = Math.floor(Math.random() * 4)
            const fieldSize = store.rootGetters['field/getFieldSize']
            let x, y, direction

            const getPosition = (minPossible, maxPossible) => {
                if (maxPossible - minPossible >= 2) {
                    const newMin = minPossible + 1
                    const newMax = maxPossible - 1
                    return Math.floor(Math.random() * (newMax - newMin + 1)) + newMin
                }
                return Math.floor(Math.random() * (maxPossible - minPossible + 1)) + minPossible
            }

            switch (side) {
                case 0:
                    x = getPosition(0, fieldSize - 1)
                    y = -1
                    direction = 0
                    break
                case 1:
                    x = fieldSize
                    y = getPosition(0, fieldSize - 1)
                    direction = 1
                    break
                case 2:
                    x = getPosition(0, fieldSize - 1)
                    y = fieldSize
                    direction = 2
                    break
                case 3:
                    x = -1
                    y = getPosition(0, fieldSize - 1)
                    direction = 3
                    break
            }
            const bomb = { x, y, direction, color }
            store.commit(MUTATIONS.ADD_BOMB, bomb)
        },
        moveBombs: (store) => {
            if (!store.rootGetters['field/isGameActive']) return
            const fieldSize = store.rootGetters['field/getFieldSize']
            const bombs = store.state.bombs

            bombs.forEach((bomb, i) => {
                let { x, y, direction, color } = bomb
                const oldX = x, oldY = y

                switch (direction) {
                    case 0: y++; break
                    case 1: x--; break
                    case 2: y--; break
                    case 3: x++; break
                }

                if (x < 0 || x >= fieldSize || y < 0 || y >= fieldSize) {
                    if (oldX >= 0 && oldX < fieldSize && oldY >= 0 && oldY < fieldSize) {
                        store.dispatch(
                            "field/setNumber", 
                            { position: {x: oldX, y: oldY}, number: OBJECTS.NONE },
                            {root: true}
                        )
                    }

                    store.commit(MUTATIONS.REMOVE_BOMB, i)
                    return
                }

                const cell = store.rootGetters['field/getFieldCell'](x, y)
                
                if (cell === OBJECTS.CENTRAL_CUBE || cell === OBJECTS.ATTACHED_CUBE) {
                    store.dispatch('handleBombCollision', { bomb: { ...bomb, x: oldX, y: oldY }, index: i })
                    return
                }

                if (oldX >= 0 && oldX < fieldSize && oldY >= 0 && oldY < fieldSize) {
                    store.dispatch(
                            "field/setNumber", 
                            { position: {x: oldX, y: oldY}, number: OBJECTS.NONE },
                            {root: true}
                        )
                }

                store.dispatch('checkCrash', {index: i, x, y}).then(
                    isCrash => {
                        if (!isCrash) {
                            store.commit(MUTATIONS.UPDATE_BOMB_POSITION, { index: i, x, y })
                            store.dispatch(
                                "field/setNumber", 
                                { position: {x, y}, number: color },
                                {root: true}
                            )
                        }
                    }
                )
            })
        },
        checkCrash: (store, {index, x, y}) => {
            const piece = store.rootGetters['field/getCurrentPiece']
            if (!piece) return false

            let isCrash = false

            for (let r = 0; r < piece.shape.length && !isCrash; r++) {
                for (let c = 0; c < piece.shape[0].length && !isCrash; c++) {
                    if (piece.shape[r][c] === 1) {
                        const nx = piece.x + c
                        const ny = piece.y + r
                        isCrash ||= x == nx && y == ny
                    }
                }
            }
            if (isCrash) {
                store.dispatch('field/spawnPiece', null, {root: true})
                store.commit(MUTATIONS.REMOVE_BOMB, index)
            }
            return isCrash
        },
        handleBombCollision: (store, { bomb, index }) => {
            const color = bomb.color
            const fieldSize = store.rootGetters['field/getFieldSize']
            store.commit(MUTATIONS.REMOVE_BOMB, index)
            if (bomb.x >= 0 && bomb.x < fieldSize && bomb.y >= 0 && bomb.y < fieldSize) {
                store.dispatch(
                    'field/setNumber', 
                    { position: {x: bomb.x, y: bomb.y}, number: OBJECTS.NONE }, 
                    { root: true }
                )
            }

            if (color === OBJECTS.BLACK_BOMB) {
                store.dispatch('cube/bombClearAllAttachedPieces', null, { root: true }).then(count => {
                store.dispatch('game/addScore', -count, { root: true })
                })
            } else if (color === OBJECTS.RED_BOMB) {
                store.dispatch(
                    'game/updateTimer', 
                    { isIncrease: false, decreaseValue: 30, increaseValue: 0 }, 
                    { root: true }
                )
            } else if (color === OBJECTS.GREEN_BOMB) {
                store.dispatch(
                    'game/updateTimer', 
                    { isIncrease: true, decreaseValue: 0, increaseValue: 10 }, 
                    { root: true }
                )
            }
        },
        checkBomb: (store, {x, y}) => {
            const fieldSize = store.rootGetters['field/getFieldSize']
            if (x >= 0 && x < fieldSize && y >= 0 && y < fieldSize) {
                const cell = store.rootGetters['field/getFieldCell'](x, y)
                if (cell > 10) {
                    const bombs = store.state.bombs

                    bombs.forEach((bomb, i) => {
                        if (bomb.x == x && bomb.y == y)
                            store.dispatch(
                                'handleBombCollision', 
                                { bomb: { ...bomb, x: x, y: y }, index: i }
                            )
                    })
                }
            }
        },
    },
}