<template>
  <div>

    <div>
      R: {{ count }}
    </div>
    <div>
      2PR : {{ c2pr }}
    </div>

    <button @click="() => addCount(10)">Кнопка +5</button>
    <button @click="() => addCount(20)">Кнопка +10</button>
  </div>

</template>

<script>
export default {
  name: 'IndexPage',
  data() {
    return {
      count: 10
    }
  },
  computed: {
    c2pr() {
      return 2 * Math.PI * this.count
    }

  },
  methods: {
    addCount(v = 10) {
      this.count += v
    }
  }
}
</script>

<style scoped></style>
