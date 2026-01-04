<template>
  <div class="bubble-game" ref="gameRef" @click="e => handleClick(e)" @mousemove="e => handleMouseMove(e)">
    <div class="bubble-game__info">
      <div class="bubble-game__badge">
        Собирай:
        <span class="bubble-game__color-dot" :style="{ background: targetColor }"></span>
      </div>
      
      <div class="bubble-game__mode-selector">
        <button 
          class="bubble-game__mode-btn" 
          :class="{ 'bubble-game__mode-btn--active': weaponMode === 'click' }"
          @click="() => setWeaponMode('click')"
        >
          👆 Клик
        </button>
        <button 
          class="bubble-game__mode-btn" 
          :class="{ 'bubble-game__mode-btn--active': weaponMode === 'auto' }"
          @click="() => setWeaponMode('auto')"
        >
          🔫 Автомат
        </button>
        <button 
          class="bubble-game__mode-btn" 
          :class="{ 'bubble-game__mode-btn--active': weaponMode === 'laser' }"
          @click="() => setWeaponMode('laser')"
        >
          ⚡ Лазер
        </button>
      </div>
      
      <div 
        class="bubble-game__badge bubble-game__badge--correct-combo"
        :class="{ 'bubble-game__badge--invisible': correctCombo <= 1 }"
      >
        x{{ correctCombo.toFixed(1) }}
      </div>
      <div 
        class="bubble-game__badge bubble-game__badge--wrong-combo"
        :class="{ 'bubble-game__badge--invisible': wrongCombo <= 1 }"
      >
        x{{ wrongCombo.toFixed(1) }}
      </div>
      <div class="bubble-game__badge">{{ score }}</div>
      
      <div 
        class="bubble-game__mode-btn" 
        :class="{ 'bubble-game__mode-btn--active': bombMode }"
        @click.stop="() => toggleBombMode()"
      >
        💣 {{ bombCount }}
      </div>
    </div>

    <div v-if="bombMode" class="bubble-game__indicator">
      Выберите точку взрыва
    </div>

    <div 
      v-if="weaponMode === 'laser' && laserActive" 
      class="bubble-game__effect"
      :style="{
        left: laserX + 'px',
        top: laserY + 'px'
      }"
    ></div>

    <div
      v-for="shot in autoShots"
      :key="shot.id"
      class="bubble-game__effect"
      :style="{
        left: shot.x + 'px',
        top: shot.y + 'px'
      }"
    ></div>

    <div
      v-for="explosion in explosions"
      :key="explosion.id"
      class="bubble-game__effect bubble-game__effect--bomb"
      :style="{
        left: explosion.x + 'px',
        top: explosion.y + 'px'
      }"
    ></div>

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

// комбо
const correctCombo = ref(1);
const wrongCombo = ref(1);
const comboPulse = ref(false);
const lastHitCorrect = ref(null);

// Бомбы
const bombCount = ref(2);
const bombMode = ref(false);
const correctHits = ref(0);
const explosions = ref([]);
const explosionId = ref(0);
const BOMB_RADIUS = 150;

// Режимы оружия
const weaponMode = ref('click'); // click,auto, laser
const autoShots = ref([]);
const autoShotId = ref(0);
const autoInterval = ref(null);
const laserActive = ref(false);
const laserX = ref(0);
const laserY = ref(0);
const mouseX = ref(0);
const mouseY = ref(0);

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
    key: "small",
    size: 60,
    wrongScore: -1, 
    missedScore: -3,
    pushFactor: { small: 1, medium: 0.5, large: 0.25 },
    children: null
  },
  { 
    key: "medium",
    size: 100,
    wrongScore: -3, 
    missedScore: -6,
    pushFactor: { small: 1.5, medium: 1, large: 0.5 },
    children: { count: 5, sizeKey: "small" }
  },
  { 
    key: "large",
    size: 140,
    wrongScore: -5, 
    missedScore: -10,
    pushFactor: { small: 2, medium: 1.5, large: 1 },
    children: { count: 3, sizeKey: "medium" }
  }
];

const getBubbleConfig = (size) =>
  BUBBLE_SIZES.find(b => b.size === size);

const getBubbleConfigByKey = (key) =>
  BUBBLE_SIZES.find(b => b.key === key);

