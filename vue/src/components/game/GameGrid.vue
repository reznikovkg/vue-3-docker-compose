<template>
  <div class="grid">
    <div
        v-for="y in height"
        :key="y"
        class="grid__row"
    >
      <GridCell
          v-for="x in width"
          :key="`${x}-${y}`"
          :x="x - 1"
          :y="y - 1"
          @hoverCell="onHoverCell"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import GridCell from "@/components/game/GridCell.vue";

const store = useStore()

const width = computed(() => store.state.grid.width)
const height = computed(() => store.state.grid.height)

const onHoverCell = ({ x, y }) => {
  store.dispatch('setPreviewOrigin', { x, y })
}
</script>

<style lang="less" scoped>
.grid {
  position: absolute;
  left: 0;
  top: 0;

  transform-style: preserve-3d;
  will-change: transform;

  &__tile {
    position: absolute;
    width: 60px;
    height: 60px;
    background: white;
    border: 1px solid #ddd;
  }
}
</style>
