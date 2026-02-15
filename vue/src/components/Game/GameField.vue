<template>
<div class="game-field" ref="gameFieldRef">
    <div 
      class="game-field__background"
      :style="{ backgroundPositionX: `${backgroundPosition}px` }"
    ></div>
    
    <Player 
      :x="player.x"
      :y="player.y"
      :width="config.player.width"
      :height="config.player.height"
      :is-running="isPlaying"
    />
    
    <Enemy
      v-for="enemy in enemies"
      :key="enemy.id"
      :x="enemy.x"
      :y="enemy.y"
      :width="enemy.width"
      :height="enemy.height"
      :type="enemy.type"
      :color="enemy.color"
    />
    
    <Obstacle
      v-for="obstacle in obstacles"
      :key="obstacle.id"
      :x="obstacle.x"
      :y="obstacle.y"
      :width="obstacle.width"
      :height="obstacle.height"
      :color="obstacle.color"
    />
    
    <Coin
      v-for="coin in coins"
      :key="coin.id"
      :x="coin.x"
      :y="coin.y"
      :size="coin.size"
    />
    
    <Bullet
      v-for="bullet in bullets"
      :key="bullet.id"
      :x="bullet.x"
      :y="bullet.y"
      :width="bullet.width"
      :height="bullet.height"
      :is-player="bullet.isPlayer"
    />
</div>
</template>

<script setup>
import { ref, defineProps, defineExpose } from 'vue';
import Player from './Player.vue';
import Enemy from './Enemy.vue';
import Obstacle from './Obstacle.vue';
import Coin from './Coin.vue';
import Bullet from './Bullet.vue';

const props = defineProps({
config: {
    type: Object,
    required: true
},
isPlaying: {
    type: Boolean,
    required: true
}
});

const gameFieldRef = ref(null);
const backgroundPosition = ref(0);
const player = ref({
x: props.config.player.x,
y: 0,
velocityY: 0,
isJumping: false
});

const enemies = ref([]);
const obstacles = ref([]);
const coins = ref([]);
const bullets = ref([]);

defineExpose({
gameFieldRef,
backgroundPosition,
player,
enemies,
obstacles,
coins,
bullets
});
</script>

<style lang="less">
.game-field {
position: static;
width: 100%;
height: 100%;
overflow: hidden;
background: #87ceeb;

&__background {
    position: absolute;
    top: 0;
    left: 0;
    width: 200%;
    height: 100%;
    background-image: 
      repeating-linear-gradient(
        90deg,
        #8B7355 0px,
        #8B7355 2px,
        #A0826D 2px,
        #A0826D 4px
      ),
      repeating-linear-gradient(
        0deg,
        #2d5016 0px,
        #2d5016 80%,
        #8B7355 80%,
        #8B7355 100%
      );
    background-size: 100% 100%;
    background-position: 0 0;
    
    &::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 20%;
      background: repeating-linear-gradient(
        90deg,
        #654321 0px,
        #654321 50px,
        #8B7355 50px,
        #8B7355 100px
      );
    }
}
}
</style>