<template>
<div class="score-board">
    <div class="score-board__item">
      <span class="score-board__label">Счёт:</span>
      <span class="score-board__value">{{ score }}</span>
    </div>
    <div class="score-board__item">
      <span class="score-board__label">Пройдено:</span>
      <span class="score-board__value">{{ distance }}м</span>
    </div>
</div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
score: {
    type: Number,
    required: true
},
distance: {
    type: Number,
    required: true
}
});
</script>

<style lang="less">
.score-board {
display: flex;
gap: 20px;

&__item {
    display: flex;
    gap: 8px;
    background: rgba(255, 255, 255, 0.9);
    padding: 8px 15px;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

&__label {
    font-weight: bold;
    color: #7f8c8d;
}

&__value {
    font-weight: bold;
    color: #2c3e50;
    font-size: 18px;
}
}
</style>