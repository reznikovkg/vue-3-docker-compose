<template>
  <div class="card"
       :class="{ 'card--selected': card.flipped, 'card--matched': card.matched, 'card--blocked': isBlocked }"
       @click="emit('onClick')">
    <span v-if="card.flipped || card.matched">{{ card.value }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(["card", "isBlocked"])
const emit = defineEmits(['onClick'])

const layerColors = ['#c0392b', '#f1c40f', '#2ecc71', '#3498db', '#8e44ad']
const layerColor = computed(() => {
  return layerColors[(props.card.layer - 1) % layerColors.length]
})

const cardLayer = computed(() => props.card.layer)
const cardMargin = computed(() => `${(props.card.layer - 1) * 5}px`)
</script>

<style lang="scss" scoped>
.card {
  width: 100px;
  height: 100px;
  cursor: pointer;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32px;
  color: white;
  position: absolute;
  background-color: v-bind(layerColor);
  z-index: v-bind(cardLayer);
  margin-top: v-bind(cardMargin);
  margin-left: v-bind(cardMargin);
  &--selected {
    background-color: #898989;
  }
  &--matched {
    opacity: 0;
    pointer-events: none;
  }
  &--blocked {
    pointer-events: none;
  }
}
</style>
