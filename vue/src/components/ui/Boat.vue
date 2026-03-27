<template>
  <div class="boat" :class="{ 'boat--flipped': direction === 'right' }">
    <img :src="boatImage" alt="Тут должна была быть лодка" />
  </div>
</template>

<script>
import boatImg from '../../assets/boat.png'

export default {
  name: 'IconBoat',
  
  data() {
    return {
      boatImage: boatImg
    }
  },

  props: {
    direction: {
      type: String,
      default: 'right'
    }
  }
}
</script>

<style scoped lang="scss">
.boat {
  width: 128px;
  height: auto;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  &--flipped {
    transform: translate(-50%, -50%) scaleX(-1);
  }

  img {
    width: 100%;
    height: 100%;
    display: block;
  }
}
</style>