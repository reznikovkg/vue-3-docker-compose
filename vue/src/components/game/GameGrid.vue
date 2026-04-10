<template>
  <div class="grid"
       :style="gridStyle">
    <GridCell
        v-for="index in width * height"
        :key="index"
        :x="(index - 1) % width"
        :y="Math.floor((index - 1) / width)"
        @hoverCell="onHoverCell"
    />
  </div>
</template>

<script setup>
import {computed} from 'vue'
import {useStore} from 'vuex'
import GridCell from "@/components/game/GridCell.vue";

const store = useStore()

const width = computed(() => store.getters.width)
const height = computed(() => store.getters.height)

const onHoverCell = ({x, y}) => {
  store.dispatch('setPreviewOrigin', {x, y})
}

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${width.value}, 60px)`,
  gridTemplateRows: `repeat(${height.value}, 60px)`
}))
</script>

<style lang="less" scoped>
.grid {
  display: grid;
  background-size: 60px 60px;
}
</style>
