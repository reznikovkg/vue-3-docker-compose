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
  correctScore: { type: Number, default: 1 }
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

const BUBBLE_SIZES = [
  { 
    size: 60,
    wrongScore: -1, 
    missedScore: -3,
    children: null
  },
  { 
    size: 100,
    wrongScore: -3, 
    missedScore: -6,
    children: { count: 5, size: 60 }
  },
  { 
    size: 140,
    wrongScore: -5, 
    missedScore: -10,
    children: { count: 3, size: 100 }
  }
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
  const bubbleConfig = BUBBLE_SIZES[Math.floor(Math.random() * BUBBLE_SIZES.length)];
  
  bubbles.value.push({
    id: nextId.value++,
    x: Math.random() * (size.value.w - bubbleConfig.size),
    y: -bubbleConfig.size,
    size: bubbleConfig.size,
    wrongScore: bubbleConfig.wrongScore,
    missedScore: bubbleConfig.missedScore,
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

    if (b.isPushing && b.pushProgress < 1) {
      b.pushProgress += 1 / b.pushDuration;
      
      if (b.pushProgress >= 1) {
        b.pushProgress = 1;
        b.isPushing = false;
      }
      
      const easedProgress = easeOutQuad(b.pushProgress);
      
      b.x = b.startX + (b.targetX - b.startX) * easedProgress;
      b.y = b.startY + (b.targetY - b.startY) * easedProgress;
    }

    b.timer -= 16;
    if (b.timer <= 0) {
      b.vx = (Math.random() - 0.5) * 1;
      b.timer = Math.random() * 3000 + 2000;
    }

    if (b.x < 0) {
      b.x = 0;
      b.vx = Math.abs(b.vx);
      b.pushVx = 0;
    } else if (b.x > size.value.w - b.size) {
      b.x = size.value.w - b.size;
      b.vx = -Math.abs(b.vx);
      b.pushVx = 0;
    }

    const fellDown = b.y >= size.value.h;
    
    if (fellDown && b.color === props.targetColor) {
      score.value += b.missedScore;
      emit("score", { score: score.value, correct: false, missed: true });
    }

    return !fellDown;
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
  const points = correct ? props.correctScore : bubble.wrongScore;

  score.value += points;
  bubbles.value.splice(idx, 1);

  emit("score", { score: score.value, correct });

  pushAwayBubbles(bubble);

  const bubbleConfig = BUBBLE_SIZES.find(config => config.size === bubble.size);

  if (bubbleConfig && bubbleConfig.children) {
    spawnChildren(bubble, bubbleConfig.children.count, bubbleConfig.children.size);
  }
};

const spawnChildren = (parentBubble, count, childSize) => {
  const parentConfig = BUBBLE_SIZES.find(b => b.size === parentBubble.size);
  const childConfig = BUBBLE_SIZES.find(b => b.size === childSize);
  
  if (!childConfig) return;

  const centerX = parentBubble.x + parentBubble.size / 2;
  const centerY = parentBubble.y + parentBubble.size / 2;
  const radius = parentBubble.size * 0.6;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius - childSize / 2;
    const y = centerY + Math.sin(angle) * radius - childSize / 2;

    const color = i === 0 
      ? parentBubble.color 
      : colors.value[Math.floor(Math.random() * colors.value.length)];

    bubbles.value.push({
      id: nextId.value++,
      x: Math.max(0, Math.min(x, size.value.w - childSize)),
      y: Math.max(0, y),
      size: childSize,
      wrongScore: childConfig.wrongScore,
      missedScore: childConfig.missedScore,
      color: color,
      vy: 0.8,
      vx: (Math.random() - 0.5) * 1,
      timer: Math.random() * 3000 + 2000,
    });
  }
};

const pushAwayBubbles = (poppedBubble) => {
  const poppedCenterX = poppedBubble.x + poppedBubble.size / 2;
  const poppedCenterY = poppedBubble.y + poppedBubble.size / 2;
  
  const pushFactors = {
    140: { 140: 1, 100: 1.5, 60: 2 },    
    100: { 140: 0.5, 100: 1, 60: 1.5 },  
    60: { 140: 0.25, 100: 0.5, 60: 1 }    
  };

  bubbles.value.forEach((bubble) => {
    const bubbleCenterX = bubble.x + bubble.size / 2;
    const bubbleCenterY = bubble.y + bubble.size / 2;
    const dx = bubbleCenterX - poppedCenterX;
    const dy = bubbleCenterY - poppedCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const interactionRadius = (poppedBubble.size + bubble.size) / 2 + 50;
    
    if (distance > 0 && distance < interactionRadius) {
      const dirX = dx / distance;
      const dirY = dy / distance;
      
      const factor = pushFactors[poppedBubble.size]?.[bubble.size];
      const pushDistance = (poppedBubble.size / 2) * factor;
      
      bubble.startX = bubble.x;
      bubble.startY = bubble.y;
      
      bubble.targetX = bubble.x + dirX * pushDistance;
      bubble.targetY = bubble.y + dirY * pushDistance;
      
      bubble.pushProgress = 0;
      bubble.pushDuration = 30;
      bubble.isPushing = true;
    }
  });
};

const easeOutQuad = (t) => {
  return t * (2 - t);
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
