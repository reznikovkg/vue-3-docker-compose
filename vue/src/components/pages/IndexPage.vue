<template>
  <div>
    Страница для расчёта параметров окружности
    <div>R: {{ count }}</div>
    <div>Диаметр: {{ diameter }}</div>
    <div>Длина: {{ c2pr }}</div>
    <div>Площадь: {{ square }}</div>

    <CustomButton :type="'green'" @click="() => addCount(1)">+1</CustomButton>
    <CustomButton :type="'green'"@click="() => addCount(5)">+5</CustomButton>
    <CustomButton @click="() => removeCount(1)">-1</CustomButton>
    <CustomButton @click="() => removeCount(1)">-5</CustomButton>
    <CustomButton
      :showInput="true"
      @click="() => addCount(10)"
      @len="(v) => check(v)"
    >
      
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
