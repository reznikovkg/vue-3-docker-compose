<template>
  <div class="c-input" :class="'c-input--' + status">

    <input v-model="text" type="text" @input="() => updateValue()" :placeholder="placeholder">

    <button v-if="text" class="c-input__clear" @click.stop="clearInput">
      ✕
    </button>

    <slot>Введите</slot>

    <template v-if="$slots.hint">
      (<slot name="hint">0</slot>)
    </template>

  </div>
</template>

<script>
export default {
  name: 'CustomInput',
  emits: ['update:modelValue'],
  props: {
    status: {
      default: 'default',
      type: String
    },
    placeholder: {
      default: '',
      type: String
    }
  },
  data () {
    return {
      text: ''
    }
  },
  methods: {
    updateValue() {
      this.$emit('update:modelValue', this.text)
    },
    clearInput() {
      this.text = ''
      this.$emit('update:modelValue', '')
    }
  }
}
</script>

<style lang="scss">
.c-input {
  border: 1px solid #ccc;
  background: #f5f5f5;
  color: #333;
  font-size: 14px;
  padding: 8px;
  margin: 5px;
  display: flex;
  align-items: center;
  border-radius: 4px;

  input {
    border: none;
    outline: none;
    background: transparent;
    flex: 1;
    padding: 4px;
    color: #333;
  }

  &__clear {
    background: none;
    border: none;
    color: #999;
    font-size: 16px;
    cursor: pointer;
    padding: 0 5px;
    margin-left: 5px;
  }

  &--red {
    border: 1px solid #d30058;
    background: #ffe6f0;
    color: #910038;
  }
}
</style>