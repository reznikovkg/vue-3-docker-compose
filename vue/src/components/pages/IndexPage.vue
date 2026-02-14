<template>
  <div>
    <CustomButton />
    <CustomButton type="red">Красная кнопка</CustomButton>
    <CustomButton type="blue">Синяя кнопка</CustomButton>
  </div>
</template>

<script>
import CustomButton from "../ui/CustomButton.vue";

export default {
  name: "IndexPage",
  components: {
    CustomButton,
  },
};
</script>

<style>
body {
  background-color: #fff;
  display: block;
  margin-top: 100px;
  color: #000;
}
</style>
