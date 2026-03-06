<template>
    <div class="slots">
        <div v-for="(row, i) in slots" 
            :key="i" 
            class="slots__row">
            <div 
                v-for="(slot, j) in row" 
                :key="j" 
                class="slots__cell" 
                @dragover.prevent
                @drop="(event) => drop(i, j, event)"
            >
                <button 
                    v-if="slot" 
                    class="slots__remove" 
                    @click.stop="() => remove(i, j)"
            >
                 ✕
                </button>
                <span v-if="slot">{{ icons[slot] || '✨' }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
    computed: {
        ...mapGetters(['slots']),
        icons() {
            return {
                fire: '🔥', water: '💧', earth: '🌍', air: '🌪',
                steam: '☁️', mud: '🟫', lava: '🌋',
                dust: '🌫', metal: '⚙️', plant: '🌿', energy: '⚡',
                ice: '❄️', cloud: '☁️', sand: '🏜', crystal: '💎',
                metallic_lava: '🌋⚙️', snow: '❄️☁️'
            }
        }
    },
    methods: {
        ...mapActions(['setSlot']),

        drop(row, col, event) {
            const element = event.dataTransfer.getData("text/plain");
            if (element) {
                this.setSlot({ row, col, el: element })
            }
        },

        remove(row, col) {
            this.setSlot({ row, col, el: null })
        }
    }
}
</script>

<style scoped lang="scss">
.slots {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;

    &__row {
        display: flex;
        gap: 8px;
        justify-content: center;
    }

    &__cell {
        position: relative;
        width: 70px;
        height: 70px;
        background: #fff;
        border-radius: 8px;
        border: 2px solid #ccc;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 28px;
        cursor: pointer;
        transition: 0.2s;

        &:hover {
            background: #f0f0f0;
            border-color: #4ecdc4;
        }
    }

    &__remove {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 18px;
        height: 18px;
        background: #ff6b6b;
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        transition: 0.2s;
        z-index: 10;

        &:hover {
            transform: scale(1.1);
        }
    }
}

@media (max-width: 600px) {
    .slots {
        &__cell {
            width: 60px;
            height: 60px;
            font-size: 24px;
        }
    }
}
</style>