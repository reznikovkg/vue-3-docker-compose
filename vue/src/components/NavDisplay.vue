<template>
    <div class="nav-display">
        <h3 class="nav-display__title">Navigation</h3>
        <div class="nav-display__info">
            <div class="nav-display__row">
                <span class="nav-display__label">Position:</span>
                <span class="nav-display__value">{{ posStr }}</span>
            </div>
            <div class="nav-display__row">
                <span class="nav-display__label">Zone:</span>
                <span class="nav-display__value zone--{{ zoneClass }}">{{ currentZone }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '@/stores/game.js'

const gameStore = useGameStore()
const boat = computed(() => gameStore.getBoat)
const currentZone = computed(() => gameStore.getCurrentZone)
const zoneClass = computed(() => currentZone.value.toLowerCase().replace('ий', ''))

const posStr = computed(() => `X: ${boat.value.x}, Y: ${boat.value.y}`)
</script>

<style scoped lang="scss">
.nav-display {
    position: absolute;
    top: 20px;
    background: linear-gradient(145deg, #1a1a4f, #2a2a7f);
    border: 2px solid #00ffff;
    box-shadow: 0 0 20px #00ffff20;
    border-radius: 12px;
    padding: 20px;
    color: #00ffff;
    font-family: 'Courier New', monospace;
    backdrop-filter: blur(10px);
    pointer-events: all;

    &__title {
        margin: 0 0 15px 0;
        font-size: 20px;
        text-align: center;
        text-shadow: 0 0 10px #00ffff;
    }

    &__info {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    &__row {
        display: flex;
        justify-content: space-between;
        font-size: 16px;
    }

    &__value {
        font-weight: bold;

        &.zone--высокий {
            color: #ff00ff;
            text-shadow: 0 0 10px #ff00ff;
        }

        &.zone--средний {
            color: #00ff88;
            text-shadow: 0 0 10px #00ff88;
        }

        &.zone--обычный {
            color: #8888ff;
        }
    }
}
</style>
