<template>
<div
    class="enemy"
    :class="`enemy--${type}`"
    :style="{
      left: `${x}px`,
      bottom: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: color
    }"
>
    <div class="enemy__head"></div>
    <div class="enemy__body"></div>
    <div v-if="type === 'shooter'" class="enemy__weapon"></div>
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
type: {
    type: String,
    required: true,
    validator: (value) => ['fighter', 'shooter'].includes(value)
},
color: {
    type: String,
    default: '#e74c3c'
}
});
</script>

<style lang="less">
.enemy {
position: absolute;

&__head {
    position: absolute;
    width: 60%;
    height: 30%;
    background: rgba(0, 0, 0, 0.3);
    top: 0;
    left: 20%;
    border-radius: 50%;
}

&__body {
    position: absolute;
    width: 70%;
    height: 50%;
    background: rgba(0, 0, 0, 0.2);
    top: 25%;
    left: 15%;
    border-radius: 5px;
}

&__weapon {
    position: absolute;
    width: 40%;
    height: 10%;
    background: #34495e;
    top: 40%;
    right: -20%;
    border-radius: 2px;
}

&--fighter {
    animation: enemyMove 0.5s infinite;
}

&--shooter {
    animation: enemyMove 0.8s infinite;
}
}

@keyframes enemyMove {
0%, 100% {
    transform: translateY(0);
}
50% {
    transform: translateY(-5px);
}
}
</style>