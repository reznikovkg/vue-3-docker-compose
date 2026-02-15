<template>
<div
    class="obstacle"
    :style="{
      left: `${x}px`,
      bottom: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: color
    }"
>
    <div class="obstacle__top"></div>
</div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
x: {
    type: Number,
    required: true
},
y: {
    type: Number,
    required: true
},
width: {
    type: Number,
    required: true
},
height: {
    type: Number,
    required: true
},
color: {
    type: String,
    default: '#34495e'
}
});
</script>

<style lang="less">
.obstacle {
position: absolute;
border-radius: 3px;

&__top {
    position: absolute;
    width: 120%;
    height: 20%;
    background: rgba(0, 0, 0, 0.3);
    top: -10%;
    left: -10%;
    border-radius: 50%;
}
}
</style>