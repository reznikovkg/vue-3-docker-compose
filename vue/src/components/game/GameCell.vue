<template>
  <div
    class="game-cell"
    :class="cellClasses"
    @click="handleClick"
  >
    <div
      v-if="cell.color"
      class="gem"
      :style="{ backgroundColor: cell.color }"
    />
    <div v-if="cell.crystal" class="crystal">⭐</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const props = defineProps({
  cell: Object
})

const store = useStore()
const selectedCell = computed(() => store.getters['game/selectedCell'])
const matchedSet = computed(() => store.getters['game/matchedSet'])
const cellClasses = computed(() => ({
  'game-cell--selected': isSelected.value,
  'game-cell--matched': isMatched.value,
  'game-cell--frozen-1': props.cell.frozen === 1,
  'game-cell--frozen-2': props.cell.frozen === 2,
  'game-cell--buried': props.cell.effect === 'buried',
  'game-cell--spiked': props.cell.effect === 'spiked',
  'game-cell--floating': props.cell.effect === 'floating',
}))
const isSelected = computed(() => selectedCell.value?.id === props.cell.id)
const isMatched = computed(() => matchedSet.value.has(props.cell.id))

const handleClick = () => {
  if (props.cell.effect) return;
  emit('cell-click', props.cell)
}
</script>
