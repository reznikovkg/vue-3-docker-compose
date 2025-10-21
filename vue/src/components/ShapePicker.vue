<template>
  <div class="shape-picker">
    <h3 class="shape-picker__title">Выберите фигуру:</h3>
    <div class="shape-picker__grid">
      <div
        v-for="shape in availableShapes"
        :key="shape.id"
        class="shape-picker__option"
        :class="{
          'shape-picker__option--selected': selectedShape?.id === shape.id,
        }"
        @click="() => selectShape(shape)"
      >
        <div class="shape-picker__preview">
          <div class="shape-picker__preview-3d">
            <div
              v-for="(part, index) in shape.layout"
              :key="index"
              class="shape-picker__preview-part"
              :style="{
                left: `${part.x * 25 + 25}%`,
                top: `${part.y * 25 + 25}%`,
              }"
            ></div>
          </div>
        </div>
        <span class="shape-picker__name">{{ shape.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

interface ShapePart {
  x: number
  y: number
}

interface Shape {
  id: number
  name: string
  type: string
  color: string
  layout: ShapePart[]
}

const store = useStore()

const availableShapes = computed(() => store.getters.getAvailableShapes)
const selectedShape = computed(() => store.getters.getSelectedShape)

const selectShape = (shape: Shape): void => {
  store.dispatch('setSelectedShape', shape)
}
</script>

<style scoped lang="less">
.shape-picker {
  margin-bottom: 20px;

  &__title {
    font-size: 16px;
    color: #2f4f4f;
    margin-bottom: 12px;
    text-align: center;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px; 
  }

  &__option {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px; 
    border: 2px solid #b0c4de;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: white;

    &:hover {
      border-color: #87ceeb;
      transform: translateY(-2px);
    }

    &--selected {
      border-color: #32cd32;
      background: #f0fff0;
      box-shadow: 0 2px 6px rgba(50, 205, 50, 0.3);
    }
  }

  &__preview {
    width: 50px; 
    height: 50px;
    background: #caf4f7;
    border: 1px solid #32cd32;
    border-radius: 4px;
    margin-bottom: 6px;
    position: relative;
    overflow: hidden;
  }

  &__preview-3d {
    position: relative;
    width: 100%;
    height: 100%;
    transform: rotate(45deg) scale(0.7);
  }

  &__preview-part {
    position: absolute;
    width: 20%;
    height: 20%;
    background: #8b4513;
    border: 1px solid #654321;
    border-radius: 2px;
  }

  &__name {
    font-size: 11px;
    color: #2f4f4f;
    font-weight: 500;
    text-align: center;
  }
}
</style>