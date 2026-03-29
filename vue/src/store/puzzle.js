const TIMER_DELAY = 1000
const SPECIAL_MOVE_DELAY = 60000
const IDLE_TIME_THRESHOLD = 5
const PENALTY_TIME = 10
const FAST_TIMER_MULTIPLIER = 2

const MUTATIONS = {
    SET_GRID_SIZE: 'SET_GRID_SIZE',
    SET_TILES: 'SET_TILES',
    SET_MOVES: 'SET_MOVES',
    SET_TIMER: 'SET_TIMER',
    SET_SPECIAL_MOVES: 'SET_SPECIAL_MOVES',
    SET_BLOCKED_INDEX: 'SET_BLOCKED_INDEX',
    SET_RECORDS: 'SET_RECORDS',
    SET_GAME_ACTIVE: 'SET_GAME_ACTIVE',
    SET_LAST_MOVE_INDEX: 'SET_LAST_MOVE_INDEX',
    SET_PENALTY_TIME: 'SET_PENALTY_TIME',
    SET_BONUS_TIME: 'SET_BONUS_TIME',
    SET_IDLE_TIME: 'SET_IDLE_TIME',
    SET_FAST_TIMER: 'SET_FAST_TIMER',
    SET_FROZEN_TILES: 'SET_FROZEN_TILES',
    SET_TIMER_TIMEOUT: 'SET_TIMER_TIMEOUT',
    SET_SPECIAL_MOVE_TIMEOUT: 'SET_SPECIAL_MOVE_TIMEOUT',
    SET_IDLE_TIMEOUT: 'SET_IDLE_TIMEOUT',
    SWAP_TILES: 'SWAP_TILES',
    INCREMENT_TIMER: 'INCREMENT_TIMER',
    INCREMENT_SPECIAL_MOVES: 'INCREMENT_SPECIAL_MOVES',
    INCREMENT_IDLE_TIME: 'INCREMENT_IDLE_TIME',
    RESET_IDLE_TIME: 'RESET_IDLE_TIME',
    CLEAR_TIMER_TIMEOUT: 'CLEAR_TIMER_TIMEOUT',
    CLEAR_SPECIAL_MOVE_TIMEOUT: 'CLEAR_SPECIAL_MOVE_TIMEOUT',
    CLEAR_IDLE_TIMEOUT: 'CLEAR_IDLE_TIMEOUT',
    UPDATE_FROZEN_TILES: 'UPDATE_FROZEN_TILES',
}

const getNeighbors = (gridSize, index) => {
    const row = Math.floor(index / gridSize)
    const col = index % gridSize
    const neighbors = []

    if (row > 0) {
        neighbors.push(index - gridSize)
    }

    if (row < gridSize - 1) {
        neighbors.push(index + gridSize)
    }

    if (col > 0) {
        neighbors.push(index - 1)
    }

    if (col < gridSize - 1) {
        neighbors.push(index + 1)
    }

    return neighbors
}

const checkWin = (tiles, gridSize) => {
    const total = gridSize * gridSize

    for (let i = 0; i < total; i++) {
        const expectedValue = (i < total - 1) ? (i + 1) : 0

        if (tiles[i] !== expectedValue) {
            return false
        }
    }

    return true
}

const checkPenalty = (lastMoveIndex, secondLastMoveIndex, currentIndex, emptyIndex) => {
    return currentIndex === secondLastMoveIndex && emptyIndex === lastMoveIndex
}

const isTileFrozen = (frozenTiles, index, value) => {
    return frozenTiles.includes(index) && value !== 0
}

const swapTilesAndCommit = (commit, tiles, idx1, idx2) => {
    commit(MUTATIONS.SWAP_TILES, { idx1, idx2 })
}

const updateBlockedIndex = (commit, state, emptyIndex) => {
    const neighbors = getNeighbors(state.gridSize, emptyIndex)

    if (neighbors.length > 0) {
        const randomIndex = Math.floor(Math.random() * neighbors.length)
        commit(MUTATIONS.SET_BLOCKED_INDEX, neighbors[randomIndex])
    } else {
        commit(MUTATIONS.SET_BLOCKED_INDEX, null)
    }
}

const processMove = (commit, state, clickedIndex, emptyIndex) => {
    commit(MUTATIONS.RESET_IDLE_TIME)

    if (checkPenalty(state.lastMoveIndex, state.secondLastMoveIndex, clickedIndex, emptyIndex)) {
        commit(MUTATIONS.SET_PENALTY_TIME, state.penaltyTime + PENALTY_TIME)
    }

    commit(MUTATIONS.SET_LAST_MOVE_INDEX, clickedIndex)
    commit(MUTATIONS.UPDATE_FROZEN_TILES)

    const newEmptyIndex = state.tiles.indexOf(0)
    updateBlockedIndex(commit, state, newEmptyIndex)

    if (checkWin(state.tiles, state.gridSize)) {
        commit(MUTATIONS.SET_GAME_ACTIVE, false)
    }
}

