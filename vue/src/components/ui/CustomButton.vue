<template>
 <button class="c-button" :class="'c-button--' + type">
   <!--<div class="c-button__icon">
     + {{text}}
   </div>-->

   <slot>Button</slot>

   <template v-if="$slots.count">
     (<slot name="count">0</slot>)
   </template>

   <input v-model="text" type="text" @click.stop @input="() => check()">

   <div class="c-button__icon" v-if="text.length>0" @click="() => clear()">
     -
   </div>

 </button>
</template>

<script>
export default{
  name: 'CustomButton',
  emits: ['len'],
  props: {
    type: {
      default: 'default',
      type: String
    }
  },
  data () {
    return {
        text: ''
    }
  },
  methods: {
    check () {
      if (this.text.length > 10) {
        this.$emit('len', this.text.length)
      }
    },
    clear() {
      this.text = ''
    }
  }
}
</script>

<style lang="scss">
.c-button{
  border: 1px solid #bd7303;
  background: #c19552;
  color: white;
  font-size: 12px;
  padding: 5px;
  margin: 5px;
  display: flex;

  &--red {
    border: 1px solid #bd0313;
    background: #c1525b;
  }

  &__icon{
    color: black;
    margin: 10px;
    padding: 5px;
    border: 1px solid black;
  }
}
</style>