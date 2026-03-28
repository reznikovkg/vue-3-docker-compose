<template>
    <button class="c-button" :class="'c-button--' + type">
        <slot>Кнопка</slot>

        <template v-if="$slots.count">
            (<slot name="count">0</slot>)
        </template>
    </button>
</template>

<script>
export default{
    name: 'CustomButton',
    props: {
        type: {
            default: 'default',
            type: String
        }
    }
}

</script>

<style lang="scss">
.c-button {
    border: 1px solid #00d389;
    background: #00915e;
    color: white;
    font-size: 12px;
    padding: 5px;
    margin: 5px;

    &--red {
        border: 1px solid #d30e00;
        background: #910c00;
    }
}
</style>