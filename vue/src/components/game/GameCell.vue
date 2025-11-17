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
  'game-cell--matched': isMatched.value
}))
const isSelected = computed(() => selectedCell.value?.id === props.cell.id)
const isMatched = computed(() => matchedSet.value.has(props.cell.id))

const handleClick = () => {
  emit('cell-click', props.cell)
}
</script>