<template>
  <div class="shape-list">
    <div
        v-for="shape in shapes"
        :key="shape.id"
        class="shape-list__item"
        :class="{ 'shape-list__item--active': selectedShape?.id === shape.id }"
        @click="handleSelect(shape)"
    >
      <div class="shape-list__color" :style="{ background: shape.color }"></div>

      <div class="shape-list__info">
        <div class="shape-list__name">{{ shape.name }}</div>

        <div class="shape-list__size">
          {{ getWidth(shape) }} × {{ getHeight(shape) }}
        </div>

        <div class="shape-list__cost">
          {{ shape.cost }}$
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {useStore} from "vuex";
import {computed} from "vue";

const store = useStore()

const shapes = computed(() => store.getters.shapes)

const getWidth = (shape) => {
  const xs = shape.cells.map(c => c.x)
  return Math.max(...xs) - Math.min(...xs) + 1
}

const getHeight = (shape) => {
  const ys = shape.cells.map(c => c.y)
  return Math.max(...ys) - Math.min(...ys) + 1
}

const selectedShape = computed(() => store.getters.selectedShape)

const handleSelect = (shape) => {
  store.dispatch('setPreviewOrigin', null)

  if (selectedShape.value?.id === shape.id) {
    store.dispatch('setShape', null)
    return
  }

  store.dispatch('setShape', shape)
}
</script>

<style lang="less" scoped>
.shape-list {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__item {
    display: flex;
    align-items: center;
    gap: 10px;

    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;

    &--active {
      border: 2px solid #4caf50;
      box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
    }
  }

  &__color {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    border: 1px solid #ddd;
    flex-shrink: 0;
  }

  &__cost {
    font-size: 12px;
    font-weight: 600;
    color: #2e7d32;
    margin-left: auto;
  }

  &__info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex: 1;
  }

  &__name {
    font-weight: 600;
    font-size: 14px;
    color: #000;
  }

  &__size {
    font-size: 12px;
    opacity: 0.6;
    color: #000;
    margin-left: auto;
  }
}
</style>
