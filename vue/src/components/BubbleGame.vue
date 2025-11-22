<template>
  <div
    class="bubble-game__area"
    ref="area"
    @click="(e) => clickArea(e)"
  >
    <div
      v-for="bubble in bubbles"
      :key="bubble.id"
      class="bubble-game__bubble"
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
});

onUnmounted(() => {
  clearInterval(spawnTimer);
  clearInterval(fallTimer);

  // Émettre le score final lors de l'arrêt
  emit("finish", store.getters.score);
});

</script>

<style lang="less" scoped>
.bubble-game__area {
  position: relative;
  width: 800px;
  height: 750px;
  background: #ffedb3;
  border: 4px solid #cdaa5a;
  border-radius: 16px;
  overflow: hidden;
  margin: 20px auto;
  box-shadow: 0 0 14px rgba(0,0,0,0.2);
}



.bubble-game__bubble {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
}
</style>
