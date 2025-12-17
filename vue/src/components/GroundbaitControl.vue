<template>
  <div class="groundbait-control">
    <div class="groundbait-control__panel">
      <div class="groundbait-control__header">
        <h3 class="groundbait-control__title">🍚 Прикормки</h3>
        <button class="groundbait-control__close" @click="$emit('close')" title="Закрыть">✕</button>
      </div>

      <div v-if="hasGroundbaits" class="groundbait-control__list">
        <div
          v-for="groundbait in availableGroundbaitsWithQuantity"
          :key="groundbait.id"
          class="groundbait-control__item"
          :class="{
            'groundbait-control__item--selected': activeGroundbait?.id === groundbait.id,
            'groundbait-control__item--empty': groundbait.quantity === 0
          }"
          @click="selectGroundbait(groundbait)"
          :title="getGroundbaitTooltip(groundbait)"
        >
          <div class="groundbait-control__item-content">
            <div class="groundbait-control__item-emoji">{{ groundbait.emoji }}</div>
            <div class="groundbait-control__item-info">
              <div class="groundbait-control__item-name">{{ groundbait.name }}</div>
              <div class="groundbait-control__item-quantity">
                {{ groundbait.quantity }} шт.
              </div>
            </div>
            <div
              v-if="activeGroundbait?.id === groundbait.id"
              class="groundbait-control__item-active"
            >
              ✓
            </div>
          </div>
        </div>
      </div>

      <div v-else class="groundbait-control__empty">
        Нет прикормок в инвентаре
      </div>

      <div v-if="activeGroundbait" class="groundbait-control__active">
        <div class="groundbait-control__active-title">Активная прикормка:</div>
        <div class="groundbait-control__active-content">
          <span class="groundbait-control__active-emoji">{{ activeGroundbait.emoji }}</span>
          <span class="groundbait-control__active-name">{{ activeGroundbait.name }}</span>
          <button
            class="groundbait-control__active-cancel"
            @click="clearActiveGroundbait"
            title="Отменить выбор"
          >
            ✕
          </button>
        </div>
        <div class="groundbait-control__active-hint">
          Кликните по воде для заброса
        </div>
      </div>

      <div v-if="groundbaitSpots.length > 0" class="groundbait-control__spots">
        <div class="groundbait-control__spots-title">Активные прикормки на локации:</div>
        <div class="groundbait-control__spots-list">
          <div
            v-for="spot in groundbaitSpots"
            :key="spot.id"
            class="groundbait-control__spot"
            :title="getGroundbaitSpotTooltip(spot)"
          >
            <div class="groundbait-control__spot-emoji">{{ spot.groundbaitType.emoji }}</div>
            <div class="groundbait-control__spot-info">
              <div class="groundbait-control__spot-name">{{ spot.groundbaitType.name }}</div>
              <div class="groundbait-control__spot-stats">
                <span class="groundbait-control__spot-level">Ур. {{ spot.level }}</span>
                <span class="groundbait-control__spot-uses">Использований: {{ spot.currentUses }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import type { GroundbaitType, GroundbaitSpot } from '@/types'

const store = useStore()
const props = defineProps<{
  locationId: number
}>()

defineEmits(['close'])

const availableGroundbaits = computed(() => store.getters['fishing/availableGroundbaits'] || [])
const groundbaitInventory = computed(() => store.getters['fishing/groundbaitInventory'] || [])
const activeGroundbait = computed(() => store.getters['fishing/activeGroundbait'])
const groundbaitSpots = computed(() => {
  if (!props.locationId) return []
  return store.getters['fishing/groundbaitSpots'](props.locationId)
})

const availableGroundbaitsWithQuantity = computed(() => {
  return availableGroundbaits.value.map((gb: GroundbaitType) => {
    const inventoryItem = groundbaitInventory.value.find((item: any) => item.id === gb.id)
    return {
      ...gb,
      quantity: inventoryItem ? inventoryItem.quantity : 0
    }
  })
})

const hasGroundbaits = computed(() => {
  return availableGroundbaitsWithQuantity.value.some((gb: any) => gb.quantity > 0)
})

const getGroundbaitTooltip = (groundbait: any): string => {
  const fishes = groundbait.fishAttraction.map((att: any) =>
    `${att.fishName} (x${att.attractionMultiplier.toFixed(1)})`
  ).join(', ')

  return `${groundbait.description}\n` +
         `Количество: ${groundbait.quantity}\n` +
         `Радиус: ${groundbait.radius}%\n` +
         `Использований: ${groundbait.uses}\n` +
         `Привлекает: ${fishes}`
}

const getGroundbaitSpotTooltip = (spot: GroundbaitSpot): string => {
  const fishes = spot.fishAttraction.map(att =>
    `${att.fishName} (x${att.attractionMultiplier.toFixed(1)})`
  ).join('\n')

  return `${spot.groundbaitType.name}\n` +
         `Уровень: ${spot.level}\n` +
         `Радиус: ${Math.round(spot.radius)}%\n` +
         `Использований: ${spot.currentUses}/${spot.groundbaitType.uses}\n` +
         `Привлекает:\n${fishes}`
}

const selectGroundbait = (groundbait: any) => {
  const quantity = groundbait.quantity

  if (quantity === 0) {
    return
  }

  if (activeGroundbait.value?.id === groundbait.id) {
    clearActiveGroundbait()
  } else {
    store.dispatch('fishing/setActiveGroundbait', groundbait)
  }
}

const clearActiveGroundbait = () => {
  store.dispatch('fishing/setActiveGroundbait', null)
}
</script>

<style scoped lang="less">
.groundbait-control {
  position: relative;
  pointer-events: auto;

  &__panel {
    background: rgba(255, 255, 255, 0.98);
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.25);
    border: 3px solid #4CAF50;
    backdrop-filter: blur(10px);
    min-width: 300px;
    max-width: 350px;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  &__title {
    margin: 0;
    color: #333;
    font-size: 1.2em;
    font-weight: bold;
  }

  &__close {
    background: #ff6b6b;
    color: white;
    border: none;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1em;
    font-weight: bold;

    &:hover {
      background: #ff5252;
    }
  }

  &__empty {
    color: #666;
    font-style: italic;
    text-align: center;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    margin: 15px 0;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 250px;
    overflow-y: auto;
    margin-bottom: 20px;
    padding-right: 5px;
  }

  &__item {
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: white;

    &:hover:not(&--empty) {
      border-color: #4CAF50;
      transform: translateX(5px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    &--selected {
      border-color: #4CAF50;
      background: #E8F5E8;
      box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.3);
    }

    &--empty {
      opacity: 0.5;
      cursor: not-allowed;
      background: #f8f9fa;

      .groundbait-control__item-quantity {
        color: #f44336;
        font-weight: bold;
      }
    }

    &-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    &-emoji {
      font-size: 1.5em;
      flex-shrink: 0;
    }

    &-info {
      flex: 1;
      min-width: 0;
    }

    &-name {
      font-weight: bold;
      color: #333;
      font-size: 1em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &-quantity {
      color: #666;
      font-size: 0.9em;
      margin-top: 4px;
    }

    &-active {
      color: #4CAF50;
      font-weight: bold;
      font-size: 1.5em;
      flex-shrink: 0;
    }
  }

  &__active {
    background: #E8F5E8;
    border: 2px solid #4CAF50;
    border-radius: 10px;
    padding: 15px;
    margin: 15px 0;
    animation: pulseBorder 2s infinite;
  }

  &__active-title {
    color: #2E7D32;
    font-weight: bold;
    font-size: 0.95em;
    margin-bottom: 8px;
  }

  &__active-content {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }

  &__active-emoji {
    font-size: 1.3em;
  }

  &__active-name {
    flex: 1;
    font-weight: bold;
    color: #333;
    font-size: 1.1em;
  }

  &__active-cancel {
    background: #ff6b6b;
    color: white;
    border: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9em;
    font-weight: bold;

    &:hover {
      background: #ff5252;
    }
  }

  &__active-hint {
    color: #666;
    font-size: 0.85em;
    text-align: center;
    font-style: italic;
  }

  &__spots {
    background: #F3E5F5;
    border: 2px solid #9C27B0;
    border-radius: 10px;
    padding: 15px;
    margin-top: 15px;
  }

  &__spots-title {
    color: #7B1FA2;
    font-weight: bold;
    font-size: 0.95em;
    margin-bottom: 10px;
  }

  &__spots-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__spot {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px;
    background: white;
    border-radius: 8px;
    border: 1px solid #E1BEE7;
  }

  &__spot-emoji {
    font-size: 1.2em;
  }

  &__spot-info {
    flex: 1;
  }

  &__spot-name {
    font-weight: bold;
    color: #333;
    font-size: 0.9em;
  }

  &__spot-stats {
    display: flex;
    gap: 10px;
    margin-top: 4px;
    font-size: 0.8em;
  }

  &__spot-level {
    color: #7B1FA2;
    font-weight: bold;
  }

  &__spot-uses {
    color: #666;
  }
}

@keyframes pulseBorder {
  0%, 100% {
    border-color: #4CAF50;
  }
  50% {
    border-color: #81C784;
  }
}

.groundbait-control__list::-webkit-scrollbar {
  width: 8px;
}

.groundbait-control__list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.groundbait-control__list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.groundbait-control__list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@media (max-width: 768px) {
  .groundbait-control__panel {
    padding: 15px;
    min-width: 250px;
  }

  .groundbait-control__list {
    max-height: 200px;
  }
}
</style>