const executeSpecialMove = (commit, state, index, emptyIndex) => {
    swapTilesAndCommit(commit, state.tiles, index, emptyIndex)
    commit(MUTATIONS.SET_SPECIAL_MOVES, state.specialMoves - 1)
    commit(MUTATIONS.SET_MOVES, state.moves + 1)
    commit(MUTATIONS.SET_BLOCKED_INDEX, null)

    processMove(commit, state, index, emptyIndex)

    return true
}

const executeNormalMove = (commit, state, index, emptyIndex) => {
    const neighbors = getNeighbors(state.gridSize, emptyIndex)

    if (!neighbors.includes(index)) {
        return false
    }

    swapTilesAndCommit(commit, state.tiles, emptyIndex, index)
    commit(MUTATIONS.SET_MOVES, state.moves + 1)
    commit(MUTATIONS.SET_BLOCKED_INDEX, null)

    processMove(commit, state, index, emptyIndex)

    return true
}

const shuffleOnce = (state, previousIndex) => {
    const emptyIndex = state.tiles.indexOf(0)
    const neighbors = getNeighbors(state.gridSize, emptyIndex)
    const validNeighbors = neighbors.filter((n) => n !== previousIndex)

    if (validNeighbors.length === 0) {
        return previousIndex
    }

    const randomNeighbor = validNeighbors[Math.floor(Math.random() * validNeighbors.length)]

    return { emptyIndex, randomNeighbor }
}

