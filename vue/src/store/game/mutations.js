export default {
    ADD_POINTS(state, delta) {
        state.points += delta
    },
    DECREMENT_REMAINING(state) {
        if (state.remaining > 0) state.remaining--
    },
    SET_SESSION_ENDED(state, val) {
        state.sessionEnded = val
    },
    ADD_ITEMS(state, newItems) {
        state.items.push(...newItems)
    },
    REMOVE_ITEM_BY_ID(state, id) {
        const index = state.items.findIndex(item => item.id === id)
        if (index !== -1) state.items.splice(index, 1)
    },
    SET_STAGE_SIZE(state, { width, height }) {
        state.stageWidth = width
        state.stageHeight = height
    },
    SET_LAST_CREATION(state, time) {
        state.lastCreation = time
    },
    SET_FRAME_ID(state, id) {
        state.frameId = id
    },
    SET_COUNTDOWN_ID(state, id) {
        state.countdownId = id
    },
    SET_TUTORIAL_VISIBLE(state, val) {
        state.tutorialVisible = val
    },
    SET_TUTORIAL_BLOCKING(state, val) {
        state.tutorialBlocking = val
    },
    SET_TUTORIAL_TIMER(state, timer) {
        state.tutorialTimer = timer
    },
    SET_CURRENT_MODE(state, mode) {
        state.currentMode = mode
    },
    SET_DRAGGING(state, val) {
        state.isDragging = val
    },
    SET_MOUSE_COORDS(state, { x, y }) {
        state.mouseX = x
        state.mouseY = y
    },
    SET_AUTO_TIMER(state, timer) {
        state.autoTimer = timer
    },
    ADD_MARK(state, mark) {
        state.marks.push(mark)
    },
    REMOVE_MARK_BY_ID(state, id) {
        state.marks = state.marks.filter(m => m.id !== id)
    },
    SET_COMBO(state, val) {
        state.combo = val
    },
    SET_PENALTY_COMBO(state, val) {
        state.penaltyCombo = val
    },
    INCREMENT_SUCCESS_COUNT(state) {
        state.successCount++
    },
    SET_BOMBS(state, val) {
        state.bombs = val
    },
    ADD_BOMB(state) {
        state.bombs++
    },
    SET_BOMB_ACTIVE(state, val) {
        state.bombActive = val
    },
    SET_LASER_LAST_SHOT(state, time) {
        state.laserLastShot = time
    },
    UPDATE_ITEM_POSITION(state, { id, updates }) {
        const index = state.items.findIndex(i => i.id === id)
        if (index !== -1) {
            const updated = { ...state.items[index], ...updates }
            state.items.splice(index, 1, updated)
        }
    },
    APPLY_IMPULSE(state, { item, impulseX, impulseY }) {
        const index = state.items.findIndex(i => i.id === item.id)
        if (index !== -1) {
            const updated = {
                ...state.items[index],
                speedX: state.items[index].speedX + impulseX,
                speedY: state.items[index].speedY + impulseY
            }
            state.items.splice(index, 1, updated)
        }
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
        state.laserLastShot = 0
    },
    RESET_STATE(state) {
        if (state.frameId) cancelAnimationFrame(state.frameId)
        if (state.countdownId) clearInterval(state.countdownId)
        if (state.autoTimer) clearInterval(state.autoTimer)
        if (state.tutorialTimer) clearTimeout(state.tutorialTimer)
        state.frameId = null
        state.countdownId = null
        state.autoTimer = null
        state.tutorialTimer = null
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
        state.laserLastShot = 0
    }
}