const colors = ref([]);

const toggleBombMode = () => {
  if (bombCount.value > 0) {
    bombMode.value = !bombMode.value;
  }
};

const useBomb = (x, y) => {
  if (bombCount.value <= 0) return;
  
  bombCount.value--;
  bombMode.value = false;
  
  const expId = explosionId.value++;
  explosions.value.push({ id: expId, x, y });
  setTimeout(() => {
    explosions.value = explosions.value.filter(e => e.id !== expId);
  }, 1000);
  
  const bubblesInRadius = bubbles.value.filter((b) => {
    const dx = x - (b.x + b.size / 2);
    const dy = y - (b.y + b.size / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= BOMB_RADIUS;
  });
  
  bubblesInRadius.forEach((bubble) => {
    const config = getBubbleConfig(bubble.size);
    if (config?.key === "large") {
      spawnChildren(bubble, {
        count: 7,
        customConfig: getBubbleConfigByKey("small")
      });
    }
    const idx = bubbles.value.indexOf(bubble);
    if (idx !== -1) {
      bubbles.value.splice(idx, 1);
    }
  });
};

const setWeaponMode = (mode) => {
  weaponMode.value = mode;
  
  if (autoInterval.value) {
    clearInterval(autoInterval.value);
    autoInterval.value = null;
  }
  
  if (mode === 'auto' && active.value) {
    startAutoFire();
  }
};

const startAutoFire = () => {
  if (autoInterval.value) return;
  
  autoInterval.value = setInterval(() => {
    if (!active.value) return;
    
    const x = mouseX.value;
    const y = mouseY.value;
    
    checkBubblesAtPosition(x, y);
    
    const shotId = autoShotId.value++;
    autoShots.value.push({ id: shotId, x, y });
    
    setTimeout(() => {
      autoShots.value = autoShots.value.filter(s => s.id !== shotId);
    }, 2000);
  }, 500);
};

const stopAutoFire = () => {
  if (autoInterval.value) {
    clearInterval(autoInterval.value);
    autoInterval.value = null;
  }
};

const handleMouseMove = (event) => {
  if (!active.value) return;
  
  const rect = gameRef.value.getBoundingClientRect();
  mouseX.value = event.clientX - rect.left;
  mouseY.value = event.clientY - rect.top;
  
  if (weaponMode.value === 'laser') {
    laserX.value = mouseX.value;
    laserY.value = mouseY.value;
    laserActive.value = true;
    
    checkBubblesAtPosition(mouseX.value, mouseY.value, 20);
  }
};

const checkBubblesAtPosition = (x, y, radius = 5) => {
  const hitBubbles = bubbles.value.filter((b) => {
    const dx = x - (b.x + b.size / 2);
    const dy = y - (b.y + b.size / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= b.size / 2 + radius;
  });
  
  hitBubbles.forEach((bubble) => {
    pop(bubble);
  });
};

const start = () => {
  if (active.value) return;

  active.value = true;
  score.value = 0;
  bubbles.value = [];
  lastSpawn.value = performance.now();
  correctCombo.value = 1;
  wrongCombo.value = 1;
  lastHitCorrect.value = null;
  autoShots.value = [];
  correctHits.value = 0;
  bombMode.value = false;

  colors.value = COLORS.slice(0, props.colorCount);
  if (!colors.value.includes(props.targetColor)) {
    colors.value[0] = props.targetColor;
  }

  updateSize();
  loop();
  
  if (weaponMode.value === 'auto') {
    startAutoFire();
  }
};

const stop = () => {
  active.value = false;
  laserActive.value = false;
  if (frameId.value) cancelAnimationFrame(frameId.value);
  stopAutoFire();
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

  if (bombMode.value) {
    useBomb(clickX, clickY);
    return;
  }

  if (weaponMode.value !== 'click') return;

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

const updateCombo = (correct) => {
  comboPulse.value = true;
  setTimeout(() => comboPulse.value = false, 200);

  if (correct) {
    if (lastHitCorrect.value === true) {
      correctCombo.value = Math.min(5, correctCombo.value + 0.2);
    } else {
      correctCombo.value = 1;
    }
    wrongCombo.value = 1;
    lastHitCorrect.value = true;
  } else {
    if (lastHitCorrect.value === false) {
      wrongCombo.value = Math.min(7, wrongCombo.value + 0.3);
    } else {
      wrongCombo.value = 1;
    }
    correctCombo.value = 1;
    lastHitCorrect.value = false;
  }
};

const pop = (bubble) => {
  const idx = bubbles.value.indexOf(bubble);
  if (idx === -1) return;

  const correct = bubble.color === props.targetColor;
  
  if (correct) {
    correctHits.value++;
    if (correctHits.value % 10 === 0) {
      bombCount.value++;
    }
  }
  
  updateCombo(correct);
  
  const multiplier = correct ? correctCombo.value : wrongCombo.value;
  const basePoints = correct ? props.correctScore : bubble.wrongScore;
  const points = Math.round(basePoints * multiplier);

  score.value += points;
  bubbles.value.splice(idx, 1);

  emit("score", { 
    score: score.value, 
    correct,
    correctCombo: correctCombo.value,
    wrongCombo: wrongCombo.value,
    points
  });

  pushAwayBubbles(bubble);

  const bubbleConfig = getBubbleConfig(bubble.size);

  if (bubbleConfig?.children) {
    spawnChildren(bubble, bubbleConfig.children);
  }
};

const spawnChildren = (parentBubble, { count, sizeKey, customConfig }) => {
  const childConfig = customConfig || getBubbleConfigByKey(sizeKey);
  
  if (!childConfig) return;

  const centerX = parentBubble.x + parentBubble.size / 2;
  const centerY = parentBubble.y + parentBubble.size / 2;
  const radius = parentBubble.size * 0.6;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
    const childSize = childConfig.size;
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
  const poppedCfg = getBubbleConfig(poppedBubble.size);

  if (!poppedCfg) return;

  const poppedCenterX = poppedBubble.x + poppedBubble.size / 2;
  const poppedCenterY = poppedBubble.y + poppedBubble.size / 2;

  bubbles.value.forEach((bubble) => {
    const cfg = getBubbleConfig(bubble.size);

    if (!cfg) return;

    const bubbleCenterX = bubble.x + bubble.size / 2;
    const bubbleCenterY = bubble.y + bubble.size / 2;
    const dx = bubbleCenterX - poppedCenterX;
    const dy = bubbleCenterY - poppedCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const interactionRadius = (poppedBubble.size + bubble.size) / 2 + 50;
    
    if (distance > 0 && distance < interactionRadius) {
      const dirX = dx / distance;
      const dirY = dy / distance;
      
      const factor = poppedCfg.pushFactor[cfg.key];
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

<style scoped lang="scss">
.bubble-game {
  position: fixed;
  inset: 0;
  overflow: hidden;
  cursor: crosshair;
  background: linear-gradient(135deg, #FFE66D, #FF6B9D, #C44569, #A8E6CF, #FFD93D);
}

.bubble-game__info {
  position: fixed;
  top: 30px;
  left: 40px;
  right: 200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  z-index: 1000;
  max-width: calc(100% - 280px);
  pointer-events: none;
}

.bubble-game__mode-selector {
  display: flex;
  gap: 10px;
}

.bubble-game__mode-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 3px solid transparent;
  padding: 12px 20px;
  border-radius: 25px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  pointer-events: auto;
}

.bubble-game__mode-btn--active {
  background: #667eea;
  color: white;
  border-color: white;
}

.bubble-game__badge {
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
  pointer-events: auto;
}

.bubble-game__badge--invisible {
  opacity: 0;
  pointer-events: none;
}

.bubble-game__badge--correct-combo {
  background: rgba(69, 168, 75, 0.95);
  color: white;
}

.bubble-game__badge--wrong-combo {
  background: rgba(147, 54, 54, 0.95);
  color: white;
}

.bubble-game__indicator {
  position: fixed;
  top: 150px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 100, 0, 0.65);
  color: white;
  padding: 15px 40px;
  border-radius: 30px;
  font-size: 22px;
  font-weight: 900;
  z-index: 1001;
}

.bubble-game__effect {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 0, 0.8), rgba(255, 0, 0, 0.4), transparent);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.bubble-game__effect--bomb {
  width: 300px;
  height: 300px;
}

/* Выбранный цвет */
.bubble-game__color-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}
</style>
