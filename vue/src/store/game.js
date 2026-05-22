import { RADIUS, WRONG_PENALTIES, ESCAPE_PENALTIES, PUSH_FACTORS, COLOR_IMAGES, COLOR_NAMES, COLOR_LIST } from '@/config/gameConfig'

const laserCursor = "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"%3E%3Ccircle cx=\"12\" cy=\"12\" r=\"8\" fill=\"%2300ff00\" stroke=\"white\" stroke-width=\"2\"/%3E%3C/svg%3E') 12 12, crosshair"
const autoCursor = "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"%3E%3Ccircle cx=\"12\" cy=\"12\" r=\"8\" fill=\"%23ff0000\" stroke=\"white\" stroke-width=\"2\"/%3E%3C/svg%3E') 12 12, crosshair"

function getCoords(event, stageRef) {
    if (!stageRef) return { x: 0, y: 0 }
    const rect = stageRef.getBoundingClientRect()
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    }
}

function spawnChildrenSync(state, getters, parent, customConfig = null) {
    const children = []
    const parentSize = parent.size
    const parentColor = parent.color
    const parentX = parent.x
    const parentY = parent.y
    let childSize, childRadius, count
    if (customConfig) {
        childSize = customConfig.size
        childRadius = customConfig.radius
        count = customConfig.count
    } else {
        if (parentSize === 'large') { childSize = 'medium'; childRadius = RADIUS.medium; count = 3 }
        else if (parentSize === 'medium') { childSize = 'small'; childRadius = RADIUS.small; count = 5 }
        else return []
    }
    const orbitRadius = parent.radius + childRadius + 5
    const angleStep = (Math.PI * 2) / count
    for (let i = 0; i < count; i++) {
        const angle = i * angleStep
        const x = parentX + Math.cos(angle) * orbitRadius
        const y = parentY + Math.sin(angle) * orbitRadius
        let randomColor
        do { randomColor = getters.activeColors[Math.floor(Math.random() * getters.activeColors.length)] }
        while (randomColor === parentColor && getters.activeColors.length > 1)
        children.push({
            id: Date.now() + Math.random() + i,
            color: i === 0 ? parentColor : randomColor,
            x: x,
            y: y,
            radius: childRadius,
            size: childSize,
            speedX: (Math.random() - 0.5) * 1.5,
            speedY: 1 + Math.random() * 2.5,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.02 + Math.random() * 0.03,
            active: true
        })
    }
    return children
}

function spawnBombSmallsSync(state, getters, parent) {
    const children = []
    const childRadius = RADIUS.small
    const count = 7
    const orbitRadius = parent.radius + childRadius + 5
    const angleStep = (Math.PI * 2) / count
    for (let i = 0; i < count; i++) {
        const angle = i * angleStep
        const x = parent.x + Math.cos(angle) * orbitRadius
        const y = parent.y + Math.sin(angle) * orbitRadius
        const randomColor = getters.activeColors[Math.floor(Math.random() * getters.activeColors.length)]
        children.push({
            id: Date.now() + Math.random() + i,
            color: i === 0 ? parent.color : randomColor,
            x: x,
            y: y,
            radius: childRadius,
            size: 'small',
            speedX: (Math.random() - 0.5) * 3,
            speedY: 1 + Math.random() * 3,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.02 + Math.random() * 0.03,
            active: true
        })
    }
    return children
}

