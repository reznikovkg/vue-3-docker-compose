<template>
  <div class="fishing-area" v-if="location">
    <div class="fishing-background" :style="{ backgroundImage: `url(${location.image})` }">
      <div class="fishing-content">
        <div class="location-info">
          <div class="back-button-container">
            <button class="back-button" @click="goBack">
              ← Назад к выбору локации
            </button>
          </div>

          <h2>{{ location.name }}</h2>
          <p>{{ location.description }}</p>
        </div>

        <div class="hot-spot-indicator" v-if="hotSpotActive && fishingState === 'waiting'">
          <div class="hot-spot-badge">
            🔥 {{ currentHotSpot?.name }}
          </div>
        </div>

        <div
          class="float-visualization"
          v-if="fishingState === 'waiting' || fishingState === 'fighting'"
          :style="floatStyle"
        >
          <div class="float-bobber" :class="{ biting: fishingState === 'fighting' }">
            🎯
          </div>
          <div class="ripple-effect" v-if="showRipple"></div>

          <div
            class="hot-spot-glow"
            v-if="hotSpotActive && currentHotSpot"
            :style="hotSpotStyle"
          >
            <div class="hot-spot-ring"></div>
            <div class="hot-spot-text">{{ currentHotSpot.name }}</div>
          </div>
        </div>

        <div class="tension-meter" v-if="fishingState === 'fighting'">
          <div class="tension-label">Натяжение лески: {{ Math.round(tension) }}%</div>
          <div class="tension-bar">
            <div
              class="tension-fill"
              :style="{ width: tension + '%' }"
              :class="tensionClass"
            ></div>
          </div>
          <div class="tension-hint">
            {{ tensionHint }}
          </div>
          <div class="break-warning" v-if="tension > 80 && equippedRod?.id !== 'rod_basic'">
            ⚠️ Высокий риск поломки удочки!
          </div>
        </div>

        <div class="fishing-controls">
          <button
            class="fish-button"
            @click="handleStartFishing"
            :disabled="fishingState !== 'idle'"
            v-if="fishingState === 'idle'"
          >
            🎣 Забросить удочку
          </button>

          <button
            class="reel-button"
            @mousedown="startReeling"
            @mouseup="stopReeling"
            @touchstart="startReeling"
            @touchend="stopReeling"
            :disabled="fishingState !== 'fighting'"
            v-if="fishingState === 'fighting'"
          >
            🎣 ТЯНУТЬ (Удерживайте ЛКМ)
          </button>

          <div class="result-container" v-if="showResult">
            <div class="success-message" v-if="fishingResult && fishingResult.type === 'success'">
              <h3>🎉 Поймали!</h3>
              <p>{{ currentFish?.emoji }} {{ currentFish?.name }}</p>

              <div class="fish-size-info" v-if="currentFish?.caughtSize && currentFish?.weight">
                <div class="fish-size">
                  Размер: {{ currentFish.caughtSize.name }}
                  <span class="fish-weight">({{ currentFish.weight }}г)</span>
                </div>
                <div class="size-badge" :class="getSizeClass(currentFish.caughtSize.name)">
                  {{ getSizeEmoji(currentFish.caughtSize.name) }}
                </div>
              </div>

              <div class="fish-strength" v-if="currentFish">
                Сила: {{ currentFish.actualStrength || currentFish.strength }}
              </div>
            </div>

            <div class="failed-message" v-if="fishingResult && fishingResult.type === 'failed'">
              <h3>❌ Рыба ушла!</h3>
              <p>{{ fishingResult.message }}</p>
            </div>

            <div class="rod-break-message" v-if="fishingResult && fishingResult.type === 'rod_break'">
              <h3>💥 Удочка сломалась!</h3>
              <p>{{ fishingResult.message }}</p>
              <div class="break-consequence">
                <p>🆘 Бесплатная удочка добавлена в инвентарь</p>
                <p>🎣 Экипирована простая удочка</p>
              </div>
            </div>
          </div>

          <div class="fishing-hint" v-if="fishingState === 'waiting'">
            <div class="waiting-animation">⏳</div>
            <div class="waiting-text">Ждем поклевки...</div>
          </div>

          <div class="fishing-hint" v-if="fishingState === 'fighting'">
            <div class="fighting-instruction">
              🎣 Удерживайте ЛКМ чтобы вытащить рыбу!
            </div>
            <div class="fighting-target">
              Цель: натяжение ≤ 10%
            </div>
            <div class="break-hint" v-if="tension > 80 && equippedRod?.id !== 'rod_basic'">
              ⚠️ Осторожно! При натяжении >80% удочка может сломаться
            </div>
          </div>

          <div class="casting-animation" v-if="fishingState === 'casting'">
            <div class="casting-text">Забрасываем удочку...</div>
            <div class="casting-dots">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>

        <div class="fishing-rod-container">
          <div class="fishing-rod" :class="{
            casting: fishingState === 'casting',
            waiting: fishingState === 'waiting',
            reeling: isReeling,
            fighting: fishingState === 'fighting',
            broken: fishingResult?.type === 'rod_break'
          }">
            <div class="rod-handle"></div>
            <div class="rod-line"></div>
            <div class="fishing-hook" :class="{
              biting: fishingState === 'fighting'
            }"></div>
          </div>

          <div
            class="biting-fish"
            v-if="fishingState === 'fighting' && currentFish"
          >
            {{ currentFish.emoji }}
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading">
    Загрузка локации...
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, computed, watch, ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import type { Location, Fish } from '@/types'

