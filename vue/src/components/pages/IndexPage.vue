<template>
  <div>
  <div>
    R: {{count}}
  </div>
  <div>
    2PR: {{c2pr}}
  </div>
    

    <CustomButton :type="'red'" @click="() => addCount(5)">+5</CustomButton>
    
    <CustomButton @click="() => addCount(10)" @len="(v) => check(v)">
      123
      <template #count>
        999
      </template>
    </CustomButton>

    <CustomButton @click="() => addCount(10)"></CustomButton>
    <CustomButton @click="() => addCount(10)"/>
    <CustomButton :type="'purple'" @click="() => addCount(-5)">-5</CustomButton>
  </div>
</template>

<script>
import CustomButton from "@/components/ui/CustomButton.vue";
export default{
  name: 'IndexPage',
  components: {
    CustomButton
  },
  data(){
    return{
      count: 10
    }
  },
  computed:{
    c2pr(){
      return 2 * Math.PI * this.count
    }
  },
  methods: {
    addCount(v = 10){
      this.count += v
    },
    check (v) {
      alert('stop')
    }
  }
}
</script>

<style scoped>

</style>
