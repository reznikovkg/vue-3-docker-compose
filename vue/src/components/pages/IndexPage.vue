<template>
  <div>
    {{count}}

    <button @click="() => addCount(5)">+5</button>
    <button @click="() => addCount(10)">+10</button>
  </div>
</template>

<script>
export default {
  name: 'IndexPage',
  data () {
    return {
      count: 10
    }
  },
  methods: {
    addCount (v = 10) {
      this.count += v
    }
  }
}
</script>

<style scoped>

</style>
