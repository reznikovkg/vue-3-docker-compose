<template>
    <button class="c-button" :class="'c-button--' + type">  
        <slot>Кнопка</slot>
        <template v-if="$slots.count">
            (<slot name="count">0</slot>)
        </template>

    </button>
</template>

<script>
export default {
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
    }
  }
}
</script>

<style lang="scss">
.c-button {
    border: 1px solid green;
    background: rgb(0, 64, 0);
    color: white;
    font-size: 12px;
    padding: 5px;
    margin: 5px;
    display: flex;

    &--red {
        border: 1px solid red;
        background: rgb(144, 0, 0);
    }

    &__icon {
        color: rgb(0, 55, 255);
    }
}
</style>