export default {
    namespaced: true,

    state: () => ({
        gridSize: 4,
        tiles: [],
        moves: 0,
        timer: 0,
        specialMoves: 0,
        blockedIndex: null,
        records: {},
        isGameActive: false,
        lastMoveIndex: null,
        secondLastMoveIndex: null,
        penaltyTime: 0,
        bonusTime: 0,
        idleTime: 0,
        isFastTimer: false,
        frozenTiles: [],
        timerTimeout: null,
        specialMoveTimeout: null,
        idleTimeout: null,
    }),

    getters: {
        gridSize: (state) => state.gridSize,
        moves: (state) => state.moves,
        timer: (state) => state.timer,
        specialMoves: (state) => state.specialMoves,
        blockedIndex: (state) => state.blockedIndex,
        records: (state) => state.records,
        isGameActive: (state) => state.isGameActive,
        tiles: (state) => state.tiles,
        penaltyTime: (state) => state.penaltyTime,
        bonusTime: (state) => state.bonusTime,
        frozenTiles: (state) => state.frozenTiles,

        isWin: (state) => {
            if (!state.tiles || state.tiles.length === 0) {
                return false
            }

            if (!state.isGameActive) {
                return false
            }

            const total = state.gridSize * state.gridSize

            for (let i = 0; i < total; i++) {
                const expectedValue = (i < total - 1) ? (i + 1) : 0

                if (state.tiles[i] !== expectedValue) {
                    return false
                }
            }

            return true
        },

        tileList: (state) => {
            if (!state.tiles || state.tiles.length === 0) {
                return []
            }

            return state.tiles.map((value, index) => {
                return {
                    index: index,
                    value: value,
                    isEmpty: value === 0,
                    isBlocked: index === state.blockedIndex,
                    isFrozen: state.frozenTiles.includes(index),
                }
            })
        },

        recordTime: (state) => {
            const key = `${state.gridSize}x${state.gridSize}`
            return state.records[key] || null
        },

        displayTime: (state) => {
            const total = state.timer + state.penaltyTime - state.bonusTime
            return total < 0 ? 0 : total
        },
    },

    mutations: {
        [MUTATIONS.SET_GRID_SIZE]: (state, size) => {
            state.gridSize = size
        },

        [MUTATIONS.SET_TILES]: (state, tiles) => {
            state.tiles = tiles
        },

        [MUTATIONS.SET_MOVES]: (state, moves) => {
            state.moves = moves
        },

        [MUTATIONS.SET_TIMER]: (state, timer) => {
            state.timer = timer
        },

        [MUTATIONS.SET_SPECIAL_MOVES]: (state, count) => {
            state.specialMoves = count
        },

        [MUTATIONS.SET_BLOCKED_INDEX]: (state, index) => {
            state.blockedIndex = index
        },

        [MUTATIONS.SET_RECORDS]: (state, records) => {
            state.records = records
        },

        [MUTATIONS.SET_GAME_ACTIVE]: (state, active) => {
            state.isGameActive = active
        },

        [MUTATIONS.SET_LAST_MOVE_INDEX]: (state, index) => {
            state.secondLastMoveIndex = state.lastMoveIndex
            state.lastMoveIndex = index
        },

        [MUTATIONS.SET_PENALTY_TIME]: (state, time) => {
            state.penaltyTime = time
        },

        [MUTATIONS.SET_BONUS_TIME]: (state, time) => {
            state.bonusTime = time
        },

        [MUTATIONS.SET_IDLE_TIME]: (state, time) => {
            state.idleTime = time
        },

        [MUTATIONS.SET_FAST_TIMER]: (state, isFast) => {
            state.isFastTimer = isFast
        },

        [MUTATIONS.SET_FROZEN_TILES]: (state, tiles) => {
            state.frozenTiles = tiles
        },

        [MUTATIONS.SET_TIMER_TIMEOUT]: (state, timeout) => {
            state.timerTimeout = timeout
        },

        [MUTATIONS.SET_SPECIAL_MOVE_TIMEOUT]: (state, timeout) => {
            state.specialMoveTimeout = timeout
        },

        [MUTATIONS.SET_IDLE_TIMEOUT]: (state, timeout) => {
            state.idleTimeout = timeout
        },

        [MUTATIONS.SWAP_TILES]: (state, { idx1, idx2 }) => {
            const temp = state.tiles[idx1]
            state.tiles[idx1] = state.tiles[idx2]
            state.tiles[idx2] = temp
        },

        [MUTATIONS.INCREMENT_TIMER]: (state) => {
            if (state.isGameActive) {
                if (state.isFastTimer) {
                    state.timer += FAST_TIMER_MULTIPLIER
                } else {
                    state.timer++
                }
            }
        },

        [MUTATIONS.INCREMENT_SPECIAL_MOVES]: (state) => {
            if (state.isGameActive) {
                state.specialMoves++
            }
        },

        [MUTATIONS.INCREMENT_IDLE_TIME]: (state) => {
            if (state.isGameActive) {
                state.idleTime++

                if (state.idleTime >= IDLE_TIME_THRESHOLD && !state.isFastTimer) {
                    state.isFastTimer = true
                }
            }
        },

        [MUTATIONS.RESET_IDLE_TIME]: (state) => {
            state.idleTime = 0
            state.isFastTimer = false
        },

        [MUTATIONS.CLEAR_TIMER_TIMEOUT]: (state) => {
            if (state.timerTimeout) {
                clearTimeout(state.timerTimeout)
                state.timerTimeout = null
            }
        },

        [MUTATIONS.CLEAR_SPECIAL_MOVE_TIMEOUT]: (state) => {
            if (state.specialMoveTimeout) {
                clearTimeout(state.specialMoveTimeout)
                state.specialMoveTimeout = null
            }
        },

        [MUTATIONS.CLEAR_IDLE_TIMEOUT]: (state) => {
            if (state.idleTimeout) {
                clearTimeout(state.idleTimeout)
                state.idleTimeout = null
            }
        },

        [MUTATIONS.UPDATE_FROZEN_TILES]: (state) => {
            const total = state.gridSize * state.gridSize
            const newFrozenTiles = []

            for (let i = 0; i < total; i++) {
                const expectedValue = (i < total - 1) ? (i + 1) : 0
                const currentValue = state.tiles[i]

                if (currentValue === expectedValue && currentValue !== 0) {
                    newFrozenTiles.push(i)
                }
            }

            state.frozenTiles = newFrozenTiles
        },
    },

    actions: {
        initGame: ({ commit, state }) => {
            commit(MUTATIONS.SET_MOVES, 0)
            commit(MUTATIONS.SET_TIMER, 0)
            commit(MUTATIONS.SET_SPECIAL_MOVES, 0)
            commit(MUTATIONS.SET_BLOCKED_INDEX, null)
            commit(MUTATIONS.SET_GAME_ACTIVE, false)
            commit(MUTATIONS.SET_LAST_MOVE_INDEX, null)
            commit(MUTATIONS.SET_PENALTY_TIME, 0)
            commit(MUTATIONS.SET_BONUS_TIME, 0)
            commit(MUTATIONS.SET_IDLE_TIME, 0)
            commit(MUTATIONS.SET_FAST_TIMER, false)
            commit(MUTATIONS.SET_FROZEN_TILES, [])
            commit(MUTATIONS.CLEAR_TIMER_TIMEOUT)
            commit(MUTATIONS.CLEAR_SPECIAL_MOVE_TIMEOUT)
            commit(MUTATIONS.CLEAR_IDLE_TIMEOUT)

            const total = state.gridSize * state.gridSize

            const tiles = Array.from(
                { length: total },
                (_, i) => {
                    return (i + 1) % total
                }
            )

            commit(MUTATIONS.SET_TILES, tiles)
        },

        shuffleBoard: ({ commit, state }) => {
            let previousIndex = -1
            const shuffleMoves = state.gridSize * state.gridSize * 10

            for (let i = 0; i < shuffleMoves; i++) {
                const result = shuffleOnce(state, previousIndex)

                if (result.emptyIndex !== undefined) {
                    commit(MUTATIONS.SWAP_TILES, { idx1: result.emptyIndex, idx2: result.randomNeighbor })
                    previousIndex = result.emptyIndex
                }
            }

            const emptyIndex = state.tiles.indexOf(0)
            updateBlockedIndex(commit, state, emptyIndex)

            commit(MUTATIONS.UPDATE_FROZEN_TILES)
            commit(MUTATIONS.SET_GAME_ACTIVE, true)
        },

        handleTileClick: ({ commit, state }, index) => {
            if (!state.isGameActive) {
                return false
            }

            const emptyIndex = state.tiles.indexOf(0)

            if (isTileFrozen(state.frozenTiles, index, state.tiles[index])) {
                return false
            }

            if (isTileFrozen(state.frozenTiles, emptyIndex, state.tiles[emptyIndex])) {
                return false
            }

            if (index === state.blockedIndex) {
                return false
            }

            if (state.specialMoves > 0 && state.tiles[index] !== 0) {
                return executeSpecialMove(commit, state, index, emptyIndex)
            }

            return executeNormalMove(commit, state, index, emptyIndex)
        },

        changeGridSize: ({ commit }, newSize) => {
            commit(MUTATIONS.SET_GRID_SIZE, newSize)
        },

        handleSwipe: ({ commit, state }, direction) => {
            const emptyIndex = state.tiles.indexOf(0)
            const row = Math.floor(emptyIndex / state.gridSize)
            const col = emptyIndex % state.gridSize
            let targetIndex = null

            if (direction === 'up' && row < state.gridSize - 1) {
                targetIndex = emptyIndex + state.gridSize
            } else if (direction === 'down' && row > 0) {
                targetIndex = emptyIndex - state.gridSize
            } else if (direction === 'left' && col < state.gridSize - 1) {
                targetIndex = emptyIndex + 1
            } else if (direction === 'right' && col > 0) {
                targetIndex = emptyIndex - 1
            }

            if (targetIndex !== null) {
                commit(MUTATIONS.SWAP_TILES, { idx1: emptyIndex, idx2: targetIndex })
                commit(MUTATIONS.SET_MOVES, state.moves + 1)
                commit(MUTATIONS.RESET_IDLE_TIME)
                commit(MUTATIONS.UPDATE_FROZEN_TILES)
            }
        },

        startTimers: ({ commit, state }) => {
            commit(MUTATIONS.CLEAR_TIMER_TIMEOUT)
            commit(MUTATIONS.CLEAR_SPECIAL_MOVE_TIMEOUT)
            commit(MUTATIONS.CLEAR_IDLE_TIMEOUT)

            const timerLoop = () => {
                if (!state.isGameActive) {
                    return
                }
                commit(MUTATIONS.INCREMENT_TIMER)
                const timeout = setTimeout(timerLoop, TIMER_DELAY)
                commit(MUTATIONS.SET_TIMER_TIMEOUT, timeout)
            }

            const specialMoveLoop = () => {
                if (!state.isGameActive) {
                    return
                }
                commit(MUTATIONS.INCREMENT_SPECIAL_MOVES)
                const timeout = setTimeout(specialMoveLoop, SPECIAL_MOVE_DELAY)
                commit(MUTATIONS.SET_SPECIAL_MOVE_TIMEOUT, timeout)
            }

            const idleLoop = () => {
                if (!state.isGameActive) {
                    return
                }
                commit(MUTATIONS.INCREMENT_IDLE_TIME)
                const timeout = setTimeout(idleLoop, TIMER_DELAY)
                commit(MUTATIONS.SET_IDLE_TIMEOUT, timeout)
            }

            timerLoop()

            const specialTimeout = setTimeout(specialMoveLoop, SPECIAL_MOVE_DELAY)
            commit(MUTATIONS.SET_SPECIAL_MOVE_TIMEOUT, specialTimeout)

            idleLoop()
        },

        stopTimers: ({ commit }) => {
            commit(MUTATIONS.CLEAR_TIMER_TIMEOUT)
            commit(MUTATIONS.CLEAR_SPECIAL_MOVE_TIMEOUT)
            commit(MUTATIONS.CLEAR_IDLE_TIMEOUT)
        },
    },
}