<template>
<div class="game-controls">
    <div class="game-controls__info">
      <HealthBar :current-lives="lives" :max-lives="maxLives" />
      <ScoreBoard :score="score" :distance="distance" />
    </div>
    
    <div class="game-controls__buttons">
      <button 
        v-if="!isPlaying"
        class="game-controls__button game-controls__button--start"
        @click="$emit('start')"
      >
        {{ gameOver ? 'Начать заново' : 'Старт' }}
      </button>
      
      <template v-else>
        <button 
          class="game-controls__button game-controls__button--jump"
          @click="$emit('jump')"
          :disabled="!canJump"
        >
          Прыжок
        </button>
        <button 
          class="game-controls__button game-controls__button--shoot"
          @click="$emit('shoot')"
          :disabled="!canShoot"
        >
          Выстрел
        </button>
      </template>
    </div>
    
    <div v-if="gameOver" class="game-controls__game-over">
      <h2 class="game-controls__game-over-title">Игра окончена!</h2>
      <p class="game-controls__game-over-score">Ваш счёт: {{ score }}</p>
    </div>
</div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import HealthBar from '../UI/HealthBar.vue';
import ScoreBoard from '../UI/ScoreBoard.vue';

defineProps({
isPlaying: {
    type: Boolean,
    required: true
},
gameOver: {
    type: Boolean,
    default: false
},
lives: {
    type: Number,
    required: true
},
maxLives: {
    type: Number,
    required: true
},
score: {
    type: Number,
    required: true
},
distance: {
    type: Number,
    required: true
},
canJump: {
    type: Boolean,
    default: true
},
canShoot: {
    type: Boolean,
    default: true
}
});

defineEmits(['start', 'jump', 'shoot']);
</script>

<style lang="less">
.game-controls {
height: 100%;
display: flex;
flex-direction: column;
justify-content: space-between;
padding: 20px;
background: linear-gradient(180deg, #ecf0f1 0%, #bdc3c7 100%);
border-top: 3px solid #95a5a6;

&__info {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

&__buttons {
    display: flex;
    gap: 200px;
    justify-content: center;
}

&__button {
    padding: 50px 100px;
    font-size: 18px;
    font-weight: bold;
    border: none;
    border-radius: 100px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    
    &:active {
      transform: translateY(2px);
      box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    &--start {
      background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
      color: white;
      font-size: 50px;
      padding: 70px 90px;
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #229954 0%, #27ae60 100%);
      }
    }
    
    &--jump {
      background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
      color: white;
      font-size: 30px;
      padding: 40px 80px;
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #2980b9 0%, #21618c 100%);
      }
    }
    
    &--shoot {
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      color: white;
      font-size: 30px;
      padding: 40px 80px;
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
      }
    }
}

&__game-over {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(44, 62, 80, 0.95);
    color: white;
    padding: 30px 50px;
    border-radius: 15px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

&__game-over-title {
    margin: 0 0 15px;
    font-size: 32px;
}

&__game-over-score {
    margin: 0;
    font-size: 24px;
    color: #f39c12;
}
}
</style>