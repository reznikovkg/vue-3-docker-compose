<template>
    <div class="game-container">
        <h1 style="text-align:center; color:yellow;">🎣 Рыболовная лодка</h1>

        <div class="main-panel">
            <GameMap :boatX="boatX" :boatY="boatY" :zones="fishingZones" @move="moveBoat" />
            <div style="flex: 1; min-width: 250px;">
                <FishingZone :currentZone="currentZone" :isFishing="isFishing" @startFishing="startFishing" />
            </div>
        </div>

        <FishingGame v-if="miniGameActive" @close="closeMiniGame" @catch="catchFish" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import GameMap from './GameMap.vue'
import FishingGame from './FishingGame.vue'
import FishingZone from './FishingZone.vue'

const boatX = ref(0)
const boatY = ref(0)
const inventory = ref([])
const isFishing = ref(false)
const miniGameActive = ref(false)
let fishingTimer = null

const fishingZones = ref([
    { name: '🌊 Мелководье', type: 'low', x: 15, y: -10, radius: 3, delay: 3000, color: '#4d9eff' },
    { name: '🐟 Среднее место', type: 'medium', x: -5, y: 8, radius: 3, delay: 1200, color: '#e67e22' },
    { name: '⚡ Рыбное место!', type: 'high', x: -1, y: 3, radius: 3, delay: 0, color: '#f1c40f' }
])

const currentZone = computed(() => {
    for (const zone of fishingZones.value) {
        const dx = boatX.value - zone.x
        const dy = boatY.value - zone.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance <= zone.radius) return zone
    }
    return { name: '💧 Обычная вода', type: 'normal', delay: 2000, color: '#93c47d' }
})

function moveBoat(dx, dy) {
    boatX.value += dx
    boatY.value += dy
    saveToLocalStorage()
}

function startFishing() {
    if (isFishing.value) return
    isFishing.value = true
    const delay = currentZone.value.delay

    if (delay === 0) {
        miniGameActive.value = true
        isFishing.value = false
    } else {
        fishingTimer = setTimeout(() => {
            miniGameActive.value = true
            isFishing.value = false
        }, delay)
    }
}

function catchFish(success) {
    if (success) {
        const fishNames = ['Окунь', 'Плотва', 'Щука', 'Карп', 'Лещ']
        const fish = {
            id: Date.now(),
            name: fishNames[Math.floor(Math.random() * fishNames.length)],
            weight: (Math.random() * 2 + 0.3).toFixed(1),
            date: new Date().toLocaleTimeString()
        }
        inventory.value.push(fish)
        saveToLocalStorage()
        alert(`Поймали ${fish.name} (${fish.weight} кг)!`)
    } else {
        alert(' Рыба сорвалась! Попробуйте ещё раз')
    }
}

function closeMiniGame() {
    miniGameActive.value = false
    if (fishingTimer) {
        clearTimeout(fishingTimer)
        fishingTimer = null
    }
    isFishing.value = false

    randomizeZones()

}


function randomizeZones() {
    const bounds = 12
    const zones = fishingZones.value

    zones[0].x = Math.floor(Math.random() * (bounds * 2 + 1)) - bounds
    zones[0].y = Math.floor(Math.random() * (bounds * 2 + 1)) - bounds

    zones[1].x = Math.floor(Math.random() * (bounds * 2 + 1)) - bounds
    zones[1].y = Math.floor(Math.random() * (bounds * 2 + 1)) - bounds

    zones[2].x = Math.floor(Math.random() * (bounds * 2 + 1)) - bounds
    zones[2].y = Math.floor(Math.random() * (bounds * 2 + 1)) - bounds
}


function clearInventory() {
    if (confirm('Очистить весь инвентарь?')) {
        inventory.value = []
        saveToLocalStorage()
    }
}

function saveToLocalStorage() {
    localStorage.setItem('fishingGame', JSON.stringify({
        boatX: boatX.value,
        boatY: boatY.value,
        inventory: inventory.value
    }))
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('fishingGame')
    if (saved) {
        const data = JSON.parse(saved)
        boatX.value = data.boatX || 0
        boatY.value = data.boatY || 0
        inventory.value = data.inventory || []
    }
}

onMounted(() => {
    loadFromLocalStorage()
})
</script>

<style scoped>
.game-container {
    max-width: 1200px;
    margin: 0 auto;
    background: #0a91cc;
    border-radius: 20px;
    padding: 20px;
}

.main-panel {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
}
</style>