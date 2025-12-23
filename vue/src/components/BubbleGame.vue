<template>
  <div class="bubble-game gradient-bg" ref="gameRef" @click="handleClick">
    <div class="game-info">
      <div class="badge info-badge">
        Собирай:
        <span class="color-dot" :style="{ background: targetColor }"></span>
      </div>
      <div class="badge info-badge score">{{ score }}</div>
    </div>

    <Bubble
      v-for="b in bubbles"
      :key="b.id"
      :x="b.x"
      :y="b.y"
      :size="b.size"
      :color="b.color"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import Bubble from "./Bubble.vue";

const props = defineProps({
  colorCount: { type: Number, default: 5 },
  targetColor: { type: String, required: true },
  intensity: { type: Number, default: 1 },
  correctScore: { type: Number, default: 1 },
  wrongScore: { type: Number, default: -5 },
});

const emit = defineEmits(["finish", "score"]);

const gameRef = ref(null);
const bubbles = ref([]);
const score = ref(0);
const active = ref(false);
const nextId = ref(0);
const frameId = ref(null);
const lastSpawn = ref(0);
const size = ref({ w: 0, h: 0 });

const COLORS = [
  "#FF4757",
  "#FF6B9D",
  "#FFA502",
  "#FFD32A",
  "#1E90FF",
  "#00D9FF",
];
const colors = ref([]);

const start = () => {
  if (active.value) return;

  active.value = true;
  score.value = 0;
  bubbles.value = [];
  lastSpawn.value = performance.now();

  colors.value = COLORS.slice(0, props.colorCount);
  if (!colors.value.includes(props.targetColor)) {
    colors.value[0] = props.targetColor;
  }

  updateSize();
  loop();
};

const stop = () => {
  active.value = false;
  if (frameId.value) cancelAnimationFrame(frameId.value);
  emit("finish", score.value);
};

const updateSize = () => {
  if (!gameRef.value) return;
  const rect = gameRef.value.getBoundingClientRect();
  size.value = { w: rect.width, h: rect.height };
};

const spawn = () => {
  const s = 100;
  bubbles.value.push({
    id: nextId.value++,
    x: Math.random() * (size.value.w - s),
    y: -s,
    size: s,
    color: colors.value[Math.floor(Math.random() * colors.value.length)],
    vy: 0.8,
    vx: (Math.random() - 0.5) * 1,
    timer: Math.random() * 3000 + 2000,
  });
};

const update = () => {
  bubbles.value = bubbles.value.filter((b) => {
    b.y += b.vy;
    b.x += b.vx;

    b.timer -= 16;
    if (b.timer <= 0) {
      b.vx = (Math.random() - 0.5) * 1;
      b.timer = Math.random() * 3000 + 2000;
    }

    if (b.x < 0) {
      b.x = 0;
      b.vx = Math.abs(b.vx);
    } else if (b.x > size.value.w - b.size) {
      b.x = size.value.w - b.size;
      b.vx = -Math.abs(b.vx);
    }

    return b.y < size.value.h + b.size;
  });
};

const loop = (time = performance.now()) => {
  if (!active.value) return;

  if (time - lastSpawn.value >= 1000 / props.intensity) {
    spawn();
    lastSpawn.value = time;
  }

  update();
  frameId.value = requestAnimationFrame(loop);
};

const handleClick = (event) => {
  if (!active.value) return;

  const rect = gameRef.value.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  const clickedBubbles = bubbles.value.filter((b) => {
    const dx = clickX - (b.x + b.size / 2);
    const dy = clickY - (b.y + b.size / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= b.size / 2;
  });

  clickedBubbles.forEach((bubble) => {
    pop(bubble);
  });
};

const pop = (bubble) => {
  const idx = bubbles.value.indexOf(bubble);
  if (idx === -1) return;

  const correct = bubble.color === props.targetColor;
  const points = correct ? props.correctScore : props.wrongScore;

  score.value += points;
  bubbles.value.splice(idx, 1);

  emit("score", { score: score.value, correct });
};

onMounted(() => {
  updateSize();
  window.addEventListener("resize", updateSize);
});

onBeforeUnmount(() => {
  stop();
  window.removeEventListener("resize", updateSize);
});

defineExpose({ start, stop });
</script>

<style scoped>
/* Фон */
.gradient-bg {
    background: linear-gradient(135deg, #FFE66D, #FF6B9D, #C44569, #A8E6CF, #FFD93D);
}

.bubble-game {
    position: fixed;
    inset: 0;
    overflow: hidden;
    cursor: crosshair;
}

.game-info {
    position: fixed;
    top: 30px;
    left: 40px;
    right: 200px;
    display: flex;
    justify-content: space-between;
    z-index: 1000;
    max-width: calc(100% - 280px);
    pointer-events: none;
}

.info-badge {
    pointer-events: auto;
}

.score {
    color: #FF4757;
    font-size: 32px;
    min-width: 100px;
    justify-content: center;
}

.badge {
    background: rgba(255, 255, 255, 0.95);
    padding: 18px 35px;
    border-radius: 50px;
    font-size: 24px;
    font-weight: 900;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    gap: 15px;
    color: #333;
}

/* Выбранный цвет */
.color-dot {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 4px solid white;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}
</style>
