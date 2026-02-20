<template>
  <button class="c-button" :class="'c-button--' + type">
    <div class="c-button__icon"></div>
    <slot>Кнопка</slot>
    <template v-if="$slots.count"> (<slot name="count">0</slot> </template>
    <input
      v-if="showInput"
      v-model="text"
      type="text"
      @click.stop
      @input="() => check()"
      @keyup.enter="handleEnter"
    />
  </button>
</template>

<script>
export default {
  name: "CustomButton",
  emits: ["len", "update:modelValue"],
  props: {
    type: {
      default: "default",
      type: String,
      validator: (value) => ['default', 'green', 'red', 'blue'].includes(value)
    },
    showInput: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      text: " ",
    };
  },
  methods: {
    check() {
      if (this.text.length > 10) {
        this.$emit("len", this.text.length);
      }
    },

    handleClick() {
      if (this.showInput && this.text) {
        this.$emit("update:modelValue", this.text);
        this.text = ""; // очищаем после применения
      }
    },
    handleEnter() {
      if (this.text) {
        this.$emit("update:modelValue", this.text);
        this.text = "";
      }
    },



  },
};
</script>

<style lang="scss">
.c-button {
  border: none;
  background: grey;
  color: white;
  font-size: 12px;
  padding: 5px;
  margin: 5px;
  display: flex;

  &--green {
    background: darkgreen;
  }

  &--red {
    background: darkred;
  }

  &--blue {
    background: #2980b9;
  }


  &__icon {
    color: white;
  }
}
</style>
