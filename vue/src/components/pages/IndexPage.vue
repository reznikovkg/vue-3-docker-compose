<template>
  <div>
    <Flask v-for="(flask, index) in flasks" :key="index" />
  </div>
</template>

<script>
import Flask from './Flask.vue'

export default {
  name: 'IndexPage',
  components: { Flask },
  data () {
    return {
      flasks: [[], [], [], [], [], []]
    }
  }
}
</script>

<style scoped>
</style>