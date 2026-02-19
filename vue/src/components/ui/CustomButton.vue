<template>
    <button class="c-button">
        <slot>Просто кнопка</slot>
    </button>
</template>

<script>
export default {
    name: "CustomButton"
}
</script>

<style lang="scss">
.c-button {
    border: 2px solid black;
    background: lightseagreen;
    color: pink;
    font-size: 16px;
}
</style>