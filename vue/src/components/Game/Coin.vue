<template>
<div
    class="coin"
    :style="{
      left: `${x}px`,
      bottom: `${y}px`,
      width: `${size}px`,
      height: `${size}px`
    }"
>
    <div class="coin__inner"></div>
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
size: {
    type: Number,
    required: true
}
});
</script>

<style lang="less">
.coin {
position: absolute;
border-radius: 50%;
background: linear-gradient(135deg, #f39c12 0%, #f1c40f 100%);
animation: coinRotate 1s infinite linear, coinFloat 2s infinite ease-in-out;
box-shadow: 0 0 10px rgba(243, 156, 18, 0.6);

&__inner {
    position: absolute;
    width: 60%;
    height: 60%;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    top: 20%;
    left: 20%;
}
}

@keyframes coinRotate {
0% {
    transform: rotateY(0deg);
}
100% {
    transform: rotateY(360deg);
}
}

@keyframes coinFloat {
0%, 100% {
    transform: translateY(0);
}
50% {
    transform: translateY(-10px);
}
}
</style>