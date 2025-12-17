<template>
  <div class="inventory">
    <h2 class="inventory__title">📊 Статистика улова</h2>

    <div class="inventory__stats">
      <div class="inventory__stat">
        <span class="inventory__stat-label">Всего поймано:</span>
        <span class="inventory__stat-value">{{ totalFishCaught }}</span>
      </div>
    </div>

    <div class="inventory__list">
      <div
        v-for="fish in caughtFish"
        :key="fish.timestamp"
        class="inventory__item"
        :class="getSizeClass(fish)"
      >
        <div class="inventory__item-emoji">{{ getFishEmoji(fish) }}</div>
        <div class="inventory__item-info">
          <div class="inventory__item-name">{{ fish.name }}</div>
          <div class="inventory__item-details">
            {{ fish.location }} • {{ formatDate(fish.timestamp) }}
          </div>
          <div class="inventory__item-size" v-if="fish.caughtSize">
            Размер: {{ fish.caughtSize.name }}
          </div>
          <div class="inventory__item-weight" v-if="fish.weight">
            Вес: {{ fish.weight }}г
          </div>
        </div>
      </div>
    </div>

    <div v-if="caughtFish.length === 0" class="inventory__empty">
      🎣 Вы еще не поймали ни одной рыбы
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CaughtFish } from '@/types'

interface Props {
  caughtFish: CaughtFish[]
}

const props = defineProps<Props>()

const totalFishCaught = computed(() => props.caughtFish.length)

const getFishEmoji = (fish: CaughtFish) => {
  return fish.caughtSize?.emojiModifier
    ? fish.emoji + fish.caughtSize.emojiModifier
    : fish.emoji
}

const getSizeClass = (fish: CaughtFish) => {
  if (!fish.caughtSize) return ''

  const sizeName = fish.caughtSize.name.toLowerCase()
  return `inventory__item--${sizeName}`
}

const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleDateString('ru-RU')
}
</script>

<style scoped lang="less">
.inventory {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);

  &__title {
    color: #333;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #4CAF50;
  }

  &__stats {
    margin-bottom: 20px;
  }

  &__stat {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 6px;
  }

  &__stat-label {
    color: #666;
  }

  &__stat-value {
    font-weight: bold;
    color: #2E7D32;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 400px;
    overflow-y: auto;
  }

  &__empty {
    text-align: center;
    color: #666;
    font-style: italic;
    padding: 40px 20px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      background: #f8f9fa;
      transform: translateX(5px);
    }

    &--small {
      border-left: 4px solid #4CAF50;
    }

    &--medium {
      border-left: 4px solid #2196F3;
    }

    &--large {
      border-left: 4px solid #FF9800;
    }

    &--trophy {
      border-left: 4px solid #9C27B0;
      background: linear-gradient(135deg, #f8f9fa, #e8f5e8);
    }
  }

  &__item-emoji {
    font-size: 2em;
  }

  &__item-info {
    flex: 1;
  }

  &__item-name {
    font-weight: bold;
    color: #333;
    margin-bottom: 5px;
  }

  &__item-details {
    color: #666;
    font-size: 0.9em;
    margin-bottom: 5px;
  }

  &__item-size {
    color: #1976D2;
    font-weight: bold;
    font-size: 0.9em;
  }

  &__item-weight {
    color: #2E7D32;
    font-weight: bold;
    font-size: 0.9em;
  }
}

@media (max-width: 768px) {
  .inventory__list {
    max-height: 300px;
  }

  .inventory__item {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }

  .inventory__item-info {
    width: 100%;
  }
}
</style>