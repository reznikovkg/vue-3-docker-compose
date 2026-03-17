<template>
  
  Index

  <div>
    <RouterLink :to="{ name: $routes.EXAMPLE }">
     To Example
    </RouterLink>
  </div>
  <div>
    {{ r }}, {{ g }}, {{ b }}
  </div>
  <div>
    <CustomButton type="red" icon="black" @click="() => addCount()">Press</CustomButton>
    <CustomButton @click="() => addCount()"></CustomButton>
    <CustomButton @click="() => addCount()">
      Text
      <template #count>
        count
      </template>
    </CustomButton>
  </div>
  R<input type="range" min="0" max="255" v-model.number="r"></input>
  G<input type="range" min="0" max="255" v-model.number="g"></input>
  B<input type="range" min="0" max="255" v-model.number="b"></input>
</template>

<script>
import CustomButton from '../ui/CustomButton.vue';
export default {
  name: 'IndexPage',
  data(){
    return {
      count:10,
      r:0,
      g:0,
      b:0
    }
  },
  components:{
    CustomButton
  },
  computed:{
    color(){
      return [this.r,this.g,this.b]
    }
  },
  watch:{
    color(){
      document.body.style.color = `rgb(${255-this.r}, ${255-this.g}, ${255-this.b})`
      document.body.style.background = `rgb(${this.r}, ${this.g}, ${this.b})`
    }
  },
  methods: {
      addCount(){
        return this.count+=10
      },
      rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
}
    }
 }
</script>

<style scoped>

</style>
