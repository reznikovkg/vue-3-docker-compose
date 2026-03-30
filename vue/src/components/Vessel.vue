<template>
    <div class="vessel" :style="vesselStyle">
        <svg class="vessel__hull" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M 20 80 Q 60 40 100 80 T 180 80 L 180 90 L 20 90 Z" fill="#4a5568" stroke="#2d3748"
                stroke-width="2" />
            <path d="M 50 60 L 80 50 L 120 55 L 150 60" fill="#68d391" stroke="#48bb78" stroke-width="1" />
            <rect x="100" y="20" width="4" height="40" fill="#2d3748" />
            <path d="M 102 20 L 120 40 L 102 60 Z" fill="#cbd5e0" stroke="#a0aec0" stroke-width="1" opacity="0.8"
                v-if="!rowing" />
            <path d="M 102 20 L 130 35 L 102 50 Z" fill="#ed8936" stroke="#dd6b20" stroke-width="1" v-else />
        </svg>
        <div class="vessel__sailor" :class="{ 'vessel__sailor--rowing': rowing, 'vessel__sailor--fishing': fishing }">
            <svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
                <circle cx="30" cy="20" r="8" fill="#f7fafc" stroke="#e2e8f0" />
                <rect x="22" y="30" width="16" height="25" rx="8" fill="#f7fafc" stroke="#e2e8f0" />
                <circle cx="25" cy="15" r="3" fill="#1a202c" />
                <circle cx="35" cy="15" r="3" fill="#1a202c" />
                <path d="M 28 42 Q 30 48 32 42" stroke="#2d3748" stroke-width="2" stroke-linecap="round" fill="none" />
            </svg>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '@/stores/game.js'

const gameStore = useGameStore()

const boat = computed(() => gameStore.getBoat)
const rowing = computed(() => boat.value.rowing)
const fishing = computed(() => gameStore.getIsFishing)

const vesselStyle = computed(() => ({
    left: `calc(50% + ${boat.value.x * 0.1}px)`,
    top: `calc(50% + ${boat.value.y * 0.1}px)`,
    transform: `translate(-50%, -50%) scaleX(${boat.value.direction})`
}))
</script>

<style scoped lang="scss">
.vessel {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 5;
    pointer-events: none;
    transition: all 0.1s ease-out;

    &__hull {
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
    }

    &__sailor {
        position: absolute;
        left: 20px;
        top: -60px;
        width: 60px;
        height: 80px;

        &--rowing {
            animation: rowAnim 0.8s steps(4) infinite;
        }

        &--fishing {
            top: -100px;
            left: 0;
            transform: scaleX(-1);
            animation: fishAnim 1s steps(4) infinite;
        }
    }
}

@keyframes rowAnim {

    0%,
    25% {
        transform: translateY(0);
    }

    50%,
    75% {
        transform: translateY(-5px);
    }

    100% {
        transform: translateY(0);
    }
}

@keyframes fishAnim {

    0%,
    50% {
        transform: translateY(0) scaleX(-1);
    }

    100% {
        transform: translateY(-3px) scaleX(-1);
    }
}
</style>
