import { createStore } from 'vuex'

export const MUTATIONS= {
    SET_SHAPE: 'SET_SHAPE',
    ADD_OBJECT: 'ADD_OBJECT',
    REMOVE_OBJECT: 'REMOVE_OBJECT',
    SET_MODE: 'SET_MODE',
    SET_DRAGGING: 'SET_DRAGGING',
    SET_PREVIEW_ORIGIN: 'SET_PREVIEW_ORIGIN'
}

export default createStore({
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
        shapes: [
            {
                id: 'zoo',
                color: 'blue',
                cells: [{ x: 0, y: 0 }]
            },
            {
                id: 'park',
                color: 'green',
                cells: [
                    { x: 0, y: 0 },
                    { x: 1, y: 0 },
                    { x: 0, y: 1 }
                ]
            }
        ],
    },
    mutations: {
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
        REMOVE_OBJECT(state, { x, y }) {
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
        }
    }
})

