import {createStore} from 'vuex'
import {canPlaceShape} from '@/utils/canPlace'

export const MUTATIONS = {
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
}

export default createStore({
    actions: {
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
        placeObject({state, getters, commit}, {shape, origin}) {
            const occupiedMap = getters.occupiedMap

            const canPlace = canPlaceShape({
                shape,
                origin,
                occupiedMap,
                width: state.grid.width,
                height: state.grid.height
            })

            if (!canPlace) return {ok: false}

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

        removeObject({commit}, payload) {
            commit(MUTATIONS.REMOVE_OBJECT, payload)
        },

        setMode({commit}, mode) {
            commit(MUTATIONS.SET_MODE, mode)
        }
    },
    getters: {
        occupiedMap: (state) => {
            const map = new Map()

            for (const obj of state.grid.objects) {
                for (const cell of obj.shape.cells) {
                    const x = obj.origin.x + cell.x
                    const y = obj.origin.y + cell.y

                    map.set(`${x}-${y}`, obj.shape.color)
                }
            }

            return map
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
        },
        REMOVE_OBJECT(state, {x, y}) {
            state.grid.objects = state.grid.objects.filter(obj => {
                return !obj.shape.cells.some(cell => {
                    return (
                        obj.origin.x + cell.x === x &&
                        obj.origin.y + cell.y === y
                    )
                })
            })
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
            mode: 'build'
        },
        viewport: {
            offsetX: 320,
            offsetY: 450,
            scale: 1,
            isPanning: false
        },
        shapes: [
            {
                id: 'road',
                name: 'Road',
                color: 'gray',
                cells: [{x: 0, y: 0}]
            },
            {
                id: 'feed_zone',
                name: 'Feeding Zone',
                color: 'green',
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

