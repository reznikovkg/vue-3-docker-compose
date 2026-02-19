<template>
  <div>
    Number: {{ count }}
  </div>
  <CustomButton @click="() => mult()"></CustomButton>
</template>

<script>
import CustomButton from '../ui/CustomButton.vue';
export default {
  name: "IndexPage",
  components: {
    CustomButton
  },
  data () {
    return {
      count: 1 
    }
  },
  methods: {
    mult () {
      this.count *= 2
    }
  }
}
</script>

<style scoped>

</style>
