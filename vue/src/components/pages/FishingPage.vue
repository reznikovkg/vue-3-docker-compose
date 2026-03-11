<template>
  <div class="page">
    <h2 class="page__counter">Всего поймано: {{ totalBiteCount }}</h2>

    <div
      class="bg"
      :style="{ backgroundImage: `url(/images/${location.image})` }"
    ></div>

    <button class="menu-button" @click="() => goToHomePage()">
      <span class="menu-button__text">ДОМОЙ</span>
    </button>

    <div class="score-panel">
      <div class="score-panel__label">ВСЕГО ПОЙМАНО</div>
      <div class="score-panel__value">{{ totalBiteCount }}</div>
    </div>

    <div class="rod" ref="rodRef">
      <div
        class="fishing-line"
        :style="lineStyle"
        v-if="isCasting || isBiting"
      ></div>

      <div
        class="float"
        :class="{ 'float--biting': isBiting }"
        :style="floatStyle"
        v-if="isCasting || isBiting"
      >
        <div class="float__body"></div>
        <div class="float__tip"></div>
      </div>
    </div>

    <button
      class="fish-button"
      v-if="canStartFish && !selectingPosition"
      @click="() => startSelectFishPosition()"
    >
      Закинуть
    </button>

    <div class="fishing-controls" v-if="isBiting">
      <div class="progress-wrapper">
        <div class="progress-wrapper__label">🎣 УДОЧКА</div>
        <div class="progress-wrapper__bar">
          <div
            class="progress-wrapper__fill"
            :style="{ width: progress + '%' }"
          >
            <span class="progress-wrapper__text"
              >{{ Math.floor(progress) }}%</span
            >
          </div>
        </div>
      </div>

      <button
        class="reel-button"
        @mousedown="() => startReeling()"
        @mouseup="() => stopReeling()"
        @mouseleave="() => stopReeling()"
        @touchstart="() => startReeling()"
        @touchend="() => stopReeling()"
        :class="{ 'reel-button--active': isReeling }"
      >
        ТЯНУТЬ
      </button>
    </div>

    <Notification
      v-if="notification !== null"
      :message="notification"
      @action="() => closeNotification()"
    />

    <div
      v-if="selectingPosition"
      class="fishing-click-area"
      @click="($event) => startFish($event)"
    ></div>
  </div>
</template>

