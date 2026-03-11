<template>
  <div 
    class="card"
    draggable="true"
    @dragstart="(event) => dragStart(event)"
    @click="() => select()"
  >
    <div class="card__icon">{{element.icon}}</div>
    <div class="card__name">{{element.name}}</div>
  </div>
</template>

<script>
import { ELEMENTS } from '../../config/elements'

export default {
  props:{ 
    id:Number 
  },
  
  computed:{
    element(){
      return ELEMENTS[this.id]
    }
  },

  methods:{
    dragStart(event){

      event.dataTransfer.effectAllowed = "copy";
      event.dataTransfer.setData("text/plain",this.id);
    },

    select() {
      this.$emit('select', this.id)
    }
  }
}
</script>

<style scoped lang="scss">
.card {
  background: linear-gradient(135deg, #ffffff, #f0f0f0);
  color: #222;
  border-radius: 16px;
  padding: 15px;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0,0,0,0.25);
  transition: 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    background: linear-gradient(135deg, #e0e0e0, #d0d0d0);
  }

  &__icon {
    font-size: 32px;
    margin-bottom: 5px;
  }

  &__name {
    font-weight: bold;
    font-size: 16px;
  }
}
</style>