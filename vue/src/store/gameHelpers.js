import { RADIUS } from '@/config/gameConfig'

export const getCoords = (event, stageRef) => {
    if (!stageRef) return { x: 0, y: 0 }
    const rect = stageRef.getBoundingClientRect()
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    }
}

export const spawnChildrenSync = (state, getters, parent, customConfig = null) => {
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
        if (parentSize === 'large') {
            childSize = 'medium'
            childRadius = RADIUS.medium
            count = 3
        } else if (parentSize === 'medium') {
            childSize = 'small'
            childRadius = RADIUS.small
            count = 5
        } else {
            return []
        }
    }

    const orbitRadius = parent.radius + childRadius + 5
    const angleStep = (Math.PI * 2) / count

    for (let i = 0; i < count; i++) {
        const angle = i * angleStep
        const x = parentX + Math.cos(angle) * orbitRadius
        const y = parentY + Math.sin(angle) * orbitRadius

        let randomColor
        const activeColors = getters.activeColors
        if (activeColors.length === 1) {
            randomColor = activeColors[0]
        } else {
            do {
                randomColor = activeColors[Math.floor(Math.random() * activeColors.length)]
            } while (randomColor === parentColor)
        }

        children.push({
            id: `${performance.now()}-${Math.random()}-${i}`,
            color: i === 0 ? parentColor : randomColor,
            x, y,
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

export const spawnBombSmallsSync = (state, getters, parent) => {
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
            id: `${performance.now()}-${Math.random()}-${i}`,
            color: i === 0 ? parent.color : randomColor,
            x, y,
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