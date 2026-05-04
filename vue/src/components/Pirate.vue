<template>
  <div class="pirate" :style="pirateStyle">
    <div class="pirate__images" :style="{ '--dir': pirate.dirX >= 0 ? 1 : -1 }">
      <img class="pirate__boat" src="../assets/images/PirateBoat.png">
      <div class="pirate__sprite" :class="{ 'pirate__sprite--idle': true }" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const props = defineProps({
  pirate: Object
})

const boat = computed(() => store.getters['game/getBoat'])

const centerX = window.innerWidth / 2
const centerY = window.innerHeight / 2

const pirateStyle = computed(() => {
  const dx = (props.pirate.x - boat.value.x)
  const dy = (props.pirate.y - boat.value.y)

  const dirX = (props.pirate.dirX >= 0) ? 1 : -1

  return {
    left: `${centerX + dx}px`,
    top: `${centerY + dy}px`,
    '--dir': dirX
  }
})
</script>

<style scoped lang="scss">
.pirate {
  position: absolute;
  z-index: 2;

  &__boat {
    width: 200px;
  }

  &__images {
    position: relative;
    transform: translate(-50%, -50%) scale(0.5) scaleX(var(--dir));
    transform-origin: center bottom;
  }

  &__sprite {
    position: absolute;

    width: 150px;
    height: 146px;

    background-image: url(../assets/images/PirateIdle.png);
    background-repeat: no-repeat;
    background-position: 0 0;

    &--idle {
      animation: pirate-idle 1s steps(4) infinite;

      top: -112px;
      left: 20px;
    }
  }
}

@keyframes pirate-idle {
  from {
    background-position: 0 0;
  }

  to {
    background-position: -600px 0;
  }
}
</style>
