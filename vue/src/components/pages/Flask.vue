<template>
    <div class="flask" :class="{ 'flask--selected': isSelected }" @click="() => $emit('select')"></div>
</template>

<script>
export default {
    name: 'Flask',
    props: {
        isSelected: {
            type: Boolean,
            default: false
        }
    },
    emits: ['select']
}
</script>

<style scoped lang="scss">
.flask {
    width: 60px;
    height: 200px;
    border: 2px solid black;
    margin: 0 10px;
    cursor: pointer;

    &--selected {
        border: 2px solid red;
    }
}
</style>