<template>
  <div class="timer">
    Время: {{ timer }} сек
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['timer'])
  }
}
</script>

<style scoped lang="scss">
.timer {
  font-size: 32px;
  font-weight: bold;
}
</style>