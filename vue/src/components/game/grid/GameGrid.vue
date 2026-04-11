<template>
  <div class="game-page__grid-wrapper">
    <div class="game-page__grid"
         :style="gridStyle">
      <GridCell
          v-for="index in width * height"
          :key="index"
          :x="(index - 1) % width"
          :y="Math.floor((index - 1) / width)"
          @hoverCell="onHoverCell"
      />
    </div>

    <div class="game-page__entrance" :style="entranceStyle"/>

    <div class="game-page__visitors-layer">
      <Visitor
          v-for="v in visitors"
          :money="v.money"
          :node="v.node"
      />
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted} from 'vue'
import {useStore} from 'vuex'
import GridCell from "@/components/game/grid/GridCell.vue";
import Visitor from "@/components/game/visitors/Visitor.vue";

const store = useStore()

const width = computed(() => store.getters.width)
const height = computed(() => store.getters.height)

const onHoverCell = ({x, y}) => {
  store.dispatch('setPreviewOrigin', {x, y})
}

const visitors = computed(() => store.getters.visitors)

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${width.value}, 60px)`,
  gridTemplateRows: `repeat(${height.value}, 60px)`
}))

const entrance = computed(() => store.state.park.entrance)

const entranceStyle = computed(() => ({
  left: `${entrance.value.x * 60}px`,
  top: `${entrance.value.y * 60}px`
}))

onMounted(() => {
  setInterval(() => {
    store.dispatch('spawnVisitor')
  }, 5000)
})

onMounted(() => {
  setInterval(() => {
    store.dispatch('tickVisitors')
  }, 1000)
})
</script>

<style lang="less" scoped>
.game-page {
  &__grid-wrapper {
    position: relative;
    width: fit-content;
    height: fit-content;
  }

  &__grid {
    display: grid;
  }

  &__entrance {
    position: absolute;
    width: 60px;
    height: 60px;
    background: #456824;
    pointer-events: none;
  }

  &__visitors-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
}
</style>
