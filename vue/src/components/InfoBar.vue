<template>
  <div class="infobar">
    <span class="infobar__text">(X: {{ boat.x }}, Y: {{ boat.y }})</span>
    <span class="infobar__text">Тип области: {{ currentZone }}</span>
    <span class="infobar__text">Баланс: {{ balance }}₽</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const boat = computed(() => store.getters['game/getBoat'])

const currentZone = computed(() => store.getters['game/getCurrentZone'])
const balance = computed(() => store.getters['game/getBalance'])
</script>

<style scoped lang="scss">
.infobar {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;

  width: 1200px;

  padding: 18px;
  background-color: rgb(200, 200, 200);
  border: 8px dashed rgb(10, 10, 100);
  box-shadow: 0 4px 10px rgb(0, 0, 0);
  top: 20px;

  &__text {
    color: rgb(10, 10, 100);
    font-size: 24px;
    white-space: nowrap;
    text-align: center;
    width: 400px;
  }
}
</style>
