<template>
  <div class="fishing-area">
    <div class="fishing-area__water" :style="{ backgroundImage: 'url(' + background + ')' }" @click="onWaterClick">
      <div class="fishing-area__overlay"></div>

      <!-- Ожидание поклевки (маленькое снизу) -->
      <div v-if="isWaiting" class="fishing-area__waiting">
        ⏳ Ожидание поклевки... {{ timer }} сек
      </div>

      <!-- Мини-игра (маленькое снизу) -->
      <div v-if="isMiniGameActive" class="fishing-area__minigame" @click.stop>
        <div class="fishing-area__progress">
          <span class="fishing-area__label">Рыба:</span>
          <div class="fishing-area__bar">
            <div class="fishing-area__bar-fill" :style="{ width: fishProgress + '%' }"></div>
          </div>
        </div>

        <div class="fishing-area__progress">
          <span class="fishing-area__label">Леска:</span>
          <div class="fishing-area__bar">
            <div class="fishing-area__bar-fill" :style="{ width: lineTension + '%', background: lineTension > 80 ? 'red' : '#4CAF50' }"></div>
          </div>
        </div>

        <button 
          class="fishing-area__action-button" 
          @mousedown="startPulling"
          @mouseup="stopPulling"
          @mouseleave="stopPulling"
          @touchstart="startPulling"
          @touchend="stopPulling"
          @touchcancel="stopPulling"
        >
          Тащи!
        </button>
      </div>

      <div class="fishing-area__message" v-if="!isWaiting && !isMiniGameActive">
        {{ biteMessage }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FishingArea',
  props: {
    background: { type: String, required: true },
    isWaiting: { type: Boolean, required: true },
    isMiniGameActive: { type: Boolean, required: true },
    fishProgress: { type: Number, required: true },
    lineTension: { type: Number, required: true },
    timer: { type: Number, required: true },
    biteMessage: { type: String, required: true }
  },
  data() {
    return {
      isPulling: false,
      pullInterval: null
    }
  },
  watch: {
    isMiniGameActive(active) {
      if (!active) this.stopPulling()
    }
  },
  methods: {
    onWaterClick(event) {
      if (this.isMiniGameActive || this.isWaiting) {
        event.stopPropagation()
        return
      }
      
      const rect = event.currentTarget.getBoundingClientRect()
      const clickY = event.clientY - rect.top
      const waterHeight = rect.height
      
      if (clickY < waterHeight / 2) {
        this.$emit('error', 'Можно бросать только в воду')
        return
      }
      
      this.$emit('cast')
    },
    startPulling() {
      if (!this.isMiniGameActive) return
      this.isPulling = true
      this.$emit('start-pull')
      
      this.pullInterval = setInterval(() => {
        if (this.isPulling) {
          this.$emit('pulling')
        }
      }, 100)
    },
    stopPulling() {
      this.isPulling = false
      clearInterval(this.pullInterval)
      this.$emit('stop-pull')
    }
  }
}
</script>

<style scoped>
.fishing-area__water {
  border: 1px solid black;
  height: 400px;
  margin-bottom: 10px;
  padding: 10px;
  background-size: cover;
  background-position: center;
  position: relative;
  cursor: crosshair;
}

.fishing-area__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  pointer-events: none;
}

.fishing-area__waiting {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid black;
  padding: 8px;
  text-align: center;
  font-size: 14px;
  z-index: 15;
  pointer-events: none;
}

.fishing-area__minigame {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid black;
  padding: 10px;
  z-index: 20;
  pointer-events: auto;
}

.fishing-area__progress {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.fishing-area__label {
  font-size: 12px;
  font-weight: bold;
  min-width: 45px;
}

.fishing-area__bar {
  flex: 1;
  height: 16px;
  background: #ddd;
  border: 1px solid black;
  overflow: hidden;
}

.fishing-area__bar-fill {
  height: 100%;
  background: #4CAF50;
  transition: width 0.1s;
}

.fishing-area__action-button {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  font-weight: bold;
  background: #4CAF50;
  color: white;
  border: 1px solid black;
  cursor: pointer;
  user-select: none;
  margin-top: 5px;
}

.fishing-area__action-button:active {
  background: #45a049;
}

.fishing-area__message {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 1px solid black;
  padding: 5px;
  z-index: 5;
  pointer-events: none;
}
</style>