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
          'shape-picker__option--disabled': parkBalance < shape.cost
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
                backgroundColor: shape.color
              }"
            ></div>
          </div>
        </div>
        <div class="shape-picker__info">
          <span class="shape-picker__name">{{ shape.name }}</span>
          <div class="shape-picker__details">
            <span class="shape-picker__cost">Цена: {{ shape.cost }}</span>
            <span v-if="shape.capacity > 0" class="shape-picker__capacity">Вместимость: {{ shape.capacity }}</span>
            <span v-if="shape.income > 0" class="shape-picker__income">Доход: {{ shape.income }}</span>
            <div 
              v-if="hasBuildingEffects(shape.type)"
              class="shape-picker__effects"
            >
              <span 
                v-for="(value, indicatorName) in getBuildingEffects(shape.type)" 
                :key="indicatorName"
                class="shape-picker__effect"
                :class="`shape-picker__effect--${indicatorName}`"
              >
                {{ getEffectText(indicatorName, value) }}
              </span>
            </div>
          </div>
        </div>
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
  cost: number
  capacity: number
  visitTime: number
  entry: ShapePart
  income: number
  level: number
}

type BuildingEffects = Record<string, Record<string, number>>

const store = useStore()

const availableShapes = computed(() => store.getters.getAvailableShapes)
const selectedShape = computed(() => store.getters.getSelectedShape)
const parkBalance = computed(() => store.getters.getParkBalance)
const buildingEffects = computed<BuildingEffects>(() => store.getters.getBuildingEffects)
const indicatorDisplayNames = computed(() => store.getters.getIndicatorDisplayNames)

const hasBuildingEffects = (buildingType: string): boolean => {
  const effects = buildingEffects.value[buildingType]
  if (!effects || typeof effects !== 'object') return false
  
  return Object.keys(effects).length > 0
}

const getBuildingEffects = (buildingType: string): Record<string, number> => {
  return buildingEffects.value[buildingType] || {}
}

const getEffectText = (indicatorName: string, value: number): string => {
  const displayName = indicatorDisplayNames.value?.[indicatorName] || indicatorName
  return `+${value} ${displayName}`
}

const selectShape = (shape: Shape): void => {
  if (parkBalance.value >= shape.cost) {
    store.dispatch('setSelectedShape', shape)
  } else {
    alert('Недостаточно средств для покупки этой фигуры')
  }
}
</script>

<style scoped lang="less">
.shape-picker {
  width: 350px;
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

    &--disabled {
      opacity: 0.5;
      cursor: not-allowed;
      
      &:hover {
        transform: none;
        border-color: #b0c4de;
      }
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

  &__info {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  &__name {
    font-size: 11px;
    color: #2f4f4f;
    font-weight: 500;
    text-align: center;
    margin-bottom: 4px;
  }

  &__details {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    font-size: 9px;
    gap: 2px;
  }

  &__cost {
    color: #ff6b6b;
    font-weight: bold;
  }

  &__capacity {
    color: #4CAF50;
    font-weight: bold;
  }

  &__income {
    color: #FFA500;
    font-weight: bold;
  }

  &__effects {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 3px;
    margin-top: 2px;
  }

  &__effect {
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 8px;
    font-weight: bold;
    cursor: help;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    color: white;
    
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    &--fatigue {
      background-color: #4A90E2; 
    }

    &--hunger {
      background-color: #FF6B6B; 
    }

    &--boredom {
      background-color: #FFA500;
    }

    &--naturalNeed {
      background-color: #9B59B6; 
    }
  }
}
</style>