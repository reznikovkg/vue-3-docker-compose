<template>
<div
    class="bullet"
    :class="{ 'bullet--player': isPlayer }"
    :style="{
      left: `${x}px`,
      bottom: `${y}px`,
      width: `${width}px`,
      height: `${height}px`
    }"
>
    <div class="bullet__trail"></div>
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
isPlayer: {
    type: Boolean,
    default: false
}
});
</script>

<style lang="less">
.bullet {
position: absolute;
background: #e67e22;
border-radius: 50%;
box-shadow: 0 0 5px rgba(230, 126, 34, 0.8);

&--player {
    background: #3498db;
    box-shadow: 0 0 5px rgba(52, 152, 219, 0.8);
}

&__trail {
    position: absolute;
    width: 200%;
    height: 50%;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(230, 126, 34, 0.3) 50%, 
      transparent 100%);
    right: 100%;
    top: 25%;
}

&--player &__trail {
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(52, 152, 219, 0.3) 50%, 
      transparent 100%);
    left: 100%;
    right: auto;
}
}
</style>