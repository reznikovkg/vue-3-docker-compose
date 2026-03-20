const TIMER_DELAY = 1000
const SPECIAL_MOVE_DELAY = 60000
const IDLE_TIME_THRESHOLD = 5
const PENALTY_TIME = 10
const FAST_TIMER_MULTIPLIER = 2

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
        SET_GRID_SIZE: (state, size) => {
            state.gridSize = size
        },

        SET_TILES: (state, tiles) => {
            state.tiles = tiles
        },

        SET_MOVES: (state, moves) => {
            state.moves = moves
        },

        SET_TIMER: (state, timer) => {
            state.timer = timer
        },

        SET_SPECIAL_MOVES: (state, count) => {
            state.specialMoves = count
        },

        SET_BLOCKED_INDEX: (state, index) => {
            state.blockedIndex = index
        },

        SET_RECORDS: (state, records) => {
            state.records = records
        },

        SET_GAME_ACTIVE: (state, active) => {
            state.isGameActive = active
        },

        SET_LAST_MOVE_INDEX: (state, index) => {
            state.secondLastMoveIndex = state.lastMoveIndex
            state.lastMoveIndex = index
        },

        SET_PENALTY_TIME: (state, time) => {
            state.penaltyTime = time
        },

        SET_BONUS_TIME: (state, time) => {
            state.bonusTime = time
        },

        SET_IDLE_TIME: (state, time) => {
            state.idleTime = time
        },

        SET_FAST_TIMER: (state, isFast) => {
            state.isFastTimer = isFast
        },

        SET_FROZEN_TILES: (state, tiles) => {
            state.frozenTiles = tiles
        },

        SET_TIMER_TIMEOUT: (state, timeout) => {
            state.timerTimeout = timeout
        },

        SET_SPECIAL_MOVE_TIMEOUT: (state, timeout) => {
            state.specialMoveTimeout = timeout
        },

        SET_IDLE_TIMEOUT: (state, timeout) => {
            state.idleTimeout = timeout
        },

        SWAP_TILES: (state, { idx1, idx2 }) => {
            const temp = state.tiles[idx1]
            state.tiles[idx1] = state.tiles[idx2]
            state.tiles[idx2] = temp
        },

        INCREMENT_TIMER: (state) => {
            if (state.isGameActive) {
                if (state.isFastTimer) {
                    state.timer += FAST_TIMER_MULTIPLIER
                } else {
                    state.timer++
                }
            }
        },

        INCREMENT_SPECIAL_MOVES: (state) => {
            if (state.isGameActive) {
                state.specialMoves++
            }
        },

        INCREMENT_IDLE_TIME: (state) => {
            if (state.isGameActive) {
                state.idleTime++

                if (state.idleTime >= IDLE_TIME_THRESHOLD && !state.isFastTimer) {
                    state.isFastTimer = true
                }
            }
        },

        RESET_IDLE_TIME: (state) => {
            state.idleTime = 0
            state.isFastTimer = false
        },

        CLEAR_TIMER_TIMEOUT: (state) => {
            if (state.timerTimeout) {
                clearTimeout(state.timerTimeout)
                state.timerTimeout = null
            }
        },

        CLEAR_SPECIAL_MOVE_TIMEOUT: (state) => {
            if (state.specialMoveTimeout) {
                clearTimeout(state.specialMoveTimeout)
                state.specialMoveTimeout = null
            }
        },

        CLEAR_IDLE_TIMEOUT: (state) => {
            if (state.idleTimeout) {
                clearTimeout(state.idleTimeout)
                state.idleTimeout = null
            }
        },

        UPDATE_FROZEN_TILES: (state) => {
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
            commit('SET_MOVES', 0)
            commit('SET_TIMER', 0)
            commit('SET_SPECIAL_MOVES', 0)
            commit('SET_BLOCKED_INDEX', null)
            commit('SET_GAME_ACTIVE', false)
            commit('SET_LAST_MOVE_INDEX', null)
            commit('SET_PENALTY_TIME', 0)
            commit('SET_BONUS_TIME', 0)
            commit('SET_IDLE_TIME', 0)
            commit('SET_FAST_TIMER', false)
            commit('SET_FROZEN_TILES', [])
            commit('CLEAR_TIMER_TIMEOUT')
            commit('CLEAR_SPECIAL_MOVE_TIMEOUT')
            commit('CLEAR_IDLE_TIMEOUT')

            const total = state.gridSize * state.gridSize

            const tiles = Array.from(
                { length: total },
                (_, i) => {
                    return (i + 1) % total
                }
            )

            commit('SET_TILES', tiles)
        },

        shuffleBoard: ({ commit, state }) => {
            let previousIndex = -1
            const shuffleMoves = state.gridSize * state.gridSize * 10

            for (let i = 0; i < shuffleMoves; i++) {
                const emptyIndex = state.tiles.indexOf(0)
                const row = Math.floor(emptyIndex / state.gridSize)
                const col = emptyIndex % state.gridSize
                const neighbors = []

                if (row > 0) {
                    neighbors.push(emptyIndex - state.gridSize)
                }

                if (row < state.gridSize - 1) {
                    neighbors.push(emptyIndex + state.gridSize)
                }

                if (col > 0) {
                    neighbors.push(emptyIndex - 1)
                }

                if (col < state.gridSize - 1) {
                    neighbors.push(emptyIndex + 1)
                }

                const validNeighbors = neighbors.filter((n) => {
                    return n !== previousIndex
                })
                const randomNeighbor = validNeighbors[Math.floor(Math.random() * validNeighbors.length)]

                commit('SWAP_TILES', { idx1: emptyIndex, idx2: randomNeighbor })
                previousIndex = emptyIndex
            }

            const emptyIndex = state.tiles.indexOf(0)
            const row = Math.floor(emptyIndex / state.gridSize)
            const col = emptyIndex % state.gridSize
            const neighbors = []

            if (row > 0) {
                neighbors.push(emptyIndex - state.gridSize)
            }

            if (row < state.gridSize - 1) {
                neighbors.push(emptyIndex + state.gridSize)
            }

            if (col > 0) {
                neighbors.push(emptyIndex - 1)
            }

            if (col < state.gridSize - 1) {
                neighbors.push(emptyIndex + 1)
            }

            if (neighbors.length > 0) {
                const randomIndex = Math.floor(Math.random() * neighbors.length)
                commit('SET_BLOCKED_INDEX', neighbors[randomIndex])
            } else {
                commit('SET_BLOCKED_INDEX', null)
            }

            commit('SET_GAME_ACTIVE', true)
        },

        handleTileClick: ({ commit, state }, index) => {
            if (!state.isGameActive) {
                return false
            }

            const emptyIndex = state.tiles.indexOf(0)

            if (state.frozenTiles.includes(index) && state.tiles[index] !== 0) {
                return false
            }

            if (state.frozenTiles.includes(emptyIndex) && state.tiles[emptyIndex] !== 0) {
                return false
            }

            if (state.specialMoves > 0 && state.tiles[index] !== 0) {
                commit('SWAP_TILES', { idx1: index, idx2: emptyIndex })
                commit('SET_SPECIAL_MOVES', state.specialMoves - 1)
                commit('SET_MOVES', state.moves + 1)
                commit('SET_BLOCKED_INDEX', null)
                commit('RESET_IDLE_TIME')

                if (index === state.secondLastMoveIndex && emptyIndex === state.lastMoveIndex) {
                    commit('SET_PENALTY_TIME', state.penaltyTime + PENALTY_TIME)
                }

                commit('SET_LAST_MOVE_INDEX', index)
                commit('UPDATE_FROZEN_TILES')

                const row = Math.floor(emptyIndex / state.gridSize)
                const col = emptyIndex % state.gridSize
                const neighbors = []

                if (row > 0) {
                    neighbors.push(emptyIndex - state.gridSize)
                }

                if (row < state.gridSize - 1) {
                    neighbors.push(emptyIndex + state.gridSize)
                }

                if (col > 0) {
                    neighbors.push(emptyIndex - 1)
                }

                if (col < state.gridSize - 1) {
                    neighbors.push(emptyIndex + 1)
                }

                if (neighbors.length > 0) {
                    const randomIndex = Math.floor(Math.random() * neighbors.length)
                    commit('SET_BLOCKED_INDEX', neighbors[randomIndex])
                }

                const total = state.gridSize * state.gridSize
                let isWin = true

                for (let i = 0; i < total; i++) {
                    const expectedValue = (i < total - 1) ? (i + 1) : 0

                    if (state.tiles[i] !== expectedValue) {
                        isWin = false
                        break
                    }
                }

                if (isWin) {
                    commit('SET_GAME_ACTIVE', false)
                }

                return true
            }

            if (index === state.blockedIndex) {
                return false
            }

            const row = Math.floor(emptyIndex / state.gridSize)
            const col = emptyIndex % state.gridSize
            const neighbors = []

            if (row > 0) {
                neighbors.push(emptyIndex - state.gridSize)
            }

            if (row < state.gridSize - 1) {
                neighbors.push(emptyIndex + state.gridSize)
            }

            if (col > 0) {
                neighbors.push(emptyIndex - 1)
            }

            if (col < state.gridSize - 1) {
                neighbors.push(emptyIndex + 1)
            }

            if (neighbors.includes(index)) {
                commit('SWAP_TILES', { idx1: emptyIndex, idx2: index })
                commit('SET_MOVES', state.moves + 1)
                commit('SET_BLOCKED_INDEX', null)
                commit('RESET_IDLE_TIME')

                if (index === state.secondLastMoveIndex && emptyIndex === state.lastMoveIndex) {
                    commit('SET_PENALTY_TIME', state.penaltyTime + PENALTY_TIME)
                }

                commit('SET_LAST_MOVE_INDEX', index)
                commit('UPDATE_FROZEN_TILES')

                const newRow = Math.floor(index / state.gridSize)
                const newCol = index % state.gridSize
                const newNeighbors = []

                if (newRow > 0) {
                    newNeighbors.push(index - state.gridSize)
                }

                if (newRow < state.gridSize - 1) {
                    newNeighbors.push(index + state.gridSize)
                }

                if (newCol > 0) {
                    newNeighbors.push(index - 1)
                }

                if (newCol < state.gridSize - 1) {
                    newNeighbors.push(index + 1)
                }

                if (newNeighbors.length > 0) {
                    const randomIndex = Math.floor(Math.random() * newNeighbors.length)
                    commit('SET_BLOCKED_INDEX', newNeighbors[randomIndex])
                }

                const total = state.gridSize * state.gridSize
                let isWin = true

                for (let i = 0; i < total; i++) {
                    const expectedValue = (i < total - 1) ? (i + 1) : 0

                    if (state.tiles[i] !== expectedValue) {
                        isWin = false
                        break
                    }
                }

                if (isWin) {
                    commit('SET_GAME_ACTIVE', false)
                }

                return true
            }

            return false
        },

        changeGridSize: ({ commit }, newSize) => {
            commit('SET_GRID_SIZE', newSize)
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
                commit('SWAP_TILES', { idx1: emptyIndex, idx2: targetIndex })
                commit('SET_MOVES', state.moves + 1)
                commit('RESET_IDLE_TIME')
                commit('UPDATE_FROZEN_TILES')
            }
        },

        startTimers: ({ commit, state }) => {
            commit('CLEAR_TIMER_TIMEOUT')
            commit('CLEAR_SPECIAL_MOVE_TIMEOUT')
            commit('CLEAR_IDLE_TIMEOUT')

            const timerLoop = () => {
                if (!state.isGameActive) {
                    return
                }
                commit('INCREMENT_TIMER')
                commit('SET_TIMER_TIMEOUT', setTimeout(timerLoop, TIMER_DELAY))
            }

            const specialMoveLoop = () => {
                if (!state.isGameActive) {
                    return
                }
                commit('INCREMENT_SPECIAL_MOVES')
                commit('SET_SPECIAL_MOVE_TIMEOUT', setTimeout(specialMoveLoop, SPECIAL_MOVE_DELAY))
            }

            const idleLoop = () => {
                if (!state.isGameActive) {
                    return
                }
                commit('INCREMENT_IDLE_TIME')
                commit('SET_IDLE_TIMEOUT', setTimeout(idleLoop, TIMER_DELAY))
            }

            timerLoop()
            setTimeout(specialMoveLoop, SPECIAL_MOVE_DELAY)
            idleLoop()
        },

        stopTimers: ({ commit }) => {
            commit('CLEAR_TIMER_TIMEOUT')
            commit('CLEAR_SPECIAL_MOVE_TIMEOUT')
            commit('CLEAR_IDLE_TIMEOUT')
        },
    },
}