const props = defineProps<{
  location: Location | null
}>()

const emit = defineEmits<{
  'catch-fish': [fish: Fish & { location: string }]
}>()

const store = useStore()
const router = useRouter()

const goBack = () => {
  router.push('/')
}

const fishingState = computed(() => store.getters['game/fishingState'])
const isReeling = computed(() => store.getters['game/isReeling'])
const tension = computed(() => store.getters['game/tension'])
const currentFish = computed(() => store.getters['game/currentFish'])
const showResult = computed(() => store.getters['game/showResult'])
const fishingResult = computed(() => store.getters['game/fishingResult'])
const canStartFishing = computed(() => store.getters['game/canStartFishing'])
const equippedTackle = computed(() => store.getters['fishing/equippedTackle'])
const tensionClass = computed(() => store.getters['game/tensionClass'])
const tensionHint = computed(() => store.getters['game/tensionHint'])
const hotSpotActive = computed(() => store.getters['game/hotSpotActive'])
const currentHotSpot = computed(() => store.getters['game/currentHotSpot'])
const equippedRod = computed(() => equippedTackle.value.rod)
const fishAlreadyAdded = ref(false)

const floatPosition = reactive({
  x: 50,
  y: 30
})

const showRipple = ref(false)
const castInProgress = ref(false)

const floatStyle = computed(() => ({
  left: `${floatPosition.x}%`,
  top: `${floatPosition.y}%`,
  opacity: (fishingState.value === 'waiting' || fishingState.value === 'fighting') ? 1 : 0,
  transform: castInProgress.value ? 'scale(0.5)' : 'scale(1)'
}))

const hotSpotStyle = computed(() => ({
  left: `${hotSpotPosition.value.x}%`,
  top: `${hotSpotPosition.value.y}%`
}))

const hotSpotPosition = computed(() => {
  if (!currentHotSpot.value) return { x: 50, y: 50 }

  const spotId = currentHotSpot.value.id
  const x = (spotId.charCodeAt(0) * 17 + spotId.charCodeAt(1) * 13) % 70 + 15
  const y = (spotId.charCodeAt(2) * 19 + spotId.charCodeAt(3) * 11) % 60 + 20

  return { x, y }
})

const getSizeClass = (sizeName: string) => {
  const sizeClasses = {
    'Мелкий': 'size-small',
    'Средний': 'size-medium',
    'Крупный': 'size-large',
    'Трофейный': 'size-trophy'
  }
  return sizeClasses[sizeName] || 'size-small'
}

