<template>
  <div class="bubble-game__area" ref="gameArea">
    <div
      v-for="bubble in bubbles"
      :key="bubble.id"
      class="bubble-game__bubble"
      :style="{
        backgroundColor: bubble.color,
        left: bubble.x + 'px',
        top: bubble.y + 'px'
      }"
      @click="() => popBubble(bubble)"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  colorsCount: Number,
  targetColor: String,
  spawnRate: Number,
  scoreGood: { type: Number, default: 1 },
  scoreBad: { type: Number, default: -5 }
});

const emit = defineEmits(["finish", "score"]);

const bubbles = ref([]);
const score = ref(0);
const gameArea = ref(null);

let spawnInterval = null;
let fallInterval = null;

const randomColor = () => {
  const palette = ["red", "blue", "yellow", "green", "pink", "purple", "orange"];
  return palette[Math.floor(Math.random() * props.colorsCount)];
};

const spawnBubble = () => {
  const width = gameArea.value.offsetWidth;
  bubbles.value.push({
    id: crypto.randomUUID(),
    color: randomColor(),
    x: Math.random() * (width - 60),
    y: -60,
    speed: 1 + Math.random() * 2
  });
};

const moveBubbles = () => {
  const height = gameArea.value.offsetHeight;
  bubbles.value.forEach(b => b.y += b.speed);
  bubbles.value = bubbles.value.filter(b => b.y < height);
};

const popBubble = (bubble) => {
  score.value += bubble.color === props.targetColor ? props.scoreGood : props.scoreBad;
  emit("score", score.value);
  bubbles.value = bubbles.value.filter(b => b.id !== bubble.id);
};

onMounted(() => {
  spawnInterval = setInterval(spawnBubble, 1000 / props.spawnRate);
  fallInterval = setInterval(moveBubbles, 16);
});

onBeforeUnmount(() => {
  clearInterval(spawnInterval);
  clearInterval(fallInterval);
  emit("finish", score.value);
});
</script>

<style lang="less" scoped>
.bubble-game {
  &__area {
    position: relative;
    width: 100%;
    height: 600px;
    background: radial-gradient(circle, #ffeeaa, #dd66cc);
    overflow: hidden;
    border-radius: 10px;
  }

  &__bubble {
    position: absolute;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    cursor: pointer;

    box-shadow: inset -8px -8px 12px rgba(0, 0, 0, 0.2),
                inset 8px 8px 12px rgba(255, 255, 255, 0.6);

    transition: transform 0.1s;

    &:active {
      transform: scale(0.8);
    }
  }
}
</style>
