<template>
  <div class="dropdown" ref="dropdownRef">
    <button class="dropdown__button" @click="() => toggle()">&#9776;</button>

    <div v-if="isOpen" class="dropdown__menu">
      <div class="dropdown__title">Локации</div>
      <div
        v-for="({ label, value }, index) in LOCATIONS"
        :key="index"
        class="dropdown__item"
        @click="setLocation(value)"
      >
        {{ label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

import { LOCATIONS } from '../../constants'

const isOpen = ref(false)
const dropdownRef = ref(null)
const store = useStore()

const setLocation = (location) => {
  store.dispatch('game/setCurrentLocationValue', location)
  isOpen.value = false
}

const toggle = () => {
  isOpen.value = !isOpen.value
}

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
.dropdown {
  margin: 0.5rem;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 100;

  &__button {
    cursor: pointer;
    font-size: 1.25rem;
    background: rgb(45, 45, 45);
    border-radius: 0.25rem;
    user-select: none;
    transition: background-color 0.2s ease;

    &:hover {
      background: rgb(70, 70, 70);
    }
  }

  &__menu {
    margin-top: 0.5rem;
    background: rgb(45, 45, 45);
    border-radius: 0.5rem;
    overflow: hidden;
    border: 1px solid rgb(100, 100, 100);
  }

  &__title {
    font-weight: bold;
    padding: 0.5rem;
    border-bottom: 1px solid rgb(200, 200, 200);
  }

  &__item {
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: rgb(90, 90, 90);
    }
  }
}
</style>