const getSizeEmoji = (sizeName: string) => {
  const sizeEmojis = {
    'Мелкий': '🔸',
    'Средний': '🔷',
    'Крупный': '💠',
    'Трофейный': '🏆'
  }
  return sizeEmojis[sizeName] || '🔸'
}

const handleStartFishing = async () => {
  await store.dispatch('fishing/setCurrentLocation', props.location)
  await store.dispatch('game/startFishing')
}

const startReeling = () => {
  if (fishingState.value !== 'fighting') return
  store.dispatch('game/setIsReeling', true)
}

const stopReeling = () => {
  store.dispatch('game/setIsReeling', false)
}

const castFloat = () => {
  castInProgress.value = true

  if (hotSpotActive.value && Math.random() < 0.6) {
    floatPosition.x = hotSpotPosition.value.x + (Math.random() * 20 - 10)
    floatPosition.y = hotSpotPosition.value.y + (Math.random() * 15 - 7.5)
  } else {
    floatPosition.x = 30 + Math.random() * 40
    floatPosition.y = 20 + Math.random() * 30
  }

  floatPosition.x = Math.max(10, Math.min(90, floatPosition.x))
  floatPosition.y = Math.max(15, Math.min(70, floatPosition.y))

  setTimeout(() => {
    castInProgress.value = false
    showRipple.value = true
    setTimeout(() => {
      showRipple.value = false
    }, 1000)
  }, 800)
}

const handleFishCaught = () => {
  const fish = store.getters['game/currentFish']

  if (fish) {
    const fishWithLocation = {
      ...fish,
      location: props.location?.name || 'Неизвестная локация',
      timestamp: new Date().toLocaleTimeString(),
      strength: fish.strength
    }

    fishAlreadyAdded.value = true

    store.dispatch('fishing/addCaughtFish', fishWithLocation)
    emit('catch-fish', fishWithLocation)
  }
}

watch(fishingState, (newState, oldState) => {
  if (newState === 'idle' || newState === 'casting') {
    fishAlreadyAdded.value = false
  }

  if (newState === 'waiting' && oldState === 'casting') {
    castFloat()
  }

  if (newState === 'idle' || newState === 'success' || newState === 'failed') {
    castInProgress.value = false
    showRipple.value = false
  }
})

watch(fishingResult, (newResult) => {
  if (newResult?.type === 'success' && currentFish.value) {
    setTimeout(() => {
      handleFishCaught()
    }, 100)
  }
})

onUnmounted(() => {
  store.dispatch('game/stopGameLoop')
  store.dispatch('game/resetGame')
})
</script>

<style scoped lang="less">
@safe-color: #4CAF50;
@warning-color: #FF9800;
@danger-color: #f44336;
@success-bg: #E8F5E8;
@failed-bg: #FFEBEE;
@rod-color: #8B4513;
@hook-color: #FFD700;
@text-dark: #333;
@success-text: #2E7D32;
@failed-text: #C62828;
@break-color: #D32F2F;

.location-info {
  position: relative;
  padding: 20px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent);
  z-index: 2;

  .back-button-container {
    margin-bottom: 15px;
  }

  .back-button {
    background: rgba(255, 255, 255, 0.9);
    color: #333;
    border: 2px solid #4CAF50;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: bold;
    font-size: 0.85em;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);

    &:hover {
      background: #4CAF50;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
  }

  h2 {
    color: white;
    margin-bottom: 8px;
    font-size: 1.8em;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  }

  p {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.1em;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  }
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 600px;
  font-size: 1.5em;
  color: #666;
  background: #f8f9fa;
  border-radius: 15px;
}

