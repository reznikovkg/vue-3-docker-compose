<template>
  <div>
    {{ count }}
  </div>

  <button @click="() => addCount()">Кнопка</button>
</template>

<script>
export default {
  name: 'IndexPage',
  data() {
    return {
      count: 10
    }
  },
  methods: {
    addCount() {
      this.count += 10
    }
  }
}
</script>

<style scoped></style>
