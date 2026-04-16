<template>
  <div class="info">
    Coordinates (X: {{ getBoat.x }}, Y: {{ getBoat.y }})
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Location',
  computed: {
    ...mapGetters([
      'getBoat'
    ])
  }
}
</script>

<style scoped lang="scss">
.info {
  position: absolute;
  left:50%;
  transform: translateX(-50%);
  z-index: 2;
}
</style>
