import {
    RADIUS, WRONG_PENALTIES, ESCAPE_PENALTIES, PUSH_FACTORS, COLOR_IMAGES
} from '@/config/gameConfig.js'
import { getCoords, spawnChildrenSync, spawnBombSmallsSync } from '@/store/gameHelpers.js'

export default {
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
    loadImages({ dispatch }) {
        let loaded = 0
        const total = Object.keys(COLOR_IMAGES).length
        if (total === 0) {
            dispatch('beginSession')
            return
        }
        Object.entries(COLOR_IMAGES).forEach(([src]) => {
            const img = new Image()
            img.onload = () => {
                loaded++
                if (loaded === total) dispatch('beginSession')
            }
            img.onerror = () => {
                loaded++
                if (loaded === total) dispatch('beginSession')
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
            if (!state.tutorialBlocking) dispatch('moveElements', now)
            const frameId = requestAnimationFrame((ts) => dispatch('animationStep', ts))
            commit('SET_FRAME_ID', frameId)
        } else if (state.frameId) {
            cancelAnimationFrame(state.frameId)
            commit('SET_FRAME_ID', null)
        }
    },
    moveElements({ commit, state, dispatch }, now) {
        if (state.stageWidth === 0 || state.stageHeight === 0) return
        const interval = 1000 / state.spawnRate
        if (now - state.lastCreation > interval) {
            dispatch('addItem')
            commit('SET_LAST_CREATION', now)
        }
        for (let i = state.items.length - 1; i >= 0; i--) {
            const item = state.items[i]
            let newSpeedX = item.speedX * 0.98
            let newSpeedY = item.speedY < 2 ? item.speedY + 0.08 : item.speedY * 0.99
            let newX = item.x + newSpeedX
            let newY = item.y + newSpeedY
            const newWobble = item.wobble + item.wobbleSpeed
            newX += Math.sin(newWobble) * 0.3
            commit('UPDATE_ITEM_POSITION', {
                id: item.id,
                updates: {
                    speedX: newSpeedX,
                    speedY: newSpeedY,
                    x: newX,
                    y: newY,
                    wobble: newWobble
                }
            })
            if (newY - item.radius > state.stageHeight + 100 ||
                newX + item.radius < -100 ||
                newX - item.radius > state.stageWidth + 100) {
                if (item.color === state.targetColor) {
                    commit('ADD_POINTS', ESCAPE_PENALTIES[item.size])
                    commit('SET_COMBO', 1.0)
                }
                commit('REMOVE_ITEM_BY_ID', item.id)
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
        if (rand < 0.2) {
            size = 'large'
            radius = RADIUS.large
        } else if (rand < 0.7) {
            size = 'medium'
            radius = RADIUS.medium
        } else {
            size = 'small'
            radius = RADIUS.small
        }
        const spawnWidth = state.stageWidth * 0.6
        const startX = (state.stageWidth - spawnWidth) / 2
        const x = startX + Math.random() * spawnWidth
        const newBubble = {
            id: Date.now() + Math.random(),
            color: randomColor,
            x,
            y: -radius,
            radius,
            size,
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
                const factor = PUSH_FACTORS[sourceSize]?.[item.size] ?? 0
                const strength = factor * 4 * (1 - dist / PUSH_DISTANCE)
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
        const hit = state.items.filter(item =>
            Math.hypot(clickX - (item.x + item.radius), clickY - (item.y + item.radius)) <= item.radius
        )
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
            dispatch('applyPush', {
                centerX: item.x + item.radius,
                centerY: item.y + item.radius,
                sourceSize: item.size
            })
            const children = spawnChildrenSync(state, getters, item)
            if (children && children.length) newChildren.push(...children)
            commit('REMOVE_ITEM_BY_ID', item.id)
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
                commit('REMOVE_ITEM_BY_ID', item.id)
            }
        }
        if (newChildren.length) commit('ADD_ITEMS', newChildren)
    },
    handleMouseDown({ dispatch, state, commit }, { event, stageRef }) {
        if (state.sessionEnded || state.tutorialBlocking) return
        commit('SET_DRAGGING', true)
        const coords = getCoords(event, stageRef)
        commit('SET_MOUSE_COORDS', coords)
        if (state.bombActive) {
            dispatch('explodeBomb', { x: coords.x, y: coords.y })
            return
        }
        if (state.currentMode === 'standard' || state.currentMode === 'laser') {
            dispatch('tryPopBubbles', { clickX: coords.x, clickY: coords.y })
        }
    },
    handleMouseMove({ dispatch, state, commit }, { event, stageRef }) {
        const coords = getCoords(event, stageRef)
        commit('SET_MOUSE_COORDS', coords)
        if (state.currentMode === 'laser' && state.isDragging && !state.bombActive) {
            const now = performance.now()
            if (now - state.laserLastShot > 50) {
                commit('SET_LASER_LAST_SHOT', now)
                dispatch('tryPopBubbles', { clickX: coords.x, clickY: coords.y })
            }
        }
    },
    setDragging({ commit }, val) {
        commit('SET_DRAGGING', val)
    },
    setMode({ commit, state, dispatch }, mode) {
        commit('SET_CURRENT_MODE', mode)
        commit('SET_BOMB_ACTIVE', false)
        if (mode === 'auto') {
            dispatch('startAutoShoot')
        } else {
            if (state.autoTimer) {
                clearInterval(state.autoTimer)
                commit('SET_AUTO_TIMER', null)
            }
        }
    },
    startAutoShoot({ commit, state, dispatch }) {
        if (state.autoTimer) clearInterval(state.autoTimer)
        const timer = setInterval(() => {
            if (state.sessionEnded || state.tutorialBlocking || state.currentMode !== 'auto' || state.bombActive) return
            const mark = {
                id: Date.now() + Math.random(),
                x: state.mouseX,
                y: state.mouseY,
                time: performance.now()
            }
            commit('ADD_MARK', mark)
            setTimeout(() => commit('REMOVE_MARK_BY_ID', mark.id), 2000)
            dispatch('tryPopBubbles', { clickX: state.mouseX, clickY: state.mouseY })
        }, 500)
        commit('SET_AUTO_TIMER', timer)
    },
    resetGame({ commit, dispatch, state }) {
        const settings = {
            totalColors: state.totalColors,
            targetColor: state.targetColor,
            spawnRate: state.spawnRate,
            pointsForCorrect: state.pointsForCorrect,
            pointsForWrong: state.pointsForWrong,
            gameDuration: state.gameDuration,
            onStart: state.onStart,
            onScore: state.onScore,
            onFinish: state.onFinish
        }
        commit('RESET_STATE')
        dispatch('initGame', settings)
    },
    finishSession({ commit, state }) {
        if (state.sessionEnded) return
        commit('SET_SESSION_ENDED', true)
        if (state.countdownId) {
            clearInterval(state.countdownId)
            commit('SET_COUNTDOWN_ID', null)
        }
        if (state.tutorialTimer) {
            clearTimeout(state.tutorialTimer)
            commit('SET_TUTORIAL_TIMER', null)
        }
        if (state.autoTimer) {
            clearInterval(state.autoTimer)
            commit('SET_AUTO_TIMER', null)
        }
        if (state.frameId) {
            cancelAnimationFrame(state.frameId)
            commit('SET_FRAME_ID', null)
        }
        commit('SET_TUTORIAL_VISIBLE', false)
        commit('SET_TUTORIAL_BLOCKING', false)
        if (state.onFinish) state.onFinish({ score: state.points, timeElapsed: state.gameDuration })
    }
}