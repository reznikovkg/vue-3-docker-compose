<template>
  <div>
    <CustomButton />
    <CustomButton type="red">Красная кнопка</CustomButton>
    <CustomButton type="blue">Синяя кнопка</CustomButton>
  </div>
  <div>
    <input type="text" v-model="name" placeholder="Name" />
    <input type="text" v-model="age" placeholder="Age" />
    <CustomButton @click="() => addPerson()">Add</CustomButton>

    <p>People list:</p>
    <div v-for="p in people" :key="p.name">
      <p>{{ p.name }} - {{ p.age }}</p>
    </div>
  </div>
</template>

<script>
import CustomButton from "../ui/CustomButton.vue";

export default {
  name: "IndexPage",
  components: {
    CustomButton,
  },
  data() {
    return {
      people: [],
      name: "",
      age: 0,
    };
  },
  methods: {
    addPerson() {
      this.people.push({
        name: this.name,
        age: this.age,
      });
      ((this.name = ""), (this.age = 0));
    },
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
input {
  padding: 5px;
  font-size: 16px;
  margin: 0 10px;
}
</style>
