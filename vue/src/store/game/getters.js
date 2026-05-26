import { COLOR_IMAGES, COLOR_NAMES, COLOR_LIST, laserCursor, autoCursor } from '@/config/gameConfig.js'

export default {
    timeDisplay: (state) => {
        const minutes = Math.floor(state.remaining / 60)
        const seconds = state.remaining % 60
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    },
    targetIcon: (state) => COLOR_IMAGES[state.targetColor] || '',
    targetLabel: (state) => COLOR_NAMES[state.targetColor] || state.targetColor,
    activeColors: (state) => COLOR_LIST.slice(0, state.totalColors),
    COLOR_IMAGES: () => COLOR_IMAGES,
    currentCursor: (state) => {
        if (state.currentMode === 'laser') return laserCursor
        if (state.currentMode === 'auto') return autoCursor
        return 'crosshair'
    }
}