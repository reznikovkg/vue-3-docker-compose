<template>
  <div class="infobar">
    <span class="infobar__text">Координаты (X: {{ boat.x }}, Y: {{ boat.y }})</span>
    <span class="infobar__text">Тип области: Какая-то область</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const boat = computed(() => store.getters['game/getBoat'])
</script>

<style scoped>
.infobar {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;

  display: flex;
  align-items: center;
  gap: 20px;

  padding: 18px;
  background-color: rgb(200, 200, 200);
  border: 8px dashed rgb(10, 10, 100);
  box-shadow: 0 4px 10px rgb(0, 0, 0);
  top: 20px;
}

.infobar__text {
  color: rgb(10, 10, 100);
  font-size: 20px;
}
</style>
