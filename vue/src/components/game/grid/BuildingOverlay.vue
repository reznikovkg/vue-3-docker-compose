<template>
  <div class="building-overlay">
    <div class="building-overlay__item">
      {{ visitorsCount }} / {{ capacity }}
    </div>

    <div class="building-overlay__item">
      +{{ price }}
    </div>
  </div>
</template>

<script setup>
import {computed} from 'vue'

const props = defineProps({
  obj: {
    type: Object,
    required: true
  },
  x: Number,
  y: Number
})

const visitorsCount = computed(() => {
  return props.obj?.visitorsIn?.length ?? 0
})

const capacity = computed(() => {
  return props.obj?.shape?.capacity ?? 0
})

const price = computed(() => {
  return props.obj?.shape?.visitCost ?? 0
})
</script>

<style lang="less" scoped>
.building-overlay {
  position: absolute;
  bottom: 8px;
  left: 8px;

  display: flex;
  flex-direction: column;
  gap: 2px;

  font-size: 16px;
  line-height: 1;
  pointer-events: none;

  background: #dddddd;
  padding: 3px 5px;
  border-radius: 4px;

  &__item {
    white-space: nowrap;
  }
}
</style>
