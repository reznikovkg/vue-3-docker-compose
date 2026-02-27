<template>
  <div>
    <h2>Всего поймано: {{ totalBiteCount }}</h2>
  </div>

  <div class="bg" :style="{ backgroundImage: `url(/images/${location.image})` }">
  </div>

  <button class="menu-button" @click="() => goToHomePage()">
    <span class="menu-text">ДОМОЙ</span>
  </button>

  <div class="score-panel">
    <div class="score-label">ВСЕГО ПОЙМАНО</div>
    <div class="score-value">{{ totalBiteCount }}</div>
  </div>

  <div class="rod">
  </div>

  <button class="fish-button" 
    v-if="canStartFish"
    @click="() => startFish()"
  >
    Закинуть
  </button>

  <div class="fishing-controls" v-if="isBiting">
    <div class="progress-wrapper">
      <div class="progress-label">🎣 УДОЧКА</div>
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: progress + '%' }"
        >
          <span class="progress-text">{{ Math.floor(progress) }}%</span>
        </div>
      </div>
    </div>

    <button 
      class="reel-button"
      @mousedown="startReeling"
      @mouseup="stopReeling"
      @mouseleave="stopReeling"
      @touchstart="startReeling"
      @touchend="stopReeling"
      :class="{ active: isReeling }"
    >
      ТЯНУТЬ
    </button>
  </div>

  <Notification
    v-if="notification !== null"
    :message="notification"
    @action="() => closeNotification()"
  />
</template>

<script setup>
import { useStore } from 'vuex'
import { onUnmounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Notification from '../Notification.vue';

const props = defineProps(['location'])
const location = computed(() => props.location)

const store = useStore()
const isCasting = computed(() => store.getters['game/isCasting'])
const isBiting = computed(() => store.getters['game/isBiting'])
const totalBiteCount = computed(() => store.getters['game/totalBiteCount'])
const notification = computed(() => store.getters['game/notification'])

const canStartFish = computed(() => !isCasting.value && !isBiting.value)
const startFish = () => {
  store.dispatch('game/startCasting')
}

const progress = computed(() => store.getters['game/progress'])
const isReeling = computed(() => store.getters['game/isReeling'])

const startReeling = () => {
  store.dispatch('game/startReeling')
}

const stopReeling = () => {
  store.dispatch('game/stopReeling')
}

onUnmounted(() => {
  store.dispatch('game/reset')
})

const router = useRouter()
const goToHomePage = () => {
  router.push("/")
}

const closeNotification = () => {
  store.dispatch('game/closeNotification')
}
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
  top: 400px;
  left: 500px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 600px;
  height: 600px;
  z-index: 10;
  pointer-events: none;
}

.rod {
  position: fixed;
  top: 400px;
  left: 500px;
  background-image: url('/images/rod.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 600px;
  height: 600px;
  z-index: 10;
  pointer-events: none;
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

.progress-label {
  color: white;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  padding-left: 5px;
  letter-spacing: 1px;
}

.progress-bar {
  width: 100%;
  height: 30px;
  background: #2c3e50;
  border-radius: 15px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: green;
  transition: width 0.1s linear;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
}

.progress-text {
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

.score-label {
  color: white;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 2px;
  margin-bottom: 5px;
  text-transform: uppercase;
}

.score-value {
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

</style>