<template>
  <div
    class="bubble-game__area"
    ref="area"
    @click="clickArea"
  >
    <div
      v-for="bubble in bubbles"
      :key="bubble.id"
      class="bubble-game__bubble"
      :class="`bubble-game__bubble--${bubble.size}`"
      :style="{
        left: bubble.x + 'px',
        top: bubble.y + 'px',
        background: bubble.color
      }"
    ></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed } from "vue";
import { useStore } from "vuex";

const props = defineProps({
  colorsCount: { type: Number, default: 5 },
  spawnRate: { type: Number, default: 1 },
  scoreGood: { type: Number, default: 1 },
  scoreBad: { type: Number, default: -5 }
});

const emit = defineEmits(["finish"]);
const store = useStore();

const bubbles = computed(() => store.getters.bubbles);
const area = ref(null);

let spawnTimer = null;
let fallTimer = null;
let lossTimer = null;

// -------------------------------
// ✔ Fonction fléchée
// -------------------------------
const clickArea = (e) => {
  const rect = area.value.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  store.dispatch("handleClick", {
    x,
    y,
    scoreGood: props.scoreGood,
    scoreBad: props.scoreBad
  });
};

// -------------------------------
// ✔ Fonctions fléchées + timers
// -------------------------------
onMounted(() => {
  spawnTimer = setInterval(() => {
    store.dispatch("spawnBubble", {
      areaWidth: area.value.offsetWidth,
      colorsCount: props.colorsCount
    });
  }, 1000 / props.spawnRate);

  fallTimer = setInterval(() => {
    store.dispatch("moveBubbles");
  }, 16);

  lossTimer = setInterval(() => {
    store.dispatch("checkBubbleLoss", {
      areaHeight: area.value.offsetHeight
    });
  }, 100);
});

// -------------------------------
// ✔ Fonction fléchée + emit finish
// -------------------------------
onUnmounted(() => {
  clearInterval(spawnTimer);
  clearInterval(fallTimer);
  clearInterval(lossTimer);
  emit("finish", store.getters.score);
});
</script>

<style lang="less" scoped>
.bubble-game {
  &__area {
    position: relative;
    width: 1100px;
    height: 750px;
    background: #ffedb3;
    border: 4px solid #cdaa5a;
    border-radius: 16px;
    overflow: hidden;
    margin: 20px auto;
    box-shadow: 0 0 14px rgba(0, 0, 0, 0.2);
  }

  &__bubble {
    position: absolute;
    border-radius: 50%;
    box-shadow: inset -3px -3px 6px rgba(0, 0, 0, 0.2),
                0 0 8px rgba(255, 255, 255, 0.4);
    cursor: pointer;
    transition: transform 0.1s;

    &:hover {
      transform: scale(1.05);
    }

    &--large {
      width: 80px;
      height: 80px;
    }

    &--medium {
      width: 50px;
      height: 50px;
    }

    &--small {
      width: 30px;
      height: 30px;
    }
  }
}
</style>
