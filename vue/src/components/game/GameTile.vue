<template>
  <div
    class="game-tile"
    :class="{
      'game-tile--selected': isSelected,
      'game-tile--empty': !tile,
      'game-tile--dragging': isDragging,
      'game-tile--frozen': tile?.frozen,
      'game-tile--buried': tile?.buried,
      'game-tile--spiked': tile?.spiked,
      'game-tile--levitating': tile?.levitating,
    }"
    :style="tileStyle"
    :draggable="!!tile && !isProcessing && !tile?.buried && !tile?.spiked"
    @click="handleClick"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop.prevent="handleDrop"
    tabindex="0"
    @keydown="handleKeydown"
  >
    <div v-if="tile" class="game-tile__inner">
      <div class="game-tile__chip"></div>
      <span v-if="tile.bonus" class="game-tile__bonus">{{ bonusLabel }}</span>
      <span v-if="tile.crystal" class="game-tile__crystal">★</span>
      <span v-if="tile.frozen" class="game-tile__frozen">{{ tile.frozen }}</span>
      <span v-if="tile.buried" class="game-tile__buried">⊡</span>
      <span v-if="tile.spiked" class="game-tile__spiked">⬡</span>
      <span v-if="tile.levitating" class="game-tile__levitating">⌃</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { BONUS_LABELS } from '@/store/game'

const props = defineProps<{
  row: number
  col: number
}>()

const emit = defineEmits<{
  dragstart: []
  drop: []
}>()

const store = useStore()
const isDragging = ref(false)
const isDragOver = ref(false)

// Получаем фишку на этой позиции
const tile = computed(() => store.getters['game/getTileAt'](props.row, props.col))

// Проверяем, выбрана ли эта фишка
const isSelected = computed(() => {
  const selected = store.getters['game/getSelectedTile']
  return selected?.row === props.row && selected?.col === props.col
})

// Проверяем, идёт ли обработка
const isProcessing = computed(() => store.getters['game/getIsProcessing'])

// Получаем цвет фишки
const tileColor = computed(() => {
  if (!tile.value) return 'transparent'
  return store.getters['game/getTileColor'](tile.value.type)
})

// Метка бонуса
const bonusLabel = computed(() => {
  const b = tile.value?.bonus as keyof typeof BONUS_LABELS | undefined
  return b ? (BONUS_LABELS[b] ?? b) : ''
})

// Стиль фишки
const tileStyle = computed(() => ({
  '--tile-color': tileColor.value,
  '--tile-shadow': isDragOver.value ? '0 0 10px rgba(255, 255, 255, 0.8)' : 'none',
}))

// Обработка клика
const handleClick = () => {
  if (isProcessing.value) return
  store.dispatch('game/selectTile', { row: props.row, col: props.col })
}

// Обработка начала перетаскивания
const handleDragStart = (event: DragEvent) => {
  if (isProcessing.value || !tile.value) {
    event.preventDefault()
    return
  }
  
  isDragging.value = true
  event.dataTransfer!.effectAllowed = 'move'
  event.dataTransfer!.setData('text/plain', JSON.stringify({
    row: props.row,
    col: props.col,
  }))
  
  // Снимаем выделение при начале перетаскивания
  store.dispatch('game/clearSelection')
}

// Обработка окончания перетаскивания
const handleDragEnd = () => {
  isDragging.value = false
}

// Обработка dragover
const handleDragOver = (event: DragEvent) => {
  if (isProcessing.value) return
  isDragOver.value = true
  event.dataTransfer!.dropEffect = 'move'
}

// Обработка dragleave
const handleDragLeave = () => {
  isDragOver.value = false
}

// Обработка drop
const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  
  if (isProcessing.value) return
  
  try {
    const data = JSON.parse(event.dataTransfer!.getData('text/plain'))
    const { row: fromRow, col: fromCol } = data
    
    store.dispatch('game/dropTile', {
      fromRow,
      fromCol,
      toRow: props.row,
      toCol: props.col,
    })
  } catch (e) {
    console.error('Drop error:', e)
  }
}

