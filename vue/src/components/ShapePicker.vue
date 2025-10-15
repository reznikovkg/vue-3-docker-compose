<template>
  <div class="shape-picker">
    <h3>Выберите фигуру:</h3>
    <div class="shapes-grid">
      <div
        v-for="shape in availableShapes"
        :key="shape.id"
        @click="selectShape(shape)"
        class="shape-option"
        :class="{ selected: selectedShape?.id === shape.id }"
      >
        <div class="shape-preview">
          <div class="preview-3d">
            <div 
              v-for="(part, index) in shape.layout" 
              :key="index"
              class="preview-part"
              :style="{
                left: `${part.x * 25 + 25}%`,
                top: `${part.y * 25 + 25}%`
              }"
            ></div>
          </div>
        </div>
        <span class="shape-name">{{ shape.name }}</span>
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

<style scoped>
.shape-picker {
  margin-bottom: 20px;
}

h3 {
  font-size: 16px;
  color: #2F4F4F;
  margin-bottom: 15px;
  text-align: center;
}

.shapes-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.shape-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border: 2px solid #B0C4DE;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.shape-option:hover {
  border-color: #87CEEB;
  transform: translateY(-2px);
}

.shape-option.selected {
  border-color: #32CD32;
  background: #F0FFF0;
  box-shadow: 0 2px 8px rgba(50, 205, 50, 0.3);
}

.shape-preview {
  width: 60px;
  height: 60px;
  background: #caf4f7;
  border: 1px solid #32CD32;
  border-radius: 4px;
  margin-bottom: 8px;
  position: relative;
  overflow: hidden;
}

.preview-3d {
  position: relative;
  width: 100%;
  height: 100%;
  transform: rotate(45deg) scale(0.7);
}

.preview-part {
  position: absolute;
  width: 20%;
  height: 20%;
  background: #8B4513;
  border: 1px solid #654321;
  border-radius: 2px;
}

.shape-name {
  font-size: 12px;
  color: #2F4F4F;
  font-weight: 500;
  text-align: center;
}
</style>