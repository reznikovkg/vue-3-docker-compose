<template>
  <div class="shape-list">
    <div
        v-for="shape in shapes"
        :key="shape.id"
        class="shape-list__item"
        draggable="true"
        @dragstart="handleDragStart(shape)"
    >
      {{ shape.id }}
    </div>
  </div>
</template>

<script setup>
import {useStore} from "vuex";
import {MUTATIONS} from "@/store/index.js";

const store = useStore()

const shapes = store.state.shapes

const handleDragStart = (shape) => {
  store.commit(MUTATIONS.SET_DRAGGING, shape)
}
</script>

<style lang="less" scoped>
.shape-list {
  display: flex;
  gap: 10px;

  &__item {
    padding: 8px;
    border: 1px solid #ccc;
    cursor: pointer;

    &:hover {
      background: #eee;
    }
  }
}
</style>
