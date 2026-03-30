<template>
    <canvas class="sea-canvas" ref="canvas" />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useGameStore } from '@/stores/game.js'

const canvas = ref(null)
const ctx = ref(null)
const gameStore = useGameStore()
const keysPressed = ref({ w: false, a: false, s: false, d: false, ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false })

let animationFrame = null
let mouseX = 0

onMounted(() => {
    ctx.value = canvas.value.getContext('2d')
    canvas.value.width = window.innerWidth
    canvas.value.height = window.innerHeight

    gameStore.generateZones()

    window.addEventListener('keydown', (e) => {
        if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(e.code.replace('Key', '').replace('Arrow', ''))) {
            keysPressed.value[e.code] = true
            e.preventDefault()
        }
    })
    window.addEventListener('keyup', (e) => {
        keysPressed.value[e.code] = false
    })

    animationFrame = requestAnimationFrame(updateCanvas)

    window.addEventListener('mousemove', (e) => mouseX = e.clientX)
})

onUnmounted(() => {
    cancelAnimationFrame(animationFrame)
})

const updateCanvas = () => {
    ctx.value.fillStyle = '#0a0a1f'
    ctx.value.fillRect(0, 0, canvas.value.width, canvas.value.height)

    ctx.value.strokeStyle = '#1a1a4f'
    ctx.value.lineWidth = 2
    for (let i = 0; i < 10; i++) {
        ctx.value.beginPath()
        for (let x = 0; x < canvas.value.width; x += 5) {
            const y = Math.sin(x * 0.01 + i * 0.5) * 20 + canvas.value.height * 0.6 + i * 30
            ctx.value.lineTo(x, y)
        }
        ctx.value.stroke()
    }

    const zones = gameStore.getZones
    ctx.value.save()
    ctx.value.translate(canvas.value.width / 2, canvas.value.height / 2)
    zones.value.forEach(zone => {
        ctx.value.beginPath()
        ctx.value.arc(zone.x * 0.1, zone.y * 0.1, zone.type === 'high' ? 12 : 6, 0, Math.PI * 2)
        ctx.value.fillStyle = zone.type === 'high' ? '#ff00ff' : '#00ffff'
        ctx.value.globalAlpha = 0.3
        ctx.value.fill()
        ctx.value.globalAlpha = 1
        ctx.value.strokeStyle = zone.type === 'high' ? '#ff00ff' : '#00ffff'
        ctx.value.lineWidth = 2
        ctx.value.stroke()
    })
    ctx.value.restore()

    ctx.value.save()
    ctx.value.translate(canvas.value.width / 2 + gameStore.getBoat.x * 0.1, canvas.value.height / 2 + gameStore.getBoat.y * 0.1)
    ctx.value.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.value.beginPath()
    ctx.value.ellipse(0, 10, 20, 8, 0, 0, Math.PI * 2)
    ctx.value.fill()
    ctx.value.restore()

    animationFrame = requestAnimationFrame(updateCanvas)
}

const moveLoop = () => {
    if (keysPressed.value['KeyW'] || keysPressed.value['ArrowUp']) gameStore.moveBoat(0, -1)
    if (keysPressed.value['KeyS'] || keysPressed.value['ArrowDown']) gameStore.moveBoat(0, 1)
    if (keysPressed.value['KeyA'] || keysPressed.value['ArrowLeft']) {
        gameStore.moveBoat(-1, 0)
        gameStore.setDirection(-1)
    }
    if (keysPressed.value['KeyD'] || keysPressed.value['ArrowRight']) {
        gameStore.moveBoat(1, 0)
        gameStore.setDirection(1)
    }
    gameStore.setRowing(Object.values(keysPressed.value).some(v => v))
    requestAnimationFrame(moveLoop)
}
moveLoop()

window.addEventListener('resize', () => {
    canvas.value.width = window.innerWidth
    canvas.value.height = window.innerHeight
})
</script>

<style scoped lang="scss">
.sea-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 1;
}
</style>
