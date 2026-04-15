<template>
  <div class="info">
    Координаты (X: {{ getBoat.x }}, Y: {{ getBoat.y }})
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
  z-index: 2;
}
</style>
