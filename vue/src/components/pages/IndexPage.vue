<template>
  <div>
    <div>R: {{ count }}</div>
    <div>2PR: {{ c2pr }}</div>
    <div>Diameter: {{ diameter }}</div>
    <div>Square : {{ square }}</div>

    <CustomButton :type="'red'" @click="() => addCount(5)">+5</CustomButton>
    <CustomButton @click="() => addCount(10)">+10</CustomButton>
    <CustomButton @click="() => removeCount(5)">-5</CustomButton>
    <CustomButton @click="() => removeCount(10)">-10</CustomButton>
    <CustomButton
      :showInput="true"
      @click="() => addCount(10)"
      @len="(v) => check(v)"
    >
      123
      <template #count> 999 </template>
    </CustomButton>
  </div>
</template>

<script>
import CustomButton from "@/components/ui/CustomButton.vue";

export default {
  name: "IndexPage",
  components: {
    CustomButton,
  },
  data() {
    return {
      count: 10,
    };
  },
  computed: {
    c2pr() {
      return 2 * Math.PI * this.count;
    },
    diameter() {
      return 2 * this.count;
    },
    square() {
      return Math.PI * this.count * this.count;
    },
  },
  methods: {
    addCount(v = 10) {
      this.count += v;
    },
    removeCount(v = 10) {
      this.count -= v;
      if (this.count < 0) {
        alert("Радиус не может быть отрицательным");
        this.count = 0;
      }
    },
    check(v) {
      alert(v);
    },
  },
};
</script>

<style></style>
