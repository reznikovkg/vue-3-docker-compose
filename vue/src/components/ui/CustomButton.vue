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
  border: 1px solid #181818;
  background: #2c3e50;
  color: white;
  font-size: 12px;
  padding: 5px;
  margin: 5px;
  display: flex;

  &--red {
    border: 1px solid #a52828;
    background: #e32525;
  }

  &__icon {
    color: yellow;
  }
}
</style>