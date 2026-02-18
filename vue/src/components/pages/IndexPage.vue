<template>

  <div>
    {{count ** degree}}<br />

    <button @click="() =>  addCount()">count +</button><br />
    <button @click="() =>  addDegree()">degree +</button>
  </div>
</template>

<script>
export default {
  name: 'IndexPage',
  data () {
    return {
        count: 0,
        degree: 1
    }
  },
  methods: {
    addCount () {
      this.count += 1
    },
    addDegree () {
      this.degree += 1
    }
  }
}
</script>

<style scoped>

</style>