export default {
    namespaced: true,
    state: () => ({
        points: 0,
        remaining: 60,
        sessionEnded: false,
        items: [],
        stageWidth: 0,
        stageHeight: 0,
        frameId: null,
        lastCreation: 0,
        countdownId: null,
        tutorialVisible: false,
        tutorialTimer: null,
        tutorialBlocking: false,
        currentMode: 'standard',
        isDragging: false,
        mouseX: 0,
        mouseY: 0,
        autoTimer: null,
        marks: [],
        combo: 1.0,
        penaltyCombo: 1.0,
        successCount: 0,
        bombs: 0,
        bombActive: false,
        totalColors: 3,
        targetColor: 'red',
        spawnRate: 1,
        pointsForCorrect: 1,
        pointsForWrong: -5,
        gameDuration: 60,
        onStart: null,
        onScore: null,
        onFinish: null,
        images: {},
    }),
    getters: {
        timeDisplay: (state) => {
            const minutes = Math.floor(state.remaining / 60)
            const seconds = state.remaining % 60
            return `${minutes}:${seconds.toString().padStart(2, '0')}`
        },
        targetIcon: (state) => COLOR_IMAGES[state.targetColor] || '',
        targetLabel: (state) => COLOR_NAMES[state.targetColor] || state.targetColor,
        activeColors: (state) => COLOR_LIST.slice(0, state.totalColors),
        laserCursor: () => laserCursor,
        autoCursor: () => autoCursor,
        COLOR_IMAGES: () => COLOR_IMAGES,
        currentCursor: (state) => {
            if (state.currentMode === 'laser') return laserCursor;
            if (state.currentMode === 'auto') return autoCursor;
            return 'crosshair';
        }
    },
    mutations: {
        ADD_POINTS(state, delta) { state.points += delta },
        DECREMENT_REMAINING(state) { if (state.remaining > 0) state.remaining-- },
        SET_SESSION_ENDED(state, val) { state.sessionEnded = val },
        ADD_ITEMS(state, newItems) { state.items.push(...newItems) },
        REMOVE_ITEM_BY_INDEX(state, idx) { state.items.splice(idx, 1) },
        SET_STAGE_SIZE(state, { width, height }) { state.stageWidth = width; state.stageHeight = height },
        SET_LAST_CREATION(state, time) { state.lastCreation = time },
        SET_FRAME_ID(state, id) { state.frameId = id },
        SET_COUNTDOWN_ID(state, id) { state.countdownId = id },
        SET_TUTORIAL_VISIBLE(state, val) { state.tutorialVisible = val },
        SET_TUTORIAL_BLOCKING(state, val) { state.tutorialBlocking = val },
        SET_TUTORIAL_TIMER(state, timer) { state.tutorialTimer = timer },
        SET_CURRENT_MODE(state, mode) { state.currentMode = mode },
        SET_DRAGGING(state, val) { state.isDragging = val },
        SET_MOUSE_COORDS(state, { x, y }) { state.mouseX = x; state.mouseY = y },
        SET_AUTO_TIMER(state, timer) { state.autoTimer = timer },
        ADD_MARK(state, mark) { state.marks.push(mark) },
        REMOVE_MARK_BY_ID(state, id) { state.marks = state.marks.filter(m => m.id !== id) },
        SET_COMBO(state, val) { state.combo = val },
        SET_PENALTY_COMBO(state, val) { state.penaltyCombo = val },
        INCREMENT_SUCCESS_COUNT(state) { state.successCount++ },
        SET_BOMBS(state, val) { state.bombs = val },
        ADD_BOMB(state) { state.bombs++ },
        SET_BOMB_ACTIVE(state, val) { state.bombActive = val },
        SET_IMAGES(state, images) { state.images = images },
        APPLY_IMPULSE(state, { item, impulseX, impulseY }) {
            item.speedX += impulseX;
            item.speedY += impulseY;
        },
        INIT_SETTINGS(state, settings) {
            state.totalColors = settings.totalColors
            state.targetColor = settings.targetColor
            state.spawnRate = settings.spawnRate
            state.pointsForCorrect = settings.pointsForCorrect
            state.pointsForWrong = settings.pointsForWrong
            state.gameDuration = settings.gameDuration
            state.onStart = settings.onStart || null
            state.onScore = settings.onScore || null
            state.onFinish = settings.onFinish || null
            state.remaining = settings.gameDuration
            state.points = 0
            state.sessionEnded = false
            state.items = []
            state.marks = []
            state.combo = 1.0
            state.penaltyCombo = 1.0
            state.successCount = 0
            state.bombs = 0
            state.bombActive = false
            state.currentMode = 'standard'
            state.tutorialBlocking = true
            state.tutorialVisible = true
            state.lastCreation = performance.now()
        },
        RESET_STATE(state) {
            state.points = 0
            state.remaining = state.gameDuration
            state.sessionEnded = false
            state.items = []
            state.marks = []
            state.combo = 1.0
            state.penaltyCombo = 1.0
            state.successCount = 0
            state.bombs = 0
            state.bombActive = false
            state.currentMode = 'standard'
            state.tutorialBlocking = true
            state.tutorialVisible = true
            state.lastCreation = performance.now()
            if (state.autoTimer) clearInterval(state.autoTimer)
            if (state.frameId) cancelAnimationFrame(state.frameId)
            if (state.countdownId) clearInterval(state.countdownId)
            if (state.tutorialTimer) clearTimeout(state.tutorialTimer)
            state.autoTimer = null
            state.frameId = null
            state.countdownId = null
            state.tutorialTimer = null
        },
    },
    actions: {
        updateStageSize({ commit }, { stageRef }) {
            if (stageRef) {
                const width = stageRef.clientWidth
                const height = stageRef.clientHeight
                commit('SET_STAGE_SIZE', { width, height })
            }
        },

        initGame({ commit, dispatch }, settings) {
            commit('INIT_SETTINGS', settings)
            dispatch('loadImages')
        },

        loadImages({ commit, state, dispatch }) {
            let loaded = 0
            const total = Object.keys(COLOR_IMAGES).length
            const images = {}
            Object.entries(COLOR_IMAGES).forEach(([color, src]) => {
                const img = new Image()
                img.onload = () => {
                    loaded++
                    images[color] = img
                    if (loaded === total) {
                        commit('SET_IMAGES', images)
                        dispatch('beginSession')
                    }
                }
                img.onerror = () => {
                    loaded++
                    if (loaded === total) {
                        commit('SET_IMAGES', images)
                        dispatch('beginSession')
                    }
                }
                img.src = src
            })
        },

        beginSession({ commit, state, dispatch }) {
            if (state.onStart) state.onStart()
            commit('SET_LAST_CREATION', performance.now())
            commit('SET_TUTORIAL_BLOCKING', true)
            commit('SET_TUTORIAL_VISIBLE', true)
            const frameId = requestAnimationFrame((timestamp) => dispatch('animationStep', timestamp))
            commit('SET_FRAME_ID', frameId)
            if (state.tutorialTimer) clearTimeout(state.tutorialTimer)
            const timer = setTimeout(() => {
                commit('SET_TUTORIAL_VISIBLE', false)
                commit('SET_TUTORIAL_BLOCKING', false)
                dispatch('startCountdown')
                commit('SET_LAST_CREATION', performance.now())
                if (state.currentMode === 'auto') dispatch('startAutoShoot')
            }, 3000)
            commit('SET_TUTORIAL_TIMER', timer)
        },

        startCountdown({ commit, state, dispatch }) {
            if (state.countdownId) clearInterval(state.countdownId)
            const id = setInterval(() => {
                if (!state.sessionEnded && state.remaining > 0) {
                    commit('DECREMENT_REMAINING')
                } else if (state.remaining <= 0 && !state.sessionEnded) {
                    dispatch('finishSession')
                }
            }, 1000)
            commit('SET_COUNTDOWN_ID', id)
        },

        animationStep({ commit, state, dispatch }, now) {
            if (!state.sessionEnded) {
                if (!state.tutorialBlocking) {
                    dispatch('moveElements', now)
                }
            }
            const frameId = requestAnimationFrame((ts) => dispatch('animationStep', ts))
            commit('SET_FRAME_ID', frameId)
        },

        moveElements({ commit, state, dispatch }, now) {
            const interval = 1000 / state.spawnRate
            if (now - state.lastCreation > interval) {
                dispatch('addItem')
                commit('SET_LAST_CREATION', now)
            }
            for (let i = state.items.length - 1; i >= 0; i--) {
                const item = state.items[i]
                item.speedX *= 0.98
                item.speedY = item.speedY < 2 ? item.speedY + 0.08 : item.speedY * 0.99
                item.x += item.speedX
                item.y += item.speedY
                item.wobble += item.wobbleSpeed
                item.x += Math.sin(item.wobble) * 0.3
                if (item.y - item.radius > state.stageHeight + 100 ||
                    item.x + item.radius < -100 ||
                    item.x - item.radius > state.stageWidth + 100) {
                    if (item.color === state.targetColor) {
                        commit('ADD_POINTS', ESCAPE_PENALTIES[item.size])
                        commit('SET_COMBO', 1.0)
                    }
                    commit('REMOVE_ITEM_BY_INDEX', i)
                }
            }
        },

        addItem({ state, commit, getters }) {
            if (state.stageWidth === 0 || state.stageHeight === 0) return
            let colors = [...getters.activeColors]
            if (!colors.includes(state.targetColor)) {
                colors.pop()
                colors.push(state.targetColor)
            }
            const randomColor = colors[Math.floor(Math.random() * colors.length)]
            const rand = Math.random()
            let size, radius
            if (rand < 0.2) { size = 'large'; radius = RADIUS.large }
            else if (rand < 0.7) { size = 'medium'; radius = RADIUS.medium }
            else { size = 'small'; radius = RADIUS.small }
            const spawnWidth = state.stageWidth * 0.6
            const startX = (state.stageWidth - spawnWidth) / 2
            const x = startX + Math.random() * spawnWidth
            const newBubble = {
                id: Date.now() + Math.random(),
                color: randomColor,
                x: x,
                y: -radius,
                radius: radius,
                size: size,
                speedX: (Math.random() - 0.5) * 1.5,
                speedY: 1 + Math.random() * 2.5,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.02 + Math.random() * 0.03,
                active: true
            }
            commit('ADD_ITEMS', [newBubble])
        },

        applyPush({ commit, state }, { centerX, centerY, sourceSize }) {
            const PUSH_DISTANCE = 170
            for (const item of state.items) {
                const itemCenterX = item.x + item.radius
                const itemCenterY = item.y + item.radius
                const dx = itemCenterX - centerX
                const dy = itemCenterY - centerY
                const dist = Math.hypot(dx, dy)
                if (dist > 0 && dist < PUSH_DISTANCE) {
                    const strength = PUSH_FACTORS[sourceSize][item.size] * 4 * (1 - dist / PUSH_DISTANCE)
                    const angle = Math.atan2(dy, dx)
                    commit('APPLY_IMPULSE', {
                        item,
                        impulseX: Math.cos(angle) * strength,
                        impulseY: Math.sin(angle) * strength
                    })
                }
            }
        },

        tryPopBubbles({ commit, state, getters, dispatch }, { clickX, clickY }) {
            if (state.sessionEnded) return
            const hit = state.items.filter(item => Math.hypot(clickX - (item.x + item.radius), clickY - (item.y + item.radius)) <= item.radius)
            if (hit.length === 0) return
            let totalPoints = 0
            let newChildren = []
            for (const item of hit) {
                const isCorrect = item.color === state.targetColor
                if (isCorrect) {
                    totalPoints += state.pointsForCorrect * state.combo
                    commit('SET_COMBO', Math.min(5, state.combo * 1.2))
                    commit('SET_PENALTY_COMBO', 1.0)
                    if ((state.successCount + 1) % 10 === 0) commit('ADD_BOMB')
                    commit('INCREMENT_SUCCESS_COUNT')
                } else {
                    totalPoints += (WRONG_PENALTIES[item.size] || state.pointsForWrong) * state.penaltyCombo
                    commit('SET_PENALTY_COMBO', Math.min(7, state.penaltyCombo * 1.3))
                    commit('SET_COMBO', 1.0)
                }
                dispatch('applyPush', { centerX: item.x + item.radius, centerY: item.y + item.radius, sourceSize: item.size })
                const children = spawnChildrenSync(state, getters, item)
                if (children && children.length) newChildren.push(...children)
                commit('REMOVE_ITEM_BY_INDEX', state.items.indexOf(item))
            }
            if (newChildren.length) commit('ADD_ITEMS', newChildren)
            commit('ADD_POINTS', totalPoints)
            if (state.onScore) state.onScore({ points: totalPoints, count: hit.length })
        },

        toggleBomb({ commit, state }) {
            if (state.bombs > 0) commit('SET_BOMB_ACTIVE', !state.bombActive)
        },

        explodeBomb({ commit, state, getters }, { x, y }) {
            commit('SET_BOMB_ACTIVE', false)
            commit('SET_BOMBS', state.bombs - 1)
            const BOMB_RADIUS = 150
            let newChildren = []
            for (let i = state.items.length - 1; i >= 0; i--) {
                const item = state.items[i]
                if (Math.hypot(x - (item.x + item.radius), y - (item.y + item.radius)) <= BOMB_RADIUS) {
                    if (item.size === 'large') {
                        const children = spawnBombSmallsSync(state, getters, item)
                        if (children && children.length) newChildren.push(...children)
                    }
                    commit('REMOVE_ITEM_BY_INDEX', i)
                }
            }
            if (newChildren.length) commit('ADD_ITEMS', newChildren)
        },

        handleMouseDown({ dispatch, state, commit }, { event, stageRef }) {
            if (state.sessionEnded || state.tutorialBlocking) return
            commit('SET_DRAGGING', true)
            const coords = getCoords(event, stageRef)
            commit('SET_MOUSE_COORDS', coords)
            if (state.bombActive) { dispatch('explodeBomb', { x: coords.x, y: coords.y }); return }
            if (state.currentMode === 'standard' || state.currentMode === 'laser') {
                dispatch('tryPopBubbles', { clickX: coords.x, clickY: coords.y })
            }
        },

        handleMouseMove({ dispatch, state, commit }, { event, stageRef }) {
            const coords = getCoords(event, stageRef)
            commit('SET_MOUSE_COORDS', coords)
            if (state.currentMode === 'laser' && state.isDragging && !state.bombActive) {
                dispatch('tryPopBubbles', { clickX: coords.x, clickY: coords.y })
            }
        },

        setDragging({ commit }, val) { commit('SET_DRAGGING', val) },

        setMode({ commit, state, dispatch }, mode) {
            commit('SET_CURRENT_MODE', mode)
            commit('SET_BOMB_ACTIVE', false)
            if (mode === 'auto') dispatch('startAutoShoot')
            else { if (state.autoTimer) clearInterval(state.autoTimer); commit('SET_AUTO_TIMER', null) }
        },

        startAutoShoot({ commit, state, dispatch }) {
            if (state.autoTimer) clearInterval(state.autoTimer)
            const timer = setInterval(() => {
                if (state.sessionEnded || state.tutorialBlocking || state.currentMode !== 'auto' || state.bombActive) return
                const mark = { id: Date.now() + Math.random(), x: state.mouseX, y: state.mouseY, time: performance.now() }
                commit('ADD_MARK', mark)
                setTimeout(() => commit('REMOVE_MARK_BY_ID', mark.id), 2000)
                dispatch('tryPopBubbles', { clickX: state.mouseX, clickY: state.mouseY })
            }, 500)
            commit('SET_AUTO_TIMER', timer)
        },

        resetGame({ commit, dispatch }) { commit('RESET_STATE'); dispatch('beginSession') },

        finishSession({ commit, state }) {
            commit('SET_SESSION_ENDED', true)
            if (state.countdownId) clearInterval(state.countdownId)
            if (state.tutorialTimer) clearTimeout(state.tutorialTimer)
            if (state.autoTimer) clearInterval(state.autoTimer)
            commit('SET_TUTORIAL_VISIBLE', false)
            commit('SET_TUTORIAL_BLOCKING', false)
            if (state.onFinish) state.onFinish({ score: state.points, timeElapsed: state.gameDuration })
        }
    }
}