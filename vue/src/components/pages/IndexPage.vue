<template>
  <div>R: {{ count }} 2PiR: {{ circumference }}</div>
  <button @click="() => addCount(5)">+5</button>
  <button @click="() => addCount(10)">+10</button>
  <div>
    <RouterLink :to="{ name: $routes.EXAMPLE }"> To Example </RouterLink>
  </div>
</template>

<script>
export default {
  name: "IndexPage",
  data() {
    return {
      count: 10,
    };
  },
  computed: {
    circumference() {
      return 2 * Math.PI * this.count;
    },
  },
  methods: {
    addCount(val = 10) {
      this.count += val;
    },
  },
};
</script>

<style scoped></style>