// Обработка клавиш (стрелки)
const handleKeydown = (event: KeyboardEvent) => {
  const keyMap: Record<string, string> = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
  }
  
  const direction = keyMap[event.key]
  
  if (direction) {
    event.preventDefault()
    
    // Если фишка выбрана, двигаем её
    if (isSelected.value) {
      store.dispatch('game/moveSelectedTile', direction)
    } else {
      // Сначала выбираем фишку
      store.dispatch('game/selectTile', { row: props.row, col: props.col })
    }
  }
  
  // Enter или Space для выбора
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleClick()
  }
}
</script>

<style scoped lang="scss">
.game-tile {
  width: 100%;
  aspect-ratio: 1;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
  outline: none;
  box-shadow: var(--tile-shadow);
  
  &:hover {
    background: rgba(0, 0, 0, 0.3);
  }
  
  &:focus {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
  }
  
  &--selected {
    box-shadow: 0 0 0 3px #fff, 0 0 15px rgba(255, 255, 255, 0.5);
    transform: scale(1.05);
    z-index: 1;
  }
  
  &--empty {
    cursor: default;
    
    .game-tile__inner {
      opacity: 0;
    }
  }
  
  &--dragging {
    opacity: 0.5;
    transform: scale(0.9);
  }
  
  &__inner {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8%;
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  
  &__chip {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: var(--tile-color);
    box-shadow: 
      inset 0 -4px 8px rgba(0, 0, 0, 0.3),
      inset 0 4px 8px rgba(255, 255, 255, 0.3),
      0 2px 4px rgba(0, 0, 0, 0.3);
    transition: background-color 0.2s ease;
    
    // Блик на фишке
    &::before {
      content: '';
      position: absolute;
      top: 15%;
      left: 20%;
      width: 30%;
      height: 20%;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      transform: rotate(-30deg);
    }
  }

  &__bonus {
    position: absolute;
    top: 2px;
    right: 2px;
    font-size: 10px;
    font-weight: bold;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
    pointer-events: none;
  }

  &__crystal {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 14px;
    color: #ffd700;
    text-shadow: 0 0 4px rgba(255, 215, 0, 0.8);
    pointer-events: none;
  }

  &__frozen {
    position: absolute;
    bottom: 2px;
    left: 2px;
    font-size: 10px;
    font-weight: bold;
    color: #87ceeb;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
    pointer-events: none;
  }

  &__buried {
    position: absolute;
    bottom: 2px;
    right: 2px;
    font-size: 12px;
    color: #8b4513;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
    pointer-events: none;
  }

  &__spiked {
    position: absolute;
    top: 2px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    color: #808080;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
    pointer-events: none;
  }

  &__levitating {
    position: absolute;
    top: 2px;
    left: 2px;
    font-size: 10px;
    color: #e0e0ff;
    text-shadow: 0 0 4px rgba(224, 224, 255, 0.8);
    pointer-events: none;
  }

  &--frozen .game-tile__chip {
    box-shadow:
      inset 0 0 0 2px rgba(135, 206, 235, 0.8),
      inset 0 -4px 8px rgba(0, 0, 0, 0.3),
      inset 0 4px 8px rgba(255, 255, 255, 0.3),
      0 2px 4px rgba(0, 0, 0, 0.3);
  }

  &--buried .game-tile__chip {
    opacity: 0.85;
    filter: brightness(0.8);
  }

  &--spiked .game-tile__chip {
    background: repeating-linear-gradient(
      -45deg,
      var(--tile-color),
      var(--tile-color) 2px,
      rgba(128, 128, 128, 0.5) 2px,
      rgba(128, 128, 128, 0.5) 4px
    );
  }

  &--levitating .game-tile__chip {
    box-shadow:
      var(--tile-shadow),
      0 -2px 8px rgba(224, 224, 255, 0.4),
      inset 0 -4px 8px rgba(0, 0, 0, 0.3),
      inset 0 4px 8px rgba(255, 255, 255, 0.3),
      0 2px 4px rgba(0, 0, 0, 0.3);
  }
}
</style>
