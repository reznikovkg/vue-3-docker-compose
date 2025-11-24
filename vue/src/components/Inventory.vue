<template>
  <div class="inventory">
    <h2>🎒 Улов ({{ caughtFish.length }})</h2>
    <div class="fish-list">
      <div
        v-for="(fish, index) in caughtFish"
        :key="index"
        class="fish-item"
      >
        <span class="fish-emoji">{{ fish.emoji }}</span>
        <span class="fish-name">{{ fish.name }}</span>

        <span class="fish-size-badge" v-if="fish.caughtSize" :class="getSizeClass(fish.caughtSize.name)">
          {{ fish.caughtSize.name }}
          <span v-if="fish.weight">({{ fish.weight }}г)</span>
        </span>

        <span class="fish-location">{{ fish.location }}</span>
        <span class="fish-timestamp">{{ fish.timestamp }}</span>
      </div>
      <div v-if="caughtFish.length === 0" class="empty-inventory">
        🎣 Рыбы пока нет!<br>
        <small>Выберите локацию и начните рыбалку</small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CaughtFish } from '../types'

defineProps<{
  caughtFish: CaughtFish[]
}>()

const getSizeClass = (sizeName: string) => {
  const sizeClasses = {
    'Мелкий': 'size-small',
    'Средний': 'size-medium',
    'Крупный': 'size-large',
    'Трофейный': 'size-trophy'
  }
  return sizeClasses[sizeName] || 'size-small'
}
</script>

<style scoped lang="less">
@bg-color: #f8f9fa;
@border-color: #dee2e6;
@text-color: #333;
@muted-color: #6c757d;

.inventory {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ddd;
  height: fit-content;
  max-height: 80vh;
  overflow-y: auto;

  h2 {
    color: @text-color;
    margin-bottom: 15px;
    text-align: center;
  }
}

.fish-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fish-item {
  background: @bg-color;
  padding: 10px 15px;
  border-radius: 6px;
  border: 1px solid @border-color;
  display: flex;
  align-items: center;
  gap: 10px;
}

.fish-emoji {
  font-size: 1.2em;
}

.fish-name {
  font-weight: bold;
  color: @text-color;
  flex: 1;
}

.fish-size-badge {
  font-size: 0.7em;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: bold;
  white-space: nowrap;

  &.size-small {
    background: #E8F5E8;
    color: #2E7D32;
    border: 1px solid #4CAF50;
  }

  &.size-medium {
    background: #E3F2FD;
    color: #1565C0;
    border: 1px solid #2196F3;
  }

  &.size-large {
    background: #FFF3E0;
    color: #EF6C00;
    border: 1px solid #FF9800;
  }

  &.size-trophy {
    background: linear-gradient(135deg, #FFD700, #FFA000);
    color: #7B1FA2;
    border: 1px solid #FFD700;
    animation: glow 2s infinite alternate;
  }
}

.fish-location {
  font-size: 0.8em;
  color: @muted-color;
  background: #e9ecef;
  padding: 2px 8px;
  border-radius: 10px;
}

.fish-timestamp {
  font-size: 0.7em;
  color: #888;
}

.empty-inventory {
  text-align: center;
  color: @muted-color;
  font-style: italic;
  padding: 20px;

  small {
    display: block;
    margin-top: 8px;
    font-size: 0.9em;
    opacity: 0.7;
  }
}

@keyframes glow {
  0% { box-shadow: 0 0 5px #FFD700; }
  100% { box-shadow: 0 0 15px #FFA000; }
}

@media (max-width: 768px) {
  .fish-item {
    flex-wrap: wrap;

    .fish-size-badge {
      order: 3;
      width: 100%;
      text-align: center;
      margin-top: 5px;
    }
  }
}
</style>