.fishing-area {
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  height: 600px;
  position: relative;

  .fishing-background {
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;

    .fishing-content {
      position: relative;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: rgba(0, 0, 0, 0.4);
      color: white;

      .hot-spot-indicator {
        position: absolute;
        top: 20px;
        right: 20px;
        z-index: 10;

        .hot-spot-badge {
          background: rgba(255, 107, 107, 0.9);
          color: white;
          padding: 8px 12px;
          border-radius: 15px;
          font-weight: bold;
          font-size: 0.9em;
          backdrop-filter: blur(10px);
          border: 2px solid #FFD700;
          animation: pulse 2s infinite;
        }
      }

      .float-visualization {
        position: absolute;
        transform: translate(-50%, -50%);
        transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        z-index: 4;
        pointer-events: none;

        .float-bobber {
          font-size: 24px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
          animation: floatBob 3s ease-in-out infinite;

          &.biting {
            animation: biteAnimation 0.5s infinite alternate;
          }
        }

        .ripple-effect {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 60px;
          height: 60px;
          border: 2px solid rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: ripple 1s ease-out;
        }
      }

      .hot-spot-glow {
        position: absolute;
        transform: translate(-50%, -50%);
        z-index: 3;
        pointer-events: none;

        .hot-spot-ring {
          width: 80px;
          height: 80px;
          border: 3px solid #FFD700;
          border-radius: 50%;
          animation: hotSpotPulse 2s infinite;
          background: radial-gradient(
            circle,
            rgba(255, 215, 0, 0.3) 0%,
            rgba(255, 215, 0, 0.1) 50%,
            transparent 70%
          );
        }

        .hot-spot-text {
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          color: #FFD700;
          font-weight: bold;
          font-size: 0.8em;
          white-space: nowrap;
          text-shadow: 0 0 3px rgba(0,0,0,0.8);
          background: rgba(255, 107, 107, 0.9);
          padding: 2px 8px;
          border-radius: 10px;
        }
      }

      .tension-meter {
        background: rgba(0, 0, 0, 0.7);
        padding: 15px;
        border-radius: 10px;
        margin: 20px auto;
        max-width: 400px;
        backdrop-filter: blur(10px);
        z-index: 3;

        .tension-label {
          color: white;
          margin-bottom: 10px;
          font-weight: bold;
          text-align: center;
        }

        .tension-bar {
          position: relative;
          height: 30px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 15px;
          overflow: hidden;
          margin-bottom: 8px;

          .tension-fill {
            height: 100%;
            border-radius: 15px;
            transition: width 0.1s ease, background-color 0.3s ease;

            &.safe {
              background: linear-gradient(90deg, @safe-color, lighten(@safe-color, 10%));
            }

            &.warning {
              background: linear-gradient(90deg, @warning-color, lighten(@warning-color, 10%));
            }

            &.danger {
              background: linear-gradient(90deg, @danger-color, lighten(@danger-color, 10%));
              animation: pulse 0.5s infinite alternate;
            }
          }
        }

        .tension-hint {
          color: #FFC107;
          font-size: 0.9em;
          text-align: center;
          margin-top: 5px;
        }

        .break-warning {
          color: #FF6B6B;
          font-weight: bold;
          text-align: center;
          margin-top: 8px;
          animation: warningPulse 1s infinite;
          background: rgba(255, 107, 107, 0.2);
          padding: 5px;
          border-radius: 5px;
          border: 1px solid #FF6B6B;
        }
      }

      .fishing-controls {
        text-align: center;
        padding: 20px;
        z-index: 3;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;

        .fish-button, .reel-button {
          color: white;
          border: none;
          padding: 15px 30px;
          font-size: 1.2em;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: bold;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          min-width: 200px;

          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.4);
          }
        }

        .fish-button {
          background: linear-gradient(135deg, @safe-color, darken(@safe-color, 10%));
        }

        .reel-button {
          background: linear-gradient(135deg, #2196F3, #1976D2);
        }

        .fish-button:disabled,
        .reel-button:disabled {
          background: #666;
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .result-container {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1000;
          animation: popIn 0.5s ease-out;

          .success-message, .failed-message, .rod-break-message {
            background: white;
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            text-align: center;
            min-width: 300px;
            border: 4px solid;
          }

          .success-message {
            border-color: @safe-color;
            background: linear-gradient(135deg, @success-bg, lighten(@success-bg, 5%));

            h3 {
              color: @success-text;
              margin: 0 0 10px 0;
              font-size: 1.5em;
            }

            p {
              color: @text-dark;
              margin: 0;
              font-size: 1.3em;
              font-weight: bold;
            }

            .fish-size-info {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
              margin: 10px 0;

              .fish-size {
                font-weight: bold;
                color: #333;

                .fish-weight {
                  color: #666;
                  font-size: 0.9em;
                }
              }

              .size-badge {
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.8em;
                font-weight: bold;

                &.size-small {
                  background: #E8F5E8;
                  color: #2E7D32;
                }

                &.size-medium {
                  background: #E3F2FD;
                  color: #1565C0;
                }

                &.size-large {
                  background: #FFF3E0;
                  color: #EF6C00;
                }

                &.size-trophy {
                  background: linear-gradient(135deg, #FFD700, #FFA000);
                  color: #7B1FA2;
                  animation: glow 2s infinite alternate;
                }
              }
            }

            .fish-strength {
              color: #666;
              font-size: 0.9em;
              margin-top: 10px;
            }
          }

          .failed-message {
            border-color: @danger-color;
            background: linear-gradient(135deg, @failed-bg, lighten(@failed-bg, 5%));

            h3 {
              color: @failed-text;
              margin: 0 0 10px 0;
              font-size: 1.5em;
            }

            p {
              color: @text-dark;
              margin: 0;
              font-size: 1.3em;
              font-weight: bold;
            }
          }

          .rod-break-message {
            border-color: @break-color;
            background: linear-gradient(135deg, #FFEBEE, lighten(#FFEBEE, 5%));

            h3 {
              color: @break-color;
              margin: 0 0 15px 0;
              font-size: 1.5em;
            }

            p {
              color: @text-dark;
              margin: 0 0 15px 0;
              font-size: 1.1em;
              font-weight: bold;
            }

            .break-consequence {
              background: rgba(255, 255, 255, 0.7);
              padding: 15px;
              border-radius: 10px;
              margin-top: 15px;

              p {
                margin: 5px 0;
                font-size: 0.9em;
                color: #666;
              }
            }
          }
        }

        .fishing-hint {
          color: #FFC107;
          text-align: center;
          font-size: 0.9em;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          background: rgba(0, 0, 0, 0.7);
          padding: 15px;
          border-radius: 8px;
          backdrop-filter: blur(10px);

          .waiting-animation {
            font-size: 2em;
            margin-bottom: 10px;
            animation: pulse 2s infinite;
          }

          .waiting-text {
            font-size: 1.1em;
            margin-bottom: 10px;
          }

          .fighting-instruction {
            font-size: 1.1em;
            font-weight: bold;
            margin-bottom: 5px;
          }

          .fighting-target {
            color: #4CAF50;
            font-weight: bold;
          }

          .break-hint {
            color: #FF6B6B;
            font-weight: bold;
            margin-top: 8px;
            font-size: 0.8em;
            background: rgba(255, 107, 107, 0.2);
            padding: 5px;
            border-radius: 5px;
            border: 1px solid #FF6B6B;
          }
        }

        .casting-animation {
          text-align: center;
          color: #FFC107;

          .casting-text {
            font-size: 1.1em;
            margin-bottom: 10px;
            font-weight: bold;
          }

          .casting-dots {
            display: flex;
            justify-content: center;
            gap: 5px;

            .dot {
              width: 8px;
              height: 8px;
              background: #FFC107;
              border-radius: 50%;
              animation: castingDots 1.4s infinite ease-in-out;

              &:nth-child(1) { animation-delay: -0.32s; }
              &:nth-child(2) { animation-delay: -0.16s; }
            }
          }
        }
      }

      .fishing-rod-container {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 200px;
        z-index: 5;
        pointer-events: none;

        .fishing-rod {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          transform-origin: bottom center;
          z-index: 1;
          transition: all 0.5s ease;

          &.casting {
            animation: castRod 1.5s ease;
          }

          &.waiting {
            animation: waitRod 2s infinite alternate;
          }

          &.reeling {
            animation: reelRod 0.3s infinite alternate;
          }

          &.fighting {
            animation: fightRod 0.5s infinite alternate;
          }

          &.broken {
            animation: breakRod 0.5s ease forwards;
          }

          .rod-handle {
            width: 6px;
            height: 80px;
            background: linear-gradient(to right, @rod-color, lighten(@rod-color, 10%), @rod-color);
            border-radius: 3px;
            position: relative;
            z-index: 1;
          }

          .rod-line {
            width: 2px;
            height: 150px;
            background: linear-gradient(to bottom,
              rgba(255, 255, 255, 0.8) 0%,
              rgba(255, 255, 255, 0.6) 50%,
              rgba(255, 255, 255, 0.4) 100%);
            margin: 0 auto;
            position: relative;
            top: -5px;
          }

          .fishing-hook {
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 12px;
            height: 12px;
            border: 2px solid @hook-color;
            border-top: none;
            border-right: none;
            border-radius: 0 0 0 50%;
            transform-origin: top left;
            transform: translateX(-50%) rotate(-45deg);
            transition: all 0.3s ease;

            &.biting {
              animation: biteHook 0.5s infinite alternate;
            }
          }
        }

        .biting-fish {
          position: absolute;
          bottom: 130px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 32px;
          z-index: 2;
          animation: bite 0.5s infinite alternate;
          filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.5));
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
      }
    }
  }
}

@keyframes breakRod {
  0% {
    transform: translateX(-50%) rotate(0deg);
  }
  25% {
    transform: translateX(-50%) rotate(15deg);
  }
  50% {
    transform: translateX(-50%) rotate(-10deg);
  }
  75% {
    transform: translateX(-50%) rotate(5deg);
  }
  100% {
    transform: translateX(-50%) rotate(0deg) scale(0.8);
    opacity: 0.5;
    filter: grayscale(100%);
  }
}

@keyframes warningPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes floatBob {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-5px) rotate(5deg);
  }
}

