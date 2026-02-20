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
    emits: ['len'], 
    props: {
        type: {
            default: 'default',
            type: String
        }
    },
    data() {
        return{
            text: ''
        }
    },
    methods: {
        check(){
            if (this.text.length > 10){
                this.$emit('len', this.text.length) 
            }
        }
    }
}
</script>

<style lang="scss">
.c-button {
    border: 1px solid rgb(14, 68, 23);
    background: 1px solid rgb(0, 0, 0);
    color: rgb(0, 0, 0);
    font-size: 12px;
    padding: 5px;
    margin: 5px;
    display: flex;

    &--red{
        border: 1px solid rgb(58, 61, 25);
        background: rgb(133, 190, 87);
    }

    &__icon {
        color: rgb(189, 18, 18);
    }
}
</style>