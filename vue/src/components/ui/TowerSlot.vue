<template>
  <g
      :transform="`translate(${slot.x}, ${slot.y})`"
      @click.stop="() => $store.dispatch('selectSlot', slot.id)">
    <circle
        v-if="tower && isSelected"
        :r="tower.range"
        fill="transparent"
        stroke="green"
        stroke-dasharray="5"/>
    <rect
        x="-20" y="-20" width="40" height="40" rx="4"
        :fill="isSelected ? 'green' : 'brown'"
        style="cursor: pointer"/>

    <circle v-if="tower" :r="10" :fill="towerColor" />
  </g>
</template>

<script>
import { TOWERS } from '@/towers.js'

export default {
  name: 'TowerSlot',

  props: {
    slot: {
      type: Object,
      required: true,
    },
  },

  computed: {
    tower() {
      return this.$store.state.towers[this.slot.id] || null
    },
    isSelected() {
      return this.$store.state.selectedSlot === this.slot.id
    },
    towerColor() {
      return TOWERS[this.tower.type].color
    },
  },
}
</script>