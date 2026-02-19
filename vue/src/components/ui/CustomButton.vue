<template>
  <button class="c-button" :class="'c-button--' + type">
    <div class="c-button__icon">
        + {{text}}
    </div>
    <slot>Кнопка</slot>
    <template v-if="$slots.count">
        (<slot name="count">0</slot>)
    </template>

    <input v-model="text" type="text" @click.stop @input="check">
  </button>
</template>

<script>
export default {
    name: "CustomButton",
    emits: ['click', 'len'], 
    props: {
        type: {
            default: 'default',
            type: String
        }
    },
    data() {
        return {
            text: ''
        }
    },
    methods: {
        check() {
            if (this.text.length > 10) {
                this.$emit('len', this.text.length) 
            }
        }
    }
}
</script>

<style lang="scss">
.c-button {
    border: 1px solid rgb(28, 65, 34);
    background: 1px solid rgb(0, 0, 0);
    color: rgb(0, 0, 0);
    font-size: 12px;
    padding: 5px;
    margin: 5px;
    display: flex;

    &--red{
        border: 1px solid rgb(58, 61, 25);
        background: rgb(166, 134, 64);
    }

    &__icon {
        color: rgb(94, 99, 66);
    }
}
</style>