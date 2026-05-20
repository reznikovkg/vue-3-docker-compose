<template>
    <div class="game">
        <h1 class="game__title"> Переливатор</h1>
        <div class="game__header">
            <button
                v-if="!getGameStarted"
                class="game__start-button"
                @click="() => startGame()"
            >
            Начать игру
            </button>
            <div class="game__timer">{{ formattedTime }}</div>
            <label class="game__mode-toggle">
                <input
                    type="checkbox"
                    v-model="hardModeLocal"
                    :disabled="getGameStarted"
                >
                Сложный режим
            </label>
        </div>
        <div v-if="getGameWon" class="game__win-message">
            Поздравляем! Вы победили! 
        </div>
        <div class="game__flasks">
            <Flask
                v-for = "(flask, index) in getFlasks"
                :key = "index"
                :layers = "flask"
                :active = "getCurrentFlask === index"
                :blocked = "getHardMode && getBlockedFlask === index"
                :label = "'Колба ' + (index + 1)"
                :max-layers = "MAX_LAYERS"
                @click = "() => handleFlaskClick(index)"
                draggable = "true"
                @dragstart = "(e) => handleDragStart(e, index)"
                @dragover = "(e) => handleDragOver(e)"
                @drop = "(e) => handleDrop(e, index)"
                @dragend = "(e) => handleDragEnd(e)"
            />
        </div>
        <div class="game__controls">
            <button
                class="game__button"
                @click = "() => restartGame()"
            >
            Новая игра
            </button>
        </div>
        <div v-if="getBestTimes.length || getHardModeBestTimes.length" class="game__records">
            <div 
                v-if="!getHardMode && getBestTimes.length"
                :key="'normal-' + getBestTimes.length"
                class="game__records-section"
            >
                <h3>Топ-10 результатов (обычный режим)</h3>
                <ol>
                    <li v-for="(time, idx) in getBestTimes" :key="idx">
                        {{ formatTime(time) }}
                    </li>
                </ol>
            </div>
            <div 
                v-if="getHardMode && getHardModeBestTimes.length"
                :key="'hard-' + getHardModeBestTimes.length"
                class="game__records-section"
            >
                <h3>Топ-10 результатов (сложный режим)</h3>
                <ol>
                    <li v-for="(time, idx) in getHardModeBestTimes" :key="idx">
                        {{ formatTime(time) }}
                    </li>
                </ol>
            </div>
        </div>
    </div>
</template>

<script>
import Flask from '@/ui/Flask.vue'
import { mapGetters, mapActions } from 'vuex';

const MAX_LAYERS = 4

export default {
    name: 'GamePage',
    data() {
        return {
            MAX_LAYERS
        }
    },
    components: {
        Flask
    },
    computed: {
        ...mapGetters('game', [
            'getFlasks',
            'getCurrentFlask',
            'getGameWon',
            'getTime',
            'getBestTimes',
            'getHardModeBestTimes',
            'getHardMode',
            'getBlockedFlask',
            'getGameStarted'
        ]),
        hardModeLocal: {
            get() {
                return this.getHardMode
            },
            set(value) {
                this.toggleHardMode(value)
            }
        },
        formattedTime() {
            return this.formatTime(this.getTime)
        }
    },
    mounted() {
        const saved = localStorage.getItem('bestTimes')
        if (saved) {
            this.setBestTimes(JSON.parse(saved))
        }
        const savedHardMode = localStorage.getItem('hardModeBestTimes')
        if (savedHardMode) {
            this.setHardModeBestTimes(JSON.parse(savedHardMode))
        }
        this.restartGame()
    },
    beforeUnmount() {
        this.stopTimer()
    },
    methods: {
        ...mapActions('game', [
            'initGame',
            'tryMove',
            'stopTimer',
            'startGame',
            'toggleHardMode',
            'setTime',
            'setHardMode',
            'setBlockedFlask',
            'setBestTimes',
            'setHardModeBestTimes',
            'setCurrentFlask',
            'reorderFlasks'
        ]),
        formatTime(seconds){
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return minutes + ':' + secs.toString().padStart(2, '0');
        },
        handleFlaskClick(index) {
            if (!this.getGameStarted) {
                return
            }
            if (this.getCurrentFlask === null) {
                this.setCurrentFlask(index)
            } else {
                this.tryMove({
                    fromFlask: this.getCurrentFlask,
                    toFlask: index
                })
            }
        },
        restartGame() {
            this.stopTimer()
            this.setTime(0)
            this.setHardMode(false)
            this.setBlockedFlask(null)
            this.initGame()
        },
        handleDragStart(event, index) {
            if (!this.getGameStarted) {
                if (this.getHardMode && this.getBlockedFlask === index) {
                    event.preventDefault()
                    return
                }
                event.dataTransfer.setData('text/plain', index)
                event.target.style.opacity = '0.5'
            } else {
                event.preventDefault()
            }
        },
        handleDragOver(event) {
            event.preventDefault()
            event.dataTransfer.dropEffect = 'move'
        },
        handleDrop(event, toIndex) {
            event.preventDefault()
            if (!this.getGameStarted) {
                const fromIndex = parseInt(event.dataTransfer.getData('text/plain'))
                if (fromIndex !== toIndex) {
                    this.reorderFlasks({ from: fromIndex, to: toIndex })
                }
            }
        },
        handleDragEnd(event) {
            event.target.style.opacity = '1'
        }
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

    &__header {
        display: flex;
        gap: 20px;
        align-items: center;
        margin-bottom: 10px;
    }

    &__timer {
        color: white;
        font-size: 20px;
        font-weight: bold;
        background: rgba(0, 0, 0, 0.2);
        padding: 8px 16px;
        border-radius: 8px;
    }

    &__mode-toggle {
        color: white;
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 5px;
        input {
            cursor: pointer;
            &:disabled {
                cursor: not-allowed;
                opacity: 0.5;
            }
        }
    }

    &__records {
        margin-top: 30px;
        color: white;
        text-align: center;
        display: flex;
        gap: 40px;
        flex-wrap: wrap;
        justify-content: center;
        &-section {
            h3 {
                margin-bottom: 10px;
                font-size: 18px;
            }
            ol {
                list-style-position: inside;
                padding: 0;
                li {
                    padding: 4px 0;
                    font-size: 16px;
                }
            }
        }
    }

    &__start-button {
        padding: 12px 24px;
        font-size: 16px;
        border: none;
        border-radius: 8px;
        background: #2ECC71;
        color: white;
        cursor: pointer;
        transition: background 0.3s;
        margin-bottom: 20px;
        &:hover {
            background: #27AE60;
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