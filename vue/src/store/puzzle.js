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
    }),

    getters: {
        isWin: (state) => {
            if (!state.tiles || state.tiles.length === 0) return false
            if (!state.isGameActive) return false

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
            if (!state.tiles || state.tiles.length === 0) return []

            return state.tiles.map((value, index) => {
                return {
                    index: index,
                    value: value,
                    isEmpty: value === 0,
                    isBlocked: index === state.blockedIndex,
                }
            })
        },

        recordTime: (state) => {
            const key = `${state.gridSize}x${state.gridSize}`
            return state.records[key] || null
        },
    },

    mutations: {
        SET_GRID_SIZE(state, size) {
            state.gridSize = size
        },

        SET_TILES(state, tiles) {
            state.tiles = tiles
        },

        SET_MOVES(state, moves) {
            state.moves = moves
        },

        SET_TIMER(state, timer) {
            state.timer = timer
        },

        SET_SPECIAL_MOVES(state, count) {
            state.specialMoves = count
        },

        SET_BLOCKED_INDEX(state, index) {
            state.blockedIndex = index
        },

        SET_RECORDS(state, records) {
            state.records = records
        },

        SET_GAME_ACTIVE(state, active) {
            state.isGameActive = active
        },

        SWAP_TILES(state, { idx1, idx2 }) {
            const temp = state.tiles[idx1]
            state.tiles[idx1] = state.tiles[idx2]
            state.tiles[idx2] = temp
        },

        INCREMENT_TIMER(state) {
            if (state.isGameActive) {
                state.timer++
            }
        },

        INCREMENT_SPECIAL_MOVES(state) {
            if (state.isGameActive) {
                state.specialMoves++
            }
        },
    },

    actions: {
        formatTime({ state }, seconds) {
            const mins = Math.floor(seconds / 60)
            const secs = seconds % 60
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        },

        loadRecords({ commit }) {
            const saved = localStorage.getItem('puzzleRecords')
            if (saved) {
                commit('SET_RECORDS', JSON.parse(saved))
            }
        },

        saveRecord({ state, commit }) {
            const key = `${state.gridSize}x${state.gridSize}`
            const currentRecord = state.records[key]

            if (!currentRecord || state.timer < currentRecord) {
                const newRecords = { ...state.records, [key]: state.timer }
                commit('SET_RECORDS', newRecords)
                localStorage.setItem('puzzleRecords', JSON.stringify(newRecords))
            }
        },

        initGame({ commit, state }) {
            commit('SET_MOVES', 0)
            commit('SET_TIMER', 0)
            commit('SET_SPECIAL_MOVES', 0)
            commit('SET_BLOCKED_INDEX', null)
            commit('SET_GAME_ACTIVE', false)

            const total = state.gridSize * state.gridSize

            const tiles = Array.from(
                { length: total },
                (_, i) => {
                    return (i + 1) % total
                }
            )

            commit('SET_TILES', tiles)
        },

        shuffleBoard({ commit, state }) {
            let previousIndex = -1
            const shuffleMoves = state.gridSize * state.gridSize * 10

            for (let i = 0; i < shuffleMoves; i++) {
                const emptyIndex = state.tiles.indexOf(0)
                const row = Math.floor(emptyIndex / state.gridSize)
                const col = emptyIndex % state.gridSize
                const neighbors = []

                if (row > 0) neighbors.push(emptyIndex - state.gridSize)
                if (row < state.gridSize - 1) neighbors.push(emptyIndex + state.gridSize)
                if (col > 0) neighbors.push(emptyIndex - 1)
                if (col < state.gridSize - 1) neighbors.push(emptyIndex + 1)

                const validNeighbors = neighbors.filter((n) => n !== previousIndex)
                const randomNeighbor = validNeighbors[Math.floor(Math.random() * validNeighbors.length)]

                commit('SWAP_TILES', { idx1: emptyIndex, idx2: randomNeighbor })
                previousIndex = emptyIndex
            }

            const emptyIndex = state.tiles.indexOf(0)
            const row = Math.floor(emptyIndex / state.gridSize)
            const col = emptyIndex % state.gridSize
            const neighbors = []

            if (row > 0) neighbors.push(emptyIndex - state.gridSize)
            if (row < state.gridSize - 1) neighbors.push(emptyIndex + state.gridSize)
            if (col > 0) neighbors.push(emptyIndex - 1)
            if (col < state.gridSize - 1) neighbors.push(emptyIndex + 1)

            if (neighbors.length > 0) {
                const randomIndex = Math.floor(Math.random() * neighbors.length)
                commit('SET_BLOCKED_INDEX', neighbors[randomIndex])
            } else {
                commit('SET_BLOCKED_INDEX', null)
            }

            commit('SET_GAME_ACTIVE', true)
        },

        clearBlockedMove({ commit }) {
            commit('SET_BLOCKED_INDEX', null)
        },

        handleTileClick({ commit, state }, index) {
            if (!state.isGameActive) {
                return false
            }

            const emptyIndex = state.tiles.indexOf(0)

            if (state.specialMoves > 0 && state.tiles[index] !== 0) {
                commit('SWAP_TILES', { idx1: index, idx2: emptyIndex })
                commit('SET_SPECIAL_MOVES', state.specialMoves - 1)
                commit('SET_MOVES', state.moves + 1)
                commit('SET_BLOCKED_INDEX', null)

                const row = Math.floor(emptyIndex / state.gridSize)
                const col = emptyIndex % state.gridSize
                const neighbors = []

                if (row > 0) neighbors.push(emptyIndex - state.gridSize)
                if (row < state.gridSize - 1) neighbors.push(emptyIndex + state.gridSize)
                if (col > 0) neighbors.push(emptyIndex - 1)
                if (col < state.gridSize - 1) neighbors.push(emptyIndex + 1)

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

            if (row > 0) neighbors.push(emptyIndex - state.gridSize)
            if (row < state.gridSize - 1) neighbors.push(emptyIndex + state.gridSize)
            if (col > 0) neighbors.push(emptyIndex - 1)
            if (col < state.gridSize - 1) neighbors.push(emptyIndex + 1)

            if (neighbors.includes(index)) {
                commit('SWAP_TILES', { idx1: emptyIndex, idx2: index })
                commit('SET_MOVES', state.moves + 1)
                commit('SET_BLOCKED_INDEX', null)

                const newRow = Math.floor(index / state.gridSize)
                const newCol = index % state.gridSize
                const newNeighbors = []

                if (newRow > 0) newNeighbors.push(index - state.gridSize)
                if (newRow < state.gridSize - 1) newNeighbors.push(index + state.gridSize)
                if (newCol > 0) newNeighbors.push(index - 1)
                if (newCol < state.gridSize - 1) newNeighbors.push(index + 1)

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

        changeGridSize({ commit }, newSize) {
            commit('SET_GRID_SIZE', newSize)
        },
    },
}