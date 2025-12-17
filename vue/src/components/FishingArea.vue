<template>
  <div class="fishing-area">
    <div class="fishing-area__header">
      <button class="fishing-area__back-button" @click="goBack">← Назад</button>
      <h2 class="fishing-area__location-name">{{ location?.name }}</h2>
    </div>

    <div
      class="fishing-area__water"
      :style="{ backgroundImage: `url(${location?.image})` }"
      @click="handleWaterClick"
    >
      <div class="fishing-area__rod" :style="rodStyle">
        🎣
      </div>

      <div
        v-if="shouldShowFloat"
        class="fishing-area__float"
        :style="floatStyle"
        :class="{ 'fishing-area__float--biting': fishingState === 'fighting' }"
      >
        🎯
      </div>

      <div
        v-if="shouldShowFish"
        class="fishing-area__fish"
        :style="fishStyle"
        :class="{
          'fishing-area__fish--struggling': fishMovement?.isStruggling,
          'fishing-area__fish--tired': fishMovement?.stamina < 30
        }"
      >
        {{ currentFish?.emoji }}
      </div>

      <div
        v-for="spot in groundbaitSpots"
        :key="spot.id"
        class="fishing-area__groundbait-spot"
        :style="getGroundbaitSpotStyle(spot)"
        :title="getGroundbaitSpotTooltip(spot)"
      >
        <div class="fishing-area__groundbait-pulse"></div>
        <div class="fishing-area__groundbait-center">
          <div class="fishing-area__groundbait-level">Ур. {{ spot.level }}</div>
          <div class="fishing-area__groundbait-emoji">{{ spot.groundbaitType.emoji }}</div>
        </div>
        <div class="fishing-area__groundbait-info">
          <div class="fishing-area__groundbait-uses">{{ spot.currentUses }}/{{ spot.groundbaitType.uses }}</div>
        </div>
      </div>

      <div
        v-if="fishingState === 'casting' || fishingState === 'waiting' || fishingState === 'fighting'"
        class="fishing-area__line"
        :style="currentLineStyle"
      ></div>

      <div class="fishing-area__shore"></div>
    </div>

    <div v-if="groundbaitEffectActive && fishingState === 'waiting'" class="fishing-area__groundbait-effect">
      <div class="fishing-area__groundbait-effect-icon">🎯</div>
      <div class="fishing-area__groundbait-effect-text">{{ groundbaitEffectMessage }}</div>
    </div>

    <div class="fishing-area__controls">
      <div v-if="fishingState === 'idle'" class="fishing-area__cast-control">
        <button
          class="fishing-area__cast-button"
          @click="startCastingMode"
          :disabled="!hasBait"
        >
          🎣
        </button>
        <div class="fishing-area__cast-label">Забросить</div>
      </div>

      <div v-if="fishingState === 'fighting'" class="fishing-area__reel-control">
        <button
          class="fishing-area__reel-button"
          @mousedown="startReeling"
          @mouseup="stopReeling"
          @touchstart="startReeling"
          @touchend="stopReeling"
          :class="{ 'fishing-area__reel-button--active': isReeling }"
        >
          🎣
        </button>
        <div class="fishing-area__reel-label">
          {{ isReeling ? 'ТЯНУТЬ...' : 'ТЯНУТЬ' }}
        </div>
      </div>

      <div v-if="isNetEquipped && fishingState === 'fighting'" class="fishing-area__net-control">
        <button
          class="fishing-area__net-button"
          @click="useNet"
          :disabled="!isNetAvailable"
          :title="netButtonTitle"
          :class="{
            'fishing-area__net-button--active': isNetAvailable,
            'fishing-area__net-button--warning': hasWarning
          }"
        >
          🎯
        </button>
        <div class="fishing-area__net-label">
          САЧОК (N)<br>
          <span v-if="equippedNet">{{ equippedNet.usesLeft }}/{{ equippedNet.maxUses || 10 }}</span>
        </div>
      </div>

      <div class="fishing-area__groundbait" @click="toggleGroundbaitPanel">
        🍚
        <div v-if="activeGroundbait" class="fishing-area__groundbait-active"></div>
      </div>
    </div>

    <div v-if="fishingState === 'fighting'" class="fishing-area__indicators">
      <div v-if="isNetEquipped" class="fishing-area__net-indicator">
        <div class="fishing-area__net-indicator-label">🎯 Сачок: {{ equippedNet?.name }}</div>
        <div class="fishing-area__net-indicator-info">
          <div class="fishing-area__net-indicator-uses">
            Использований: {{ equippedNet?.usesLeft || 0 }} из {{ equippedNet?.maxUses || 10 }}
          </div>
          <div class="fishing-area__net-indicator-weight">
            Макс. вес: {{ equippedNet?.maxWeight || 3 }} кг
          </div>
          <div v-if="isNetAvailable && !isNetUsed" class="fishing-area__net-indicator-hint fishing-area__net-indicator-hint--active">
            Нажмите N или кнопку для вылова!
          </div>
          <div v-else-if="isNetUsed" class="fishing-area__net-indicator-hint fishing-area__net-indicator-hint--used">
            ✅ Сачок использован
          </div>
          <div v-else-if="!isNetAvailable && distanceToRod > netActivationDistance" class="fishing-area__net-indicator-hint">
            Подтяните рыбу ближе (менее {{ netActivationDistance }}%)
          </div>
          <div v-else-if="!isNetAvailable && currentFish" class="fishing-area__net-indicator-hint fishing-area__net-indicator-hint--warning">
            ❌ Рыба слишком тяжелая для этого сачка!
          </div>
        </div>
      </div>

      <div class="fishing-area__fish-info">
        <div class="fishing-area__fish-name">
          {{ currentFish?.name }} ({{ currentFish?.caughtSize?.name || 'Мелкий' }})
          <span v-if="currentFish?.weight" class="fishing-area__fish-weight">
            • {{ currentFish.weight }}г ({{ (currentFish.weight / 1000).toFixed(1) }}кг)
          </span>
        </div>
        <div class="fishing-area__fish-stats">
          <div class="fishing-area__stat-item">
            <span class="fishing-area__stat-icon">💪</span>
            <span class="fishing-area__stat-text">{{ Math.round(fishMovement?.stamina || 0) }}%</span>
          </div>
          <div class="fishing-area__stat-item">
            <span class="fishing-area__stat-icon">⚡</span>
            <span class="fishing-area__stat-text">{{ fishStruggleCount }}</span>
          </div>
          <div class="fishing-area__stat-item">
            <span class="fishing-area__stat-icon">🎣</span>
            <span class="fishing-area__stat-text">{{ currentFish?.actualStrength || currentFish?.strength || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="fishing-area__progress">
        <div class="fishing-area__progress-label">Прогресс</div>
        <div class="fishing-area__progress-bar">
          <div
            class="fishing-area__progress-fill"
            :style="{ width: fishingProgress + '%' }"
          ></div>
        </div>
        <div class="fishing-area__progress-value">{{ Math.round(fishingProgress) }}%</div>
      </div>

      <div class="fishing-area__tension">
        <div class="fishing-area__tension-label">Натяжение</div>
        <div class="fishing-area__tension-meter">
          <div
            class="fishing-area__tension-fill"
            :style="{ width: tension + '%' }"
            :class="tensionClass"
          ></div>
        </div>
        <div class="fishing-area__tension-value">{{ Math.round(tension) }}%</div>
        <div class="fishing-area__tension-hint">{{ tensionHint }}</div>
      </div>

      <div class="fishing-area__hints">
        <div v-if="!isReeling && fishMovement?.stamina < 50" class="fishing-area__hint fishing-area__hint--good">
          🎯 Рыба устала - самое время тянуть!
        </div>
        <div v-if="fishMovement?.isStruggling" class="fishing-area__hint fishing-area__hint--warning">
          ⚡ Рыба борется! Ослабьте натяжение
        </div>
        <div v-if="tension > 70" class="fishing-area__hint fishing-area__hint--danger">
          ⚠️ Опасно! Высокое натяжение
        </div>
        <div v-if="isReeling && !fishMovement?.isStruggling" class="fishing-area__hint fishing-area__hint--success">
          ✅ Вы тянете рыбу к берегу!
        </div>
        <div v-if="fishingProgress > 80" class="fishing-area__hint fishing-area__hint--good">
          🎉 Почти у берега!
        </div>
        <div v-if="isInGroundbaitSpot" class="fishing-area__hint fishing-area__hint--groundbait">
          🎯 Прикормка активна! Бонус к шансу поклевки
        </div>
        <div v-if="isNetAvailable && !isNetUsed" class="fishing-area__hint fishing-area__hint--net">
          🎯 Можно использовать сачок! Нажмите N или кнопку
        </div>
        <div v-if="isNetEquipped && !isNetAvailable && !isNetUsed && distanceToRod > netActivationDistance" class="fishing-area__hint fishing-area__hint--info">
          🎯 Подтяните рыбу ближе для использования сачка (менее {{ netActivationDistance }}%)
        </div>
      </div>
    </div>

    <div v-if="isCastingMode" class="fishing-area__casting">
      <div class="fishing-area__casting-text">Кликните по воде для заброса</div>
      <button class="fishing-area__casting-cancel" @click="cancelCastingMode">
        Отменить
      </button>
    </div>

    <div v-if="fishingState === 'waiting'" class="fishing-area__waiting">
      <div class="fishing-area__waiting-animation">⏳</div>
      <div class="fishing-area__waiting-text">Ждем поклевки...</div>
    </div>

    <div v-if="!hasBait && fishingState === 'idle'" class="fishing-area__no-bait">
      ⚠️ Нет наживки! Купите в магазине
    </div>

    <div v-if="netBrokenMessage" class="fishing-area__net-broken">
      <div class="fishing-area__net-broken-icon">💥</div>
      <div class="fishing-area__net-broken-text">{{ netBrokenMessage }}</div>
    </div>

    <div v-if="showResult" class="fishing-area__result">
      <div class="fishing-area__result-modal" :class="resultClass">
        <div class="fishing-area__result-content">
          <div class="fishing-area__result-icon">{{ resultIcon }}</div>
          <h3 class="fishing-area__result-title">{{ resultTitle }}</h3>
          <p class="fishing-area__result-message">{{ fishingResult?.message }}</p>

          <div v-if="fishingResult?.type === 'success' && currentFish" class="fishing-area__result-fish">
          <div class="fishing-area__result-row">
            <div class="fishing-area__result-item">
              <span class="fishing-area__result-label">Рыба:</span>
              <span class="fishing-area__result-value">{{ currentFish.emoji }} {{ currentFish.name }}</span>
            </div>
            <div class="fishing-area__result-item">
              <span class="fishing-area__result-label">Размер:</span>
              <span class="fishing-area__result-value">{{ currentFish.caughtSize?.name }}</span>
            </div>
          </div>
          <div class="fishing-area__result-row">
            <div class="fishing-area__result-item">
              <span class="fishing-area__result-label">Вес:</span>
              <span class="fishing-area__result-value">{{ currentFish.weight }}г</span>
            </div>
            <div class="fishing-area__result-item">
              <span class="fishing-area__result-label">Время:</span>
              <span class="fishing-area__result-value">{{ fishingResult.duration || 0 }}с</span>
            </div>
          </div>
        </div>

          <button class="fishing-area__result-button" @click="closeResult">
            {{ fishingResult?.type === 'rod_break' ? 'Продолжить' : 'Отлично!' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showGroundbaitPanel" class="fishing-area__groundbait-panel" @click="toggleGroundbaitPanel">
      <div class="fishing-area__groundbait-panel-content" @click.stop>
        <GroundbaitControl
          :location-id="location?.id"
          @close="toggleGroundbaitPanel"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import GroundbaitControl from './GroundbaitControl.vue'
import type { GroundbaitSpot } from '@/types'

const props = defineProps<{
  location: any
}>()

const emit = defineEmits<{
  'catch-fish': [fish: any]
}>()

const store = useStore()
const router = useRouter()
const showGroundbaitPanel = ref(false)

const fishingState = computed(() => store.getters['game/fishingState'])
const isReeling = computed(() => store.getters['game/isReeling'])
const tension = computed(() => store.getters['game/tension'])
const currentFish = computed(() => store.getters['game/currentFish'])
const showResult = computed(() => store.getters['game/showResult'])
const fishingResult = computed(() => store.getters['game/fishingResult'])
const tensionClass = computed(() => store.getters['game/tensionClass'])
const tensionHint = computed(() => store.getters['game/tensionHint'])
const fishMovement = computed(() => store.getters['game/fishMovement'])
const fishPosition = computed(() => store.getters['game/fishPosition'])
const distanceToRod = computed(() => store.getters['game/distanceToRod'])
const fishStruggleCount = computed(() => store.getters['game/fishStruggleCount'])
const floatPosition = computed(() => store.getters['game/floatPosition'])
const isCastingMode = computed(() => store.getters['game/isCastingMode'])
const shouldShowFloat = computed(() => store.getters['game/shouldShowFloat'])
const shouldShowFish = computed(() => store.getters['game/shouldShowFish'])
const fishingProgress = computed(() => store.getters['game/fishingProgress'])
const groundbaitEffectActive = computed(() => store.getters['game/groundbaitEffectActive'])
const groundbaitEffectMessage = computed(() => store.getters['game/groundbaitEffectMessage'])
const isNetAvailable = computed(() => {
  return isNetEquipped.value &&
         !isNetUsed.value &&
         fishingState.value === 'fighting' &&
         distanceToRod.value <= netActivationDistance.value
})

const isNetUsed = computed(() => store.getters['game/isNetUsed'])
const netActivationDistance = computed(() => store.getters['game/netActivationDistance'] || 25)
const netBrokenMessage = computed(() => store.getters['game/netBrokenMessage'])

const hasBait = computed(() => store.getters['fishing/hasBait'])
const groundbaitSpots = computed(() => {
  if (!props.location) return []
  return store.getters['fishing/groundbaitSpots'](props.location.id)
})
const activeGroundbait = computed(() => store.getters['fishing/activeGroundbait'])
const equippedNet = computed(() => store.getters['fishing/equippedNet'])

const isNetEquipped = computed(() => equippedNet.value !== null && equippedNet.value.usesLeft > 0)

const netButtonTitle = computed(() => {
  if (!isNetEquipped.value) return 'Сачок не экипирован'
  if (equippedNet.value?.usesLeft <= 0) return 'Сачок сломан'
  if (isNetUsed.value) return 'Сачок уже использован'
  if (!isNetAvailable.value) {
    if (distanceToRod.value > netActivationDistance.value) {
      return `Подтяните рыбу ближе (${Math.round(distanceToRod.value)}% > ${netActivationDistance.value}%)`
    }
    return 'Сачок недоступен'
  }
  if (currentFish.value?.weight && equippedNet.value?.maxWeight) {
    const fishWeightKg = currentFish.value.weight / 1000
    if (fishWeightKg > equippedNet.value.maxWeight) {
      return `⚠️ Рыба тяжелее сачка! (${fishWeightKg.toFixed(1)}кг > ${equippedNet.value.maxWeight}кг) Сачок сломается!`
    }
  }
  return 'Использовать сачок'
})

const isInGroundbaitSpot = computed(() => {
  if (!floatPosition.value || !props.location) return false

  const groundbaitInfo = store.getters['fishing/isPositionInGroundbaitSpot']({
    locationId: props.location.id,
    position: floatPosition.value
  })

  return groundbaitInfo.isInside
})

const rodPosition = computed(() => ({ x: 50, y: 90 }))

const rodStyle = computed(() => ({
  left: `${rodPosition.value.x}%`,
  top: `${rodPosition.value.y}%`,
}))

const floatStyle = computed(() => ({
  left: `${floatPosition.value.x}%`,
  top: `${floatPosition.value.y}%`,
}))

const fishStyle = computed(() => {
  const direction = fishMovement.value?.direction || 0
  return {
    left: `${fishPosition.value.x}%`,
    top: `${fishPosition.value.y}%`,
    transform: `translate(-50%, -50%) rotate(${direction}deg)`,
    opacity: fishMovement.value?.isStruggling ? 0.8 : 1
  }
})

const currentLineStyle = computed(() => {
  const targetPosition = fishingState.value === 'fighting' ? fishPosition.value : floatPosition.value

  if (!targetPosition || !rodPosition.value) return {}

  const dx = targetPosition.x - rodPosition.value.x
  const dy = targetPosition.y - rodPosition.value.y
  const length = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx) * 180 / Math.PI

  return {
    left: `${rodPosition.value.x}%`,
    top: `${rodPosition.value.y}%`,
    width: `${length}%`,
    transform: `rotate(${angle}deg)`,
    transformOrigin: '0 0'
  }
})

const resultClass = computed(() => {
  switch (fishingResult.value?.type) {
    case 'success': return 'fishing-area__result-modal--success'
    case 'failed': return 'fishing-area__result-modal--failed'
    case 'rod_break': return 'fishing-area__result-modal--rod-break'
    default: return ''
  }
})

const resultIcon = computed(() => {
  switch (fishingResult.value?.type) {
    case 'success': return '🎉'
    case 'failed': return '❌'
    case 'rod_break': return '💥'
    default: return '🎣'
  }
})

const resultTitle = computed(() => {
  switch (fishingResult.value?.type) {
    case 'success': return 'Успех!'
    case 'failed': return 'Рыба ушла!'
    case 'rod_break': return 'Удочка сломалась!'
    default: return ''
  }
})

const goBack = () => {
  router.push('/')
}

const startCastingMode = () => {
  if (!hasBait.value) return
  store.dispatch('game/startCastingMode')
}

const cancelCastingMode = () => {
  store.dispatch('game/cancelCastingMode')
}

const handleWaterClick = (event: MouseEvent) => {
  const waterArea = event.currentTarget as HTMLElement
  const rect = waterArea.getBoundingClientRect()

  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100

  const activeGroundbaitValue = activeGroundbait.value

  if (activeGroundbaitValue && fishingState.value === 'idle') {
    store.dispatch('fishing/useGroundbait', {
      locationId: props.location?.id,
      groundbaitId: activeGroundbaitValue.id,
      position: { x, y }
    }).then((result: any) => {
      if (result.success) {
        store.dispatch('fishing/setActiveGroundbait', null)
      }
    })
  } else if (isCastingMode.value && fishingState.value === 'idle') {
    store.dispatch('fishing/setCurrentLocation', props.location)
      .then(() => {
        return store.dispatch('game/castToPosition', { x, y })
      })
  }
}

const startReeling = () => {
  store.dispatch('game/startReeling')
}

const stopReeling = () => {
  store.dispatch('game/stopReeling')
}

const useNet = async () => {
  if (!isNetAvailable.value || isNetUsed.value || fishingState.value !== 'fighting') {
    return
  }

  store.dispatch('game/useNet')
}

const closeResult = () => {
  if (fishingResult.value?.type === 'success' && currentFish.value) {
    const fishWithLocation = {
      ...currentFish.value,
      location: props.location?.name || 'Неизвестно',
      timestamp: new Date().toISOString(),
      strength: currentFish.value.strength,
      stamina: fishMovement.value?.stamina || 0,
      duration: store.getters['game/fishingDuration'],
      struggles: fishStruggleCount.value
    }

    store.dispatch('fishing/addCaughtFish', fishWithLocation)
      .then(() => {
        emit('catch-fish', fishWithLocation)
        store.dispatch('game/setShowResult', false)

        setTimeout(() => {
          store.dispatch('game/resetGame')
        }, 1000)
      })
  } else {
    store.dispatch('game/setShowResult', false)
    setTimeout(() => {
      store.dispatch('game/resetGame')
    }, 1000)
  }
}

const getGroundbaitSpotStyle = (spot: GroundbaitSpot) => {
  const level = spot.level || 1
  const pulseSize = 100 + (level - 1) * 5

  return {
    left: `${spot.position.x}%`,
    top: `${spot.position.y}%`,
    width: `${spot.radius * 2}%`,
    height: `${spot.radius * 2}%`,
    borderColor: spot.groundbaitType.color,
    backgroundColor: `${spot.groundbaitType.color}15`
  }
}

const getGroundbaitSpotTooltip = (spot: GroundbaitSpot) => {
  const fishes = spot.fishAttraction.map(att =>
    `${att.fishName} (x${att.attractionMultiplier.toFixed(1)})`
  ).join('\n')

  return `${spot.groundbaitType.name}\n` +
         `Уровень: ${spot.level}\n` +
         `Радиус: ${Math.round(spot.radius)}%\n` +
         `Использований: ${spot.currentUses}/${spot.groundbaitType.uses}\n` +
         `Привлекает:\n${fishes}`
}

const toggleGroundbaitPanel = () => {
  showGroundbaitPanel.value = !showGroundbaitPanel.value
}

const handleKeyPress = (event: KeyboardEvent) => {
  if ((event.key === 'n' || event.key === 'N' || event.key === ' ') &&
      isNetAvailable.value &&
      !isNetUsed.value &&
      fishingState.value === 'fighting') {
    event.preventDefault()
    useNet()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
  store.dispatch('game/stopGameLoop')
  store.dispatch('game/resetGame')
})

watch(fishingResult, () => {
})
</script>

<style scoped lang="less">
.fishing-area {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #87CEEB 0%, #4682B4 100%);
  position: relative;

  &__header {
    background: rgba(255, 255, 255, 0.95);
    padding: 15px 20px;
    display: flex;
    align-items: center;
    gap: 20px;
    border-bottom: 2px solid #4CAF50;
    z-index: 10;
  }

  &__back-button {
    background: #6c757d;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;

    &:hover {
      background: #5a6268;
    }
  }

  &__location-name {
    margin: 0;
    color: #333;
    font-size: 1.5em;
  }

  &__water {
    flex: 1;
    position: relative;
    background-size: cover;
    background-position: center;
    cursor: pointer;
    overflow: hidden;
  }

  &__rod {
    position: absolute;
    transform: translate(-50%, -50%);
    font-size: 36px;
    z-index: 10;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6));
    animation: rodFloat 2s infinite alternate;
  }

  &__float {
    position: absolute;
    transform: translate(-50%, -50%);
    font-size: 24px;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
    z-index: 8;
    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);

    &--biting {
      animation: biteFloat 0.5s infinite alternate;
    }
  }

  &__fish {
    position: absolute;
    transform: translate(-50%, -50%);
    font-size: 32px;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6));
    z-index: 6;
    transition: left 0.3s ease, top 0.3s ease;

    &--struggling {
      animation: fishStruggle 0.3s infinite alternate;
    }

    &--tired {
      opacity: 0.7;
      filter: grayscale(0.5);
    }
  }

  &__line {
    position: absolute;
    height: 2px;
    background: linear-gradient(90deg,
      rgba(255, 255, 255, 0.9) 0%,
      rgba(255, 255, 255, 0.6) 50%,
      rgba(255, 255, 255, 0.3) 100%);
    transform-origin: 0 0;
    z-index: 5;
  }

  &__groundbait-spot {
    position: absolute;
    transform: translate(-50%, -50%);
    border: 3px dashed;
    border-radius: 50%;
    opacity: 0.6;
    z-index: 1;
    pointer-events: none;
    animation: groundbaitPulse 3s infinite ease-in-out;

    &:hover {
      opacity: 0.8;
      z-index: 6;
    }
  }

  &__groundbait-pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.1;
    animation: groundbaitInnerPulse 2s infinite;
  }

  &__groundbait-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  &__groundbait-level {
    background: rgba(0,0,0,0.7);
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.7em;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
    white-space: nowrap;
  }

  &__groundbait-emoji {
    font-size: 1.5em;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
  }

  &__groundbait-info {
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    font-size: 0.7em;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
    background: rgba(0,0,0,0.5);
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
  }

  &__groundbait-uses {
    font-weight: bold;
  }

  &__shore {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40px;
    background: linear-gradient(0deg,
      #8B4513 0%,
      #A0522D 100%);
    z-index: 2;
  }

  &__groundbait-effect {
    position: absolute;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, rgba(139, 195, 74, 0.9), rgba(104, 159, 56, 0.9));
    color: white;
    padding: 12px 20px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideInDown 0.5s ease, pulseEffect 2s infinite;
    border: 2px solid rgba(255,255,255,0.3);
    max-width: 90%;
    text-align: center;
  }

  &__groundbait-effect-icon {
    font-size: 1.5em;
    animation: bounce 1s infinite;
  }

  &__groundbait-effect-text {
    font-weight: bold;
    font-size: 0.9em;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  }

  &__controls {
    position: absolute;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 50;
  }

  &__cast-control,
  &__reel-control,
  &__net-control {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  &__cast-button,
  &__reel-button,
  &__net-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    font-size: 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);

    &:hover:not(:disabled) {
      transform: scale(1.05);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      animation: none;
    }
  }

  &__cast-label,
  &__reel-label,
  &__net-label {
    color: white;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
    font-size: 0.9em;
    text-align: center;
  }

  &__cast-button {
    border: 3px solid #4CAF50;
    background: white;
  }

  &__reel-button {
    border: 3px solid #2196F3;
    background: white;

    &--active {
      background: #2196F3;
      color: white;
      animation: reelPulse 0.5s infinite;
    }
  }

  &__net-button {
    border: 3px solid #9C27B0;
    background: white;

    &:hover:not(:disabled) {
      background: #F3E5F5;
      transform: scale(1.05);
    }

    &--active {
      animation: netPulseActive 1s infinite;
      background: #F3E5F5;
    }

    &:disabled {
      animation: none;
      background: #e0e0e0;
      border-color: #9e9e9e;
    }
  }

  &__groundbait {
    position: relative;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: white;
    border: 2px solid #8BC34A;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.1);
    }
  }

  &__groundbait-active {
    position: absolute;
    top: -5px;
    right: -5px;
    width: 15px;
    height: 15px;
    background: #FF5722;
    border-radius: 50%;
    border: 2px solid white;
    animation: pulseActive 1s infinite;
  }

  &__indicators {
    position: absolute;
    bottom: 20px;
    left: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 280px;
    z-index: 50;
  }

  &__net-indicator {
    background: rgba(156, 39, 176, 0.9);
    padding: 12px;
    border-radius: 8px;
    color: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }

  &__net-indicator-label {
    font-weight: bold;
    margin-bottom: 8px;
    font-size: 1em;
    text-align: center;
  }

  &__net-indicator-info {
    font-size: 0.85em;
  }

  &__net-indicator-uses,
  &__net-indicator-weight {
    margin-bottom: 4px;
  }

  &__net-indicator-hint {
    background: rgba(255, 255, 255, 0.2);
    padding: 6px;
    border-radius: 4px;
    margin-top: 6px;
    font-weight: bold;
    font-size: 0.8em;
    text-align: center;

    &--active {
      animation: pulseHint 1.5s infinite;
      background: rgba(255, 255, 255, 0.3);
      color: #FFEB3B;
    }

    &--used {
      background: rgba(76, 175, 80, 0.3);
      color: #C8E6C9;
    }

    &--warning {
      background: rgba(244, 67, 54, 0.3);
      color: #FFCDD2;
    }
  }

  &__fish-info {
    background: rgba(255, 255, 255, 0.9);
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  &__fish-name {
    font-weight: bold;
    color: #333;
    margin-bottom: 6px;
    text-align: center;
    font-size: 0.95em;
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
  }

  &__fish-weight {
    color: #666;
    font-size: 0.85em;
    font-weight: normal;
  }

  &__fish-stats {
    display: flex;
    justify-content: space-around;
    gap: 8px;
  }

  &__stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  &__stat-icon {
    font-size: 1em;
  }

  &__stat-text {
    font-size: 0.8em;
    font-weight: bold;
    color: #333;
  }

  &__progress,
  &__tension {
    background: rgba(255, 255, 255, 0.9);
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  &__progress-label,
  &__tension-label {
    color: #666;
    font-size: 0.85em;
    margin-bottom: 6px;
    font-weight: 500;
  }

  &__progress-bar,
  &__tension-meter {
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
    margin: 4px 0;
  }

  &__progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4CAF50, #66BB6A);
    transition: width 0.3s ease;
  }

  &__tension-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.2s ease;

    &.safe {
      background: linear-gradient(90deg, #4CAF50, #66BB6A);
    }

    &.warning {
      background: linear-gradient(90deg, #FF9800, #FFB74D);
    }

    &.danger {
      background: linear-gradient(90deg, #f44336, #EF5350);
      animation: dangerPulse 0.5s infinite;
    }
  }

  &__progress-value,
  &__tension-value {
    font-weight: bold;
    color: #333;
    font-size: 1em;
    text-align: center;
    margin-top: 4px;
  }

  &__tension-hint {
    color: #666;
    font-size: 0.75em;
    text-align: center;
    margin-top: 4px;
  }

  &__hints {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__hint {
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.85em;
    font-weight: 500;
    text-align: center;

    &--good {
      background: #E8F5E8;
      color: #2E7D32;
      border-left: 4px solid #4CAF50;
    }

    &--warning {
      background: #FFF3E0;
      color: #EF6C00;
      border-left: 4px solid #FF9800;
    }

    &--danger {
      background: #FFEBEE;
      color: #C62828;
      border-left: 4px solid #f44336;
    }

    &--success {
      background: #E3F2FD;
      color: #1565C0;
      border-left: 4px solid #2196F3;
    }

    &--groundbait {
      background: linear-gradient(135deg, #FFF3E0, #FFECB3);
      color: #E65100;
      border-left: 4px solid #FF9800;
      animation: pulseHint 1.5s infinite;
    }

    &--net {
      background: linear-gradient(135deg, #F3E5F5, #E1BEE7);
      color: #7B1FA2;
      border-left: 4px solid #9C27B0;
      animation: netHintPulse 1s infinite;
    }

    &--info {
      background: #E3F2FD;
      color: #1565C0;
      border-left: 4px solid #2196F3;
    }
  }

  &__casting {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.95);
    padding: 16px 24px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    z-index: 40;
    border: 2px solid #FF9800;
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }

  &__casting-text {
    color: #E65100;
    font-weight: bold;
    font-size: 1.1em;
  }

  &__casting-cancel {
    background: #ff6b6b;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;

    &:hover {
      background: #ff5252;
    }
  }

  &__waiting {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 40;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  &__waiting-animation {
    font-size: 48px;
    animation: pulse 1.5s infinite;
  }

  &__waiting-text {
    color: white;
    font-weight: bold;
    text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
    font-size: 1.1em;
  }

  &__no-bait {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.95);
    padding: 12px 20px;
    border-radius: 8px;
    color: #f44336;
    font-weight: bold;
    text-align: center;
    z-index: 40;
    border: 2px solid #f44336;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }

  &__net-broken {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, rgba(255, 152, 0, 0.95), rgba(239, 108, 0, 0.95));
    color: white;
    padding: 20px 30px;
    border-radius: 15px;
    font-weight: bold;
    text-align: center;
    z-index: 200;
    animation: fadeInOut 3s ease forwards;
    box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    gap: 15px;
    min-width: 300px;
    border: 3px solid #FF9800;
    backdrop-filter: blur(5px);
  }

  &__net-broken-icon {
    font-size: 2em;
    animation: bounce 0.5s infinite alternate;
  }

  &__net-broken-text {
    flex: 1;
    font-size: 1.1em;
  }

  &__result {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
  }

  &__result-modal {
    background: white;
    border-radius: 15px;
    padding: 30px;
    max-width: 400px;
    width: 90%;
    text-align: center;
    animation: popIn 0.5s ease;

    &--success {
      border: 4px solid #4CAF50;
      background: linear-gradient(135deg, #E8F5E8, #C8E6C9);
    }

    &--failed {
      border: 4px solid #f44336;
      background: linear-gradient(135deg, #FFEBEE, #FFCDD2);
    }

    &--rod-break {
      border: 4px solid #FF9800;
      background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
    }
  }

  &__result-content {
    .fishing-area__result-icon {
      font-size: 3em;
      margin-bottom: 15px;
    }

    .fishing-area__result-title {
      color: #333;
      margin: 0 0 10px 0;
      font-size: 1.5em;
    }

    .fishing-area__result-message {
      color: #666;
      margin: 0 0 20px 0;
      line-height: 1.4;
      font-size: 1.1em;
    }
  }

  &__result-fish {
    background: rgba(255, 255, 255, 0.7);
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  &__result-row {
    display: flex;
    gap: 15px;
    margin-bottom: 10px;

    &:last-child {
      margin-bottom: 0;
    }

    @media (max-width: 480px) {
      flex-direction: column;
      gap: 5px;
    }
  }

  &__result-item {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 0;
  }

  &__result-label {
    color: #666;
    font-weight: 500;
  }

  &__result-value {
    font-weight: bold;
    color: #333;
  }

  &__result-button {
    background: #4CAF50;
    color: white;
    border: none;
    padding: 12px 30px;
    border-radius: 25px;
    font-size: 1em;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease;
    width: 100%;

    &:hover {
      background: #45a049;
    }
  }

  &__groundbait-panel {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }

  &__groundbait-panel-content {
    background: white;
    border-radius: 12px;
    padding: 20px;
    max-width: 90%;
    max-height: 90%;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  }
}

@keyframes rodFloat {
  0% { transform: translate(-50%, -50%) rotate(-2deg); }
  100% { transform: translate(-50%, -50%) rotate(2deg); }
}

@keyframes biteFloat {
  0% { transform: translate(-50%, -50%) scale(1); }
  100% { transform: translate(-50%, -60%) scale(1.1); }
}

@keyframes fishStruggle {
  0% { transform: translate(-50%, -50%) rotate(-15deg); }
  100% { transform: translate(-50%, -50%) rotate(15deg); }
}

@keyframes groundbaitPulse {
  0%, 100% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.7;
    transform: translate(-50%, -50%) scale(1.02);
  }
}

@keyframes groundbaitInnerPulse {
  0%, 100% { opacity: 0.05; }
  50% { opacity: 0.15; }
}

@keyframes pulseEffect {
  0%, 100% { transform: translateX(-50%) scale(1); }
  50% { transform: translateX(-50%) scale(1.02); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes reelPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes netPulseActive {
  0%, 100% {
    transform: scale(1);
    border-color: #9C27B0;
    box-shadow: 0 4px 12px rgba(156, 39, 176, 0.5);
  }
  50% {
    transform: scale(1.05);
    border-color: #BA68C8;
    box-shadow: 0 4px 16px rgba(186, 104, 200, 0.7);
  }
}

@keyframes pulseActive {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@keyframes pulseHint {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes netHintPulse {
  0%, 100% {
    background: linear-gradient(135deg, #F3E5F5, #E1BEE7);
    border-left: 4px solid #9C27B0;
  }
  50% {
    background: linear-gradient(135deg, #E1BEE7, #CE93D8);
    border-left: 4px solid #7B1FA2;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
  10% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  90% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes popIn {
  0% { transform: scale(0.5); opacity: 0; }
  70% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes dangerPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@media (max-width: 768px) {
  .fishing-area__controls {
    bottom: 10px;
    right: 10px;
  }

  .fishing-area__indicators {
    bottom: 10px;
    left: 10px;
    width: 250px;
  }

  .fishing-area__cast-button,
  .fishing-area__reel-button,
  .fishing-area__net-button {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }

  .fishing-area__groundbait {
    width: 45px;
    height: 45px;
    font-size: 20px;
  }

  .fishing-area__groundbait-effect {
    top: 60px;
    padding: 10px 15px;
    font-size: 0.9em;
  }

  .fishing-area__net-broken {
    min-width: 250px;
    padding: 15px 20px;
  }
}

@media (max-width: 480px) {
  .fishing-area__indicators {
    width: 220px;
  }

  .fishing-area__result-modal {
    padding: 20px;
  }

  .fishing-area__result-row {
    flex-direction: column;
    gap: 5px;
  }
}
</style>