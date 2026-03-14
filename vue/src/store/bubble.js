/*const MUTATIONS = {
    SET_COORDS: 'SET_COORDS',
    SET_TRAJECTORY: 'SET_TRAJECTORY',
    SET_ACTIVE: 'SET_ACTIVE'
}

export default {
    namespaced: true,
    state: () => ({
        coords: {
            x: 0,
            y: 0,
            speedX: 0,
            speedY: 1,
            wobble: 0,
            wobbleSpeed: 0.02
        },
        active: true,
        color: 'red',
        id: null
    }),
    getters: {
        getCoords: (state) => state.coords,
        getStyle: (state) => ({
            transform: `translateX(${state.coords.x}px) translateY(${state.coords.y}px)`,
            transition: '0.1s linear'
        }),
        isActive: (state) => state.active
    },
    mutations: {
        [MUTATIONS.SET_COORDS]: (state, payload) => {
            // Обновляем координаты
            state.coords.x += payload.speedX || 0
            state.coords.y += payload.speedY || 1
            
            // Добавляем "вихляние" траектории
            state.coords.wobble += state.coords.wobbleSpeed
            state.coords.x += Math.sin(state.coords.wobble) * 0.5
            
            // Проверка на выход за границы
            if (state.coords.y > 600) {
                state.active = false
            }
        },
        [MUTATIONS.SET_TRAJECTORY]: (state, payload) => {
            state.coords.speedX = payload.speedX || (Math.random() - 0.5) * 2
            state.coords.speedY = payload.speedY || 1 + Math.random() * 2
            state.coords.wobbleSpeed = payload.wobbleSpeed || 0.02 + Math.random() * 0.03
        },
        [MUTATIONS.SET_ACTIVE]: (state, payload) => {
            state.active = payload
        }
    },
    actions: {
        // Анимация движения
        moveBubble: ({ state, commit }, payload) => new Promise((resolve) => {
            setTimeout(() => {
                if (state.active) {
                    commit(MUTATIONS.SET_COORDS, payload)
                }
                resolve()
            }, 100)
        }),
        
        // Инициализация пузыря
        initBubble: ({ commit }, payload) => {
            commit(MUTATIONS.SET_TRAJECTORY, payload)
        },
        
        // Уничтожение пузыря
        destroyBubble: ({ commit }) => {
            commit(MUTATIONS.SET_ACTIVE, false)
        }
    }
}*/