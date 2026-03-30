<template>
    <div class="catch-log">
        <h3 class="catch-log__title">Catch Log</h3>
        <div class="catch-log__list">
            <div class="catch-log__item">
                <span class="catch-log__label">Perch</span>
                <span class="catch-log__count">{{ inventory.common }}</span>
            </div>
            <div class="catch-log__item">
                <span class="catch-log__label">Carp</span>
                <span class="catch-log__count">{{ inventory.rare }}</span>
            </div>
            <div class="catch-log__item">
                <span class="catch-log__label">Giant Ide</span>
                <span class="catch-log__count">{{ inventory.legendary }}</span>
            </div>
            <div class="catch-log__total">
                Total: {{ totalFish }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '@/stores/game.js'

const gameStore = useGameStore()
const inventory = computed(() => gameStore.getInventory)
const totalFish = computed(() => Object.values(inventory.value).reduce((a, b) => a + b, 0))
</script>

<style scoped lang="scss">
.catch-log {
    position: absolute;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(145deg, #1a1a4f, #2a2a7f);
    border: 2px solid #00ff88;
    box-shadow: 0 0 20px #00ff8820;
    border-radius: 12px;
    padding: 20px;
    color: #00ff88;
    font-family: 'Courier New', monospace;
    backdrop-filter: blur(10px);
    pointer-events: all;
    min-width: 200px;

    &__title {
        margin: 0 0 15px 0;
        font-size: 18px;
        text-align: center;
        text-shadow: 0 0 10px #00ff88;
    }

    &__list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    &__item {
        display: flex;
        justify-content: space-between;
        font-size: 16px;
    }

    &__count {
        font-weight: bold;
        font-size: 20px;
    }

    &__total {
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid #00ff8840;
        text-align: center;
        font-size: 18px;
        color: #88ff88;
    }
}
</style>
