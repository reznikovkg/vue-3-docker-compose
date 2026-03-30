<template>
    <div class="hook-qte">
        <h3 class="hook-qte__title">{{ title }}</h3>
        <div v-if="qteActive" class="hook-qte__bar">
            <div class="hook-qte__track">
                <div class="hook-qte__marker" :style="{ left: `${markerPos}%` }"></div>
                <div class="hook-qte__target"></div>
            </div>
        </div>
        <p v-else class="hook-qte__hint">{{ hint }}</p>
        <p class="hook-qte__key">Press SPACE</p>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/game.js'

const gameStore = useGameStore()
const qteActive = ref(false)
const markerPos = ref(50)
let interval = null
let timeout = null
let direction = 1

const isFishing = computed(() => gameStore.getIsFishing)
const currentZone = computed(() => gameStore.getCurrentZone)

const title = computed(() => !isFishing.value ? 'Ready to Cast' : qteActive.value ? 'Hook Timing!' : 'Waiting Bite...')
const hint = computed(() => !isFishing.value ? 'SPACE to cast line' : 'Waiting for bite...')

onMounted(() => {
    document.addEventListener('keydown', handleSpace)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleSpace)
    stopQTE()
})

const handleSpace = (e) => {
    if (e.code !== 'Space') return
    e.preventDefault()

    if (!qteActive.value) {
        gameStore.toggleFishing()
        const delay = currentZone.value === 'Обычный' ? 3000 : currentZone.value === 'Средний' ? 1500 : 500
        timeout = setTimeout(startQTE, delay)
        return
    }

    if (markerPos.value > 35 && markerPos.value < 65) {
        const rand = Math.random()
        let type = 'common'
        if (rand > 0.75) type = 'rare'
        if (rand > 0.95) type = 'legendary'
        gameStore.removeCurrentZone()
        gameStore.addFish(type)
    }
    stopQTE()
    gameStore.toggleFishing()
}

const startQTE = () => {
    qteActive.value = true
    markerPos.value = 0
    direction = 1
    interval = setInterval(() => {
        markerPos.value += direction * 0.3
        if (markerPos.value >= 95) direction = -1
        if (markerPos.value <= 0) direction = 1
    }, 80)
}

const stopQTE = () => {
    qteActive.value = false
    clearInterval(interval)
    clearTimeout(timeout)
}
</script>

<style scoped lang="scss">
.hook-qte {
    position: absolute;
    top: 50%;
    left: 20px;
    transform: translateY(-50%);
    background: linear-gradient(145deg, #1a1a4f, #2a2a7f);
    border: 2px solid #ff00ff;
    box-shadow: 0 0 25px #ff00ff30;
    border-radius: 12px;
    padding: 25px;
    color: #ff00ff;
    font-family: 'Courier New', monospace;
    backdrop-filter: blur(10px);
    pointer-events: all;
    min-width: 250px;
    text-align: center;

    &__title {
        margin: 0 0 20px 0;
        font-size: 20px;
        text-shadow: 0 0 12px #ff00ff;
    }

    &__hint {
        margin: 0;
        font-size: 14px;
        opacity: 0.8;
    }

    &__bar {
        margin: 15px 0;
    }

    &__track {
        position: relative;
        height: 30px;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid #ff00ff40;
    }

    &__marker {
        position: absolute;
        top: 0;
        width: 8px;
        height: 100%;
        background: linear-gradient(#ff00ff, #aa00ff);
        box-shadow: 0 0 15px #ff00ff50;
        border-radius: 4px;
    }

    &__target {
        position: absolute;
        top: 0;
        left: 45%;
        width: 10%;
        height: 100%;
        background: rgba(255, 0, 255, 0.3);
        border: 2px solid #ff00ff;
    }

    &__key {
        margin-top: 15px;
        font-size: 24px;
        font-weight: bold;
        text-shadow: 0 0 8px #ff00ff;
        opacity: 0.9;
    }
}
</style>
