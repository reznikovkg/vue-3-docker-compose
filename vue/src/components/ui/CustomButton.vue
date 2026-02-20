<template>
  <button class="c-button" :class="'c-button--' + type">
    <div class="c-button__icon">
      + {{text}}
    </div>
    <slot>Кнопка</slot>
    <template v-if="$slots.count">
      (<slot name="count">0</slot>
    </template>
    <input v-model="text" type="text" @click.stop @input="() => check()">
  </button>

</template>

<script>
export default {
  name: "CustomButton",
  emits: ['len'],   
  props: {
    type: {
      default: 'default',
      type: String
    }
  }, 
  data () {
    return {
      text: ' '
    }
  },
  methods: {
    check () {
      if (this.text.length > 10){
        this.$emit('len', this.text.length)
      }
    }
  }
}

</script>

<style lang="scss">
.c-button {
  border: 1px solid #531c58;
  background: #7faddb;
  color: white;
  font-size: 12px;
  padding: 5px;
  margin: 5px;
  display: flex;

  &--red {
    border: 1px solid #200a70;
    background: #eba3a3;
  }

  &--purple {
    border: 3px solid #ff3493;
    padding: 10px;
    margin: 10px;
    background: #864186;
  }

  &__icon {
    color: black;
  }
}
</style>