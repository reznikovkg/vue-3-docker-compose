<template>
  <button class="c-button" :class="'c-button--' + type" @click="() => onClick()">
    <div class="c-button__icon">
      + {{ text }} ({{ clicks }})
    </div>
    <slot>Кнопка</slot>

    <template v-if="$slots.count">
      (<slot name="count">0</slot>)
    </template>

    <input
      v-model="text"
      class="c-button__input"
      :class="{ 'c-button__input--error': text.length > 10 }"
      type="text"
      @click.stop
      @input="() => onInput()"
    >

    <span v-if="text" class="c-button__clear" @click.stop="() => clear()">x</span>
    <small v-if="text.length > 10" class="c-button__error">слишком длинно</small>
  </button>
</template>

<script>
export default {
  name: 'CustomButton',
  emits: ['len', 'click', 'text'],
  props: {
    type: {
      default: 'default',
      type: String
    }
  },
  data () {
    return {
      text: '',
      clicks: 0
    }
  },
  methods: {
    onClick () {
      if (this.type === 'disabled') {
        return
      }

      this.clicks += 1
      this.$emit('click')
    },
    onInput () {
      this.$emit('text', this.text)

      if (this.text.length > 10) {
        this.$emit('len', this.text.length)
      }
    },
    clear () {
      this.text = ''
      this.$emit('text', this.text)
    }
  }
}
</script>

<style lang="scss">
.c-button {
  border: 1px solid #08d389;
  background: #00915e;
  color: white;
  font-size: 12px;
  padding: 5px;
  margin: 5px;
  display: flex;
  align-items: center;
  gap: 6px;

  &--red {
    border: 1px solid #d30058;
    background: #910038;
  }

  &--disabled {
    border: 1px solid #888;
    background: #9e9e9e;
    cursor: not-allowed;
    opacity: 0.75;
  }

  &__icon {
    color: yellow;
  }

  &__input {
    border: 1px solid #bdbdbd;
    padding: 2px 4px;
  }

  &__input--error {
    border: 2px solid red;
  }

  &__clear {
    cursor: pointer;
    user-select: none;
    font-weight: bold;
  }

  &__error {
    color: #ffd5e2;
    font-size: 10px;
  }
}
</style>