<template>
<div class="health-bar">
    <div class="health-bar__label">Жизни:</div>
    <div class="health-bar__hearts">
      <div 
        v-for="i in maxLives" 
        :key="i"
        class="health-bar__heart"
        :class="{ 'health-bar__heart--empty': i > currentLives }"
      >
        ❤️
      </div>
    </div>
</div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
currentLives: {
    type: Number,
    required: true
},
maxLives: {
    type: Number,
    required: true
}
});
</script>

<style lang="less">
.health-bar {
display: flex;
align-items: center;
gap: 10px;

&__label {
    font-weight: bold;
    color: #2c3e50;
}

&__hearts {
    display: flex;
    gap: 5px;
}

&__heart {
    font-size: 24px;
    transition: all 0.3s ease;
    
    &--empty {
      opacity: 0.3;
      filter: grayscale(100%);
    }
}
}
</style>