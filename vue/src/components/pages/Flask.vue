<template>
    <div class="flask" :class="{ 'flask--selected': isSelected }" @click="() => $emit('select')">
        <div v-for="(layer, index) in layers" :key="index" class="flask__layer" :style="{ background: layer, height: layerHeight + '%' }"></div>
    </div>
</template>

<script>
export default {
    name: 'Flask',
    props: {
        layers: {
            type: Array,
            required: true
        },
        maxLayers: {
            type: Number,
            required: true
        },
        isSelected: {
            type: Boolean,
            default: false
        }
    },
    emits: ['select'],
    computed: {
        layerHeight () {
            return 100 / this.maxLayers
        }
    }
}
</script>

<style scoped lang="scss">
.flask {
    width: 60px;
    height: 200px;
    border: 2px solid black;
    margin: 0 10px;
    display: flex;
    flex-direction: column-reverse;
    cursor: pointer;

    &--selected {
        border: 2px solid red;
    }

    &__layer {
        width: 100%;
    }
}
</style>