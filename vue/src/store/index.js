import {createStore} from 'vuex'
import {canPlaceShape} from '@/utils/utils.js'

const MUTATIONS = {
    SET_SHAPE: 'SET_SHAPE',
    ADD_OBJECT: 'ADD_OBJECT',
    REMOVE_OBJECT: 'REMOVE_OBJECT',
    SET_MODE: 'SET_MODE',
    SET_DRAGGING: 'SET_DRAGGING',
    SET_PREVIEW_ORIGIN: 'SET_PREVIEW_ORIGIN',
    SET_GRID_SIZE: 'SET_GRID_SIZE',
    SET_PANNING: 'SET_PANNING',
    SET_OFFSET: 'SET_OFFSET',
    MOVE_OFFSET: 'MOVE_OFFSET',
    SET_SCALE: 'SET_SCALE',
    DECREASE_BALANCE: 'DECREASE_BALANCE',
    INCREASE_BALANCE: 'INCREASE_BALANCE',
    ADD_VISITOR: 'ADD_VISITOR'
}

const VISITOR_STATES = {
    WALKING: 'walking',
    LEAVING: 'leaving',
    TO_REMOVE: 'to_remove',
    INSIDE: 'inside',
}

export default createStore({
    actions: {
        tickVisitors({state, getters}) {
            const graph = getters.roadGraph
            const entrance = state.park.entrance

            for (const v of state.visitors) {
                if (v.state === VISITOR_STATES.TO_REMOVE) {
                    continue
                }

                if (v.state === VISITOR_STATES.LEAVING) {
                    v.state = VISITOR_STATES.TO_REMOVE
                    continue
                }

                const neighbors = graph.get(v.node) || []

                if (!neighbors.length) {
                    continue
                }

                let options = neighbors

                if (v.prevNode) {
                    options = neighbors.filter(n => n !== v.prevNode)
                }

                const next = options.length
                    ? options[Math.floor(Math.random() * options.length)]
                    : neighbors[0]

                v.prevNode = v.node
                v.node = next

                if (v.prevNode && v.node === `${entrance.x}:${entrance.y}`) {
                    v.state = VISITOR_STATES.LEAVING
                }
            }

            state.visitors = state.visitors.filter(v => v.state !== VISITOR_STATES.TO_REMOVE)
        },

        spawnVisitor({commit, state, getters}) {
            const max = getters.buildings.length * 5

            if (state.visitors.length >= max) {
                return
            }

            const entry = state.park.entrance

            const startNode = `${entry.x}:${entry.y}`

            commit(MUTATIONS.ADD_VISITOR, {
                id: crypto.randomUUID(),
                number: state.visitorCounter++,
                node: startNode,
                prevNode: null,
                state: VISITOR_STATES.WALKING,
                money: Math.floor(20 + Math.random() * 81)
            })
        },

        resizeGrid({state, commit}, {width, height}) {
            const objects = state.grid.objects

            const isValid = objects.every(obj =>
                obj.shape.cells.every(cell => {
                    const x = obj.origin.x + cell.x
                    const y = obj.origin.y + cell.y

                    return x >= 0 && y >= 0 && x < width && y < height
                })
            )

            if (!isValid) {
                return {
                    ok: false,
                    message: 'Сначала удалите объекты, выходящие за границы'
                }
            }

            commit(MUTATIONS.SET_GRID_SIZE, {width, height})

            return {ok: true}
        },

        placeObject({state, getters, commit}, {origin}) {
            const occupiedMap = getters.occupiedMap
            const shape = state.grid.selectedShape

            const canPlace = canPlaceShape({
                shape,
                origin,
                occupiedMap,
                width: state.grid.width,
                height: state.grid.height
            })

            if (!canPlace) return {ok: false}

            if (state.park.balance < shape.cost) {
                commit(MUTATIONS.SET_SHAPE, null)
                commit(MUTATIONS.SET_PREVIEW_ORIGIN, null)
                return {ok: false, message: 'Недостаточно средств'}
            }

            commit(MUTATIONS.DECREASE_BALANCE, shape.cost)

            commit(MUTATIONS.ADD_OBJECT, {
                id: crypto.randomUUID(),
                shape,
                origin
            })

            if (shape.id !== 'road') {
                commit(MUTATIONS.SET_SHAPE, null)
                commit(MUTATIONS.SET_PREVIEW_ORIGIN, null)
            }

            return {ok: true}
        },

        setScale({commit}, scale) {
            commit(MUTATIONS.SET_SCALE, scale)
        },

        startPanning({commit}, payload) {
            commit(MUTATIONS.SET_PANNING, true, payload)
        },

        movePanning({commit}, payload) {
            commit(MUTATIONS.MOVE_OFFSET, payload)
        },

        stopPanning({commit}) {
            commit(MUTATIONS.SET_PANNING, false)
        },

        setDragging({commit}, shape) {
            commit(MUTATIONS.SET_DRAGGING, shape)
        },

        setPreviewOrigin({commit}, origin) {
            commit(MUTATIONS.SET_PREVIEW_ORIGIN, origin)
        },

        setShape({commit}, shape) {
            commit(MUTATIONS.SET_SHAPE, shape)
        },

        addObject({commit}, obj) {
            commit(MUTATIONS.ADD_OBJECT, obj)
        },

        removeObject({commit, getters}, payload) {
            const occupiedMap = getters.occupiedMap
            const obj = occupiedMap.get(`${payload.x}-${payload.y}`)

            const refund = Math.floor(obj.shape.cost * 0.5)

            commit(MUTATIONS.INCREASE_BALANCE, refund)

            commit(MUTATIONS.REMOVE_OBJECT, payload)
        },

        setMode({commit}, mode) {
            commit(MUTATIONS.SET_MODE, mode)
        }
    },
    getters: {
        roadGraph: (state, getters) => {
            const graph = new Map()
            const occupiedMap = getters.occupiedMap

            const dirs = [
                [1, 0], [-1, 0], [0, 1], [0, -1]
            ]

            const isRoad = (x, y) => {
                const obj = occupiedMap.get(`${x}-${y}`)
                return obj && obj.shape.id === 'road'
            }

            for (const [key, obj] of occupiedMap) {
                if (obj.shape.id !== 'road') continue

                const [x, y] = key.split('-').map(Number)

                const neighbors = []

                for (const [dx, dy] of dirs) {
                    const nx = x + dx
                    const ny = y + dy

                    if (isRoad(nx, ny)) {
                        neighbors.push(`${nx}:${ny}`)
                    }
                }

                graph.set(`${x}:${y}`, neighbors)
            }

            const entry = state.park.entrance

            const startNode = `${entry.x}:${entry.y}`
            const nextNode = `${entry.x + 1}:${entry.y}`

            graph.set(startNode, [nextNode])

            const neighbors = [startNode]

            for (const [dx, dy] of dirs) {
                const nx = entry.x + 1 + dx
                const ny = entry.y + dy

                if (isRoad(nx, ny)) {
                    neighbors.push(`${nx}:${ny}`)
                }
            }

            graph.set(nextNode, neighbors)

            return graph
        },

        visitors(state) {
            return state.visitors
        },

        viewport(state) {
            return state.viewport
        },

        scale(state) {
            return state.viewport.scale
        },

        isPanning(state) {
            return state.viewport.isPanning
        },

        width(state) {
            return state.grid.width
        },

        height(state) {
            return state.grid.height
        },

        mode(state) {
            return state.grid.mode
        },

        shapes(state) {
            return state.shapes
        },

        selectedShape(state) {
            return state.grid.selectedShape
        },

        buildings: (state) => {
            return state.grid.objects.filter(obj => obj.shape.id !== 'road')
        },

        roads: (state) => {
            return state.grid.objects.filter(obj => obj.shape.id === 'road')
        },

        stats: (state, getters) => {
            return {
                balance: state.park.balance,
                buildingsCount: getters.buildings.length,
                roadsCount: getters.roads.length,
                visitorsCount: state.visitors.length
            }
        },

        occupiedMap: (state) => {
            return state.grid.occupiedMap
        },

        previewMap: (state, getters) => {
            const map = new Map()

            const shape = state.grid.selectedShape
            const origin = state.grid.previewOrigin

            if (!shape || !origin) return map

            const occupiedMap = getters.occupiedMap

            const valid = canPlaceShape(
                {
                    shape,
                    origin,
                    occupiedMap,
                    width: state.grid.width,
                    height: state.grid.height
                })

            shape.cells.forEach(cell => {
                const x = origin.x + cell.x
                const y = origin.y + cell.y

                map.set(`${x}-${y}`, valid ? shape.color : 'red')
            })

            return map
        }
    },
    mutations: {
        ADD_VISITOR(state, visitor) {
            state.visitors.push(visitor)
        },

        SET_SCALE(state, scale) {
            state.viewport.scale = scale
        },

        SET_GRID_SIZE(state, {width, height}) {
            state.grid.width = Math.min(20, Math.max(8, width))
            state.grid.height = Math.min(20, Math.max(8, height))
        },

        SET_DRAGGING(state, shape) {
            state.grid.draggingShape = shape
        },

        SET_PREVIEW_ORIGIN(state, origin) {
            state.grid.previewOrigin = origin
        },

        SET_SHAPE(state, shape) {
            state.grid.selectedShape = shape
        },

        ADD_OBJECT(state, obj) {
            state.grid.objects.push(obj)

            for (const cell of obj.shape.cells) {
                const x = obj.origin.x + cell.x
                const y = obj.origin.y + cell.y

                state.grid.occupiedMap.set(`${x}-${y}`, obj)
            }
        },

        REMOVE_OBJECT(state, {x, y}) {
            const obj = state.grid.occupiedMap.get(`${x}-${y}`)
            if (!obj) {
                return
            }

            for (const cell of obj.shape.cells) {
                const cx = obj.origin.x + cell.x
                const cy = obj.origin.y + cell.y

                state.grid.occupiedMap.delete(`${cx}-${cy}`)
            }

            state.grid.objects = state.grid.objects.filter(o => o !== obj)
        },

        SET_MODE(state, mode) {
            state.grid.mode = mode
        },

        SET_PANNING(state, value) {
            state.viewport.isPanning = value
        },

        SET_OFFSET(state, {x, y}) {
            state.viewport.offsetX = x
            state.viewport.offsetY = y
        },

        MOVE_OFFSET(state, {dx, dy}) {
            state.viewport.offsetX += dx
            state.viewport.offsetY += dy
        },

        DECREASE_BALANCE(state, amount) {
            state.park.balance -= amount
        },

        INCREASE_BALANCE(state, amount) {
            state.park.balance += amount
        }
    },
    state: {
        grid: {
            width: 10,
            height: 10,
            objects: [],
            selectedShape: null,
            draggingShape: null,
            previewOrigin: null,
            occupiedMap: new Map(),
            mode: 'build'
        },
        viewport: {
            offsetX: 103,
            offsetY: 61,
            scale: 1,
            isPanning: false
        },
        park: {
            balance: 1000,
            entrance: {x: -1, y: 4}
        },
        visitors: [],
        visitorCounter: 1,
        shapes: [
            {
                id: 'road',
                name: 'Road',
                color: 'gray',
                cost: 10,
                capacity: 10,
                visitorsIn: [],
                entryOffset: null,
                cells: [{x: 0, y: 0}]
            },
            {
                id: 'feed_zone',
                name: 'Feeding Zone',
                color: 'green',
                cost: 150,
                capacity: 3,
                visitorsIn: [],
                entryOffset: {x: 0, y: 1},
                cells: [
                    {x: 0, y: 0},
                    {x: 1, y: 0},
                    {x: 0, y: 1}
                ]
            },
            {
                id: 'visitor_center',
                name: 'Visitor Center',
                color: 'yellow',
                cost: 200,
                capacity: 4,
                visitorsIn: [],
                entryOffset: {x: 1, y: 1},
                cells: [
                    {x: 0, y: 0},
                    {x: 1, y: 0},
                    {x: 0, y: 1},
                    {x: 1, y: 1}
                ]
            },
            {
                id: 'dino_arena',
                name: 'Raptor Arena',
                color: 'pink',
                cost: 400,
                capacity: 9,
                visitorsIn: [],
                entryOffset: {x: 2, y: 2},
                cells: [
                    {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0},
                    {x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1},
                    {x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}
                ]
            },
            {
                id: 'jungle_ride',
                name: 'Jungle Ride',
                color: 'orange',
                cost: 400,
                capacity: 4,
                visitorsIn: [],
                entryOffset: {x: 3, y: 0},
                cells: [
                    {x: 0, y: 0},
                    {x: 1, y: 0},
                    {x: 2, y: 0},
                    {x: 3, y: 0}
                ]
            },
            {
                id: 'observation_tower',
                name: 'Observation Tower',
                color: 'purple',
                cost: 300,
                capacity: 4,
                visitorsIn: [],
                entryOffset: {x: 0, y: 3},
                cells: [
                    {x: 0, y: 0},
                    {x: 0, y: 1},
                    {x: 0, y: 2},
                    {x: 0, y: 3}
                ]
            },
            {
                id: 'jungle_maze',
                name: 'Jungle Maze',
                color: 'cyan',
                cost: 500,
                capacity: 6,
                visitorsIn: [],
                entryOffset: {x: 0, y: 2},
                cells: [
                    {x: 0, y: 0},
                    {x: 1, y: 0},
                    {x: 2, y: 0},
                    {x: 0, y: 1},
                    {x: 1, y: 1},
                    {x: 0, y: 2}
                ]
            },
            {
                id: 'rex_enclosure',
                name: 'T-Rex Enclosure',
                color: 'blue',
                cost: 250,
                capacity: 5,
                visitorsIn: [],
                entryOffset: {x: 2, y: 2},
                cells: [
                    {x: 0, y: 0},
                    {x: 0, y: 1},
                    {x: 0, y: 2},
                    {x: 1, y: 2},
                    {x: 2, y: 2}
                ]
            }
        ]
    }
})

