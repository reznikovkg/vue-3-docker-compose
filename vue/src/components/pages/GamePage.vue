<template>
    <div class = "game">
        <h1 class = "game__title"> Переливатор</h1>

        <div v-if = "gameWon" class = "game__win-message">
            Поздравляем! Вы победили! 
        </div>
    

        <div class = "game__flasks">
            <Flask
                v-for = "(flask, index) in flasks"
                :key = "index"
                :layers = "flask"
                :active = "currentFlask === index"
                :label = "'Колба ' + (index + 1)"
                :max-layers = "maxLayers"
                @click = "() => handleFlaskClick(index)"
            />
        </div>

        <div class = "game__controls">
            <button
                class = "game__button"
                @click = "() => restartGame()"
            >
            Новая игра
            </button>
        </div>
    </div>
</template>

<script>
import Flask from '@/ui/Flask.vue'
import { mapGetters, mapActions } from 'vuex';

export default {
    name: 'GamePage',

    components: {
        Flask
    },

    computed: {
        ...mapGetters('game', [
            'getFlasks',
            'getCurrentFlask',
            'getGameWon',
            'getMaxLayers'
        ]),

        flasks() {
            return this.getFlasks
        },

        currentFlask() {
            return this.getCurrentFlask
        },

        gameWon() {
            return this.getGameWon
        },

        maxLayers() {
            return this.getMaxLayers
        }
    },

    methods: {
        ...mapActions('game', [
            'initGame',
            'tryMove'
        ]),

        setCurrentFlask(index) {
            this.$store.commit('game/SET_CURRENT_FLASK', index)
        },

        handleFlaskClick(index) {
            if (this.currentFlask === null) {
                this.setCurrentFlask(index)
            } else {
                this.tryMove({
                    fromFlask: this.currentFlask,
                    toFlask: index
                })
            }
        },

        restartGame() {
            this.initGame()
        }
    },

    mounted() {
        this.restartGame()
    }
}
</script>

<style scoped lang = "scss">
.game {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    min-height: 100vh;
    width: 100%;
    max-width: 100%;
    background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);

    &__title {
        color: white;
        font-size: 36px;
        margin-bottom: 20px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }

    &__win-message {
        background: #2ECC71;
        color: white;
        padding: 20px 40px;
        border-radius: 10px;
        font-size: 24px;
        margin-bottom: 20px;
        animation: pulse 1s infinite;
    }

    &__flasks {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
        justify-content: center;
        margin-bottom: 30px;
    }

    &__controls {
        display: flex;
        gap: 10px;
    }

    &__button {
        padding: 12px 24px;
        font-size: 16px;
        border: none;
        border-radius: 8px;
        background: #3498DB;
        color: white;
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
        background: #2980B9;
        }
    }
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}
</style>