<template>
  <div
    class="game-cell"
    :class="{
      selected: isSelected,
      matched: isMatched
    }"
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
const selectedCell = computed(() => store.state.game.selectedCell)
const matchedSet = computed(() => store.state.game.matchedSet)

const isSelected = computed(() => selectedCell.value?.id === props.cell.id)
const isMatched = computed(() => matchedSet.value.has(props.cell.id))

const handleClick = () => {
  emit('cell-click', props.cell)
}
</script>