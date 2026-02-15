<template>
<div
    class="player"
    :style="{
      left: `${x}px`,
      bottom: `${y}px`,
      width: `${width}px`,
      height: `${height}px`
    }"
>
    <div class="player__body"></div>
    <div class="player__head"></div>
    <div class="player__legs" :class="{ 'player__legs--running': isRunning }"></div>
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
isRunning: {
    type: Boolean,
    default: true
}
});
</script>

<style lang="less">
.player {
position: absolute;
transition: bottom 0.1s linear;

&__body {
    position: absolute;
    width: 60%;
    height: 50%;
    background: #3498db;
    bottom: 30%;
    left: 20%;
    border-radius: 5px;
}

&__head {
    position: absolute;
    width: 50%;
    height: 30%;
    background: #2c3e50;
    top: 0;
    left: 25%;
    border-radius: 50%;
}

&__legs {
    position: absolute;
    width: 80%;
    height: 30%;
    bottom: 0;
    left: 10%;
    
    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 30%;
      height: 100%;
      background: #2c3e50;
      border-radius: 3px;
    }
    
    &::before {
      left: 10%;
    }
    
    &::after {
      right: 10%;
    }
    
    &--running {
      animation: run 0.3s infinite;
    }
}
}

@keyframes run {
0%, 100% {
    transform: translateY(0);
}
50% {
    transform: translateY(-3px);
}
}
</style>