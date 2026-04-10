<template>
  <div class="island" :style="islandStyle">
    <img class="island__image" src="../assets/images/Island.png" width="200px" >
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const props = defineProps({
  islandX: Number,
  islandY: Number
})

const boat = computed(() => store.getters['game/getBoat'])

const islandSize = 200

const centerX = window.innerWidth / 2
const centerY = window.innerHeight / 2

const islandStyle = computed(() => {
  const dx = (props.islandX - boat.value.x)
  const dy = (props.islandY - boat.value.y)

  return {
    position: `absolute`,
    left: `${centerX + dx}px`,
    top: `${centerY + dy}px`,
    width: `${islandSize}px`,
    height: `${islandSize}px`,
    transform: `translate(-50%, -50%)`
  }
})

</script>

<style scoped lang="scss">
.island {
  position: absolute;
  z-index: 1;
  transform: translate(-50%, -50%);
}
</style>