@keyframes biteAnimation {
  0% {
    transform: translateY(0px) scale(1);
  }
  100% {
    transform: translateY(-8px) scale(1.1);
    filter: drop-shadow(0 0 8px #FFD700);
  }
}

@keyframes ripple {
  0% {
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    width: 100px;
    height: 100px;
    opacity: 0;
  }
}

@keyframes hotSpotPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
}

@keyframes glow {
  0% { box-shadow: 0 0 5px #FFD700; }
  100% { box-shadow: 0 0 20px #FFA000; }
}

@keyframes castRod {
  0% {
    transform: translateX(-50%) rotate(0deg);
    bottom: 20px;
  }
  50% {
    transform: translateX(-50%) rotate(-60deg);
    bottom: 30px;
  }
  100% {
    transform: translateX(-50%) rotate(0deg);
    bottom: 20px;
  }
}

@keyframes waitRod {
  0% { transform: translateX(-50%) rotate(0deg); }
  50% { transform: translateX(-50%) rotate(5deg); }
  100% { transform: translateX(-50%) rotate(0deg); }
}

@keyframes reelRod {
  0% { bottom: 20px; }
  100% { bottom: 25px; }
}

@keyframes fightRod {
  0% { transform: translateX(-50%) rotate(-5deg); }
  100% { transform: translateX(-50%) rotate(5deg); }
}

@keyframes biteHook {
  0% { transform: translateX(-50%) rotate(-45deg); }
  100% { transform: translateX(-50%) rotate(-35deg); }
}

@keyframes bite {
  0% { transform: translateX(-50%) translateY(0); }
  100% { transform: translateX(-50%) translateY(-10px); }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes popIn {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
  70% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.1);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes castingDots {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .location-info {
    .back-button-container {
      margin-bottom: 10px;
    }

    .back-button {
      padding: 6px 12px;
      font-size: 0.75em;
    }
  }

  .fishing-area {
    height: 500px;

    .fishing-controls .result-container {
      .success-message, .failed-message, .rod-break-message {
        min-width: 250px;
        padding: 20px;
      }
    }

    .fishing-rod-container {
      .rod-line {
        height: 120px;
      }

      .biting-fish {
        bottom: 100px;
      }
    }
  }
}
</style>