<script setup>
import { useStore } from "vuex";
import { onUnmounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import Notification from "../Notification.vue";

const props = defineProps(["location"]);
const location = computed(() => props.location);

const router = useRouter();
const goToHomePage = () => {
  router.push("/");
};

const store = useStore();
const isCasting = computed(() => store.getters["game/isCasting"]);
const isBiting = computed(() => store.getters["game/isBiting"]);
const totalBiteCount = computed(() => store.getters["game/totalBiteCount"]);
const notification = computed(() => store.getters["game/notification"]);
const progress = computed(() => store.getters["game/progress"]);
const isReeling = computed(() => store.getters["game/isReeling"]);
const canStartFish = computed(() => !isCasting.value && !isBiting.value);

const floatPosition = ref({ x: 0, y: 0 });

const selectingPosition = ref(false);
const startSelectFishPosition = () => {
  selectingPosition.value = true;
};

const startFish = (event) => {
  floatPosition.value.x = event.clientX;
  floatPosition.value.y = event.clientY;
  selectingPosition.value = false;
  store.dispatch("game/startCasting");
};

const startReeling = () => {
  store.dispatch("game/startReeling");
};

const stopReeling = () => {
  store.dispatch("game/stopReeling");
};
const closeNotification = () => {
  store.dispatch("game/closeNotification");
};

const rodRef = ref(null);
const rodTipPosition = computed(() => {
  const rodRect = rodRef.value.getBoundingClientRect();
  return {
    x: rodRect.left + 485,
    y: rodRect.top + 15,
  };
});

const lineStyle = computed(() => {
  if (!rodRef.value) return { display: "none" };

  const startX = rodTipPosition.value.x;
  const startY = rodTipPosition.value.y;

  const endX = floatPosition.value.x;
  const endY = floatPosition.value.y - 15;

  const dx = endX - startX;
  const dy = endY - startY;
  const maxLength = Math.sqrt(dx * dx + dy * dy);
  const currentLength = (maxLength * (100 - progress.value)) / 100;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return {
    position: "fixed",
    top: "0",
    left: "0",
    width: currentLength + "px",
    height: "3px",
    background: "white",
    transformOrigin: "0 0",
    transform: `translate(${startX}px, ${startY}px) rotate(${angle}deg)`,
    pointerEvents: "none",
  };
});

const floatStyle = computed(() => {
  if (!rodRef.value) return { display: "none" };

  const rodX = rodTipPosition.value.x;
  const rodY = rodTipPosition.value.y;

  const floatX = floatPosition.value.x;
  const floatY = floatPosition.value.y;

  const t = progress.value / 100;

  const x = floatX + (rodX - floatX) * t;
  const y = floatY + (rodY - floatY) * t;

  return {
    position: "fixed",
    left: x + "px",
    top: y + "px",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
    zIndex: 30,
  };
});

onUnmounted(() => {
  store.dispatch("game/reset");
});
</script>

<style scoped>
.bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

.notification {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: auto;
  width: auto;
  height: auto;
  min-width: 300px;
  max-width: 90vw;
}

.fishing-click-area {
  position: fixed;
  left: 0;
  width: 100%;
  top: 40%;
  bottom: 10%;
  border-radius: 3px 3px 0 0;
  border: 2px solid #fff;
  cursor: pointer;
}

.rod {
  position: fixed;
  top: 400px;
  left: 500px;
  background-image: url("/images/rod.png");
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 600px;
  height: 600px;
  z-index: 10;
  pointer-events: none;
}

.float {
  position: fixed;
  width: 20px;
  height: 30px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 10;
  pointer-events: none;
}

.float__body {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 28px;
  background: linear-gradient(135deg, #ff6b6b, #ff4757);
  border-radius: 50% 50% 40% 40%;
  border: 2px solid #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.float__tip {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 10px;
  background: linear-gradient(135deg, #ffff8f, #ffff00);
  border-radius: 4px 4px 0 0;
  border: 1px solid #fff;
}

.fish-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 300px;
  height: 200px;
  background: green;
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fishing-controls {
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 15px;
  z-index: 1000;
  min-width: 380px;
}

.progress-wrapper {
  width: 100%;
  background: #1a1a1a;
  padding: 12px;
  border-radius: 20px;
}

.progress-wrapper__label {
  color: white;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  padding-left: 5px;
  letter-spacing: 1px;
}

.progress-wrapper__bar {
  width: 100%;
  height: 30px;
  background: #2c3e50;
  border-radius: 15px;
  overflow: hidden;
}

.progress-wrapper__fill {
  height: 100%;
  background: green;
  transition: width 0.1s linear;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
}

.progress-wrapper__text {
  color: white;
  font-size: 14px;
}

.reel-button {
  width: 100%;
  height: 200px;
  padding: 18px 30px;
  background: linear-gradient(135deg, #ff4444, #cc0000);
  color: white;
  font-size: 32px;
  cursor: pointer;
  border-radius: 30px;
}

.reel-button--active {
  transform: scale(0.98);
  background: linear-gradient(135deg, #cc0000, #990000);
}

.score-panel {
  position: fixed;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a1a;
  padding: 15px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  min-width: 250px;
  border-radius: 30px;
}

.score-panel__label {
  color: white;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 2px;
  margin-bottom: 5px;
  text-transform: uppercase;
}

.score-panel__value {
  color: white;
  font-size: 42px;
  font-weight: bold;
  line-height: 1;
  text-shadow: 2px 2px 4px black;
}

.menu-button {
  position: fixed;
  top: 30px;
  left: 30px;
  background: black;
  border-radius: 30px;
  padding: 12px 25px;
  display: flex;
  align-items: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
}

.menu-button__text {
  color: white;
}
</style>
