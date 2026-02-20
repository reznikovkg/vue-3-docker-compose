<template>
  <button class="c-button" :class="'c-button--' + type">
    <div class="c-button__icon">{{ text }}</div>
    <slot>Кнопка</slot>
    <template v-if="$slots.count"> (<slot name="count">0</slot> </template>
    <input
      v-if="showInput"
      v-model="text"
      type="text"
      @click.stop
      @input="() => check()"
    />
  </button>
</template>

<script>
export default {
  name: "CustomButton",
  emits: ["len"],
  props: {
    type: {
      default: "default",
      type: String,
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

  &__icon {
    color: white;
  }
}
</style>
