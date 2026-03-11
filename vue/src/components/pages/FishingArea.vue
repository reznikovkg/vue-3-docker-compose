<template>
  <div class="fishing-area">
    <div
      class="fishing-area__water"
      :style="{ backgroundImage: 'url(' + background + ')' }"
      @click="onWaterClick"
    >
      <div class="fishing-area__overlay"></div>

      <div
        v-if="isFishHooked"
        class="fishing-area__minigame"
        @click.stop
      >
        <div class="fishing-area__progress">
          <span class="fishing-area__label">Рыба:</span>
          <div class="fishing-area__bar">
            <div
              class="fishing-area__bar-fill"
              :style="{ width: 100 - fishDistance + '%' }"
            ></div>
          </div>
        </div>

        <div class="fishing-area__progress">
          <span class="fishing-area__label">Удочка:</span>
          <div class="fishing-area__bar">
            <div
              class="fishing-area__bar-fill"
              :style="{ width: rodLoad + '%', background: rodLoad > 80 ? 'red' : '#4CAF50' }"
            ></div>
          </div>
        </div>
      </div>

      <div class="fishing-area__message">
        {{ message }}
      </div>

      <div
        v-if="isFishing"
        class="fishing-area__float"
        :style="{
          left: floatX + '%',
          top: floatY + '%'
        }"
      >
        <img
          class="fishing-area__float-image"
          :src="floatImage"
          alt="Поплавок"
        >
      </div>

      <button
        v-if="isFishHooked"
        class="fishing-area__action-button"
        @mousedown="startPull"
        @mouseup="stopPull"
        @mouseleave="stopPull"
        @touchstart.prevent="startPull"
        @touchend="stopPull"
        @touchcancel="stopPull"
      >
        Тащи!
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FishingArea',
  props: {
    background: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    isFishing: {
      type: Boolean,
      required: true
    },
    isWaitingBite: {
      type: Boolean,
      required: true
    },
    isFishHooked: {
      type: Boolean,
      required: true
    },
    floatX: {
      type: Number,
      required: true
    },
    floatY: {
      type: Number,
      required: true
    },
    rodLoad: {
      type: Number,
      required: true
    },
    fishDistance: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      floatImage: '/img/float.png'
    }
  },
  methods: {
    onWaterClick(event) {
      if (this.isFishing || this.isWaitingBite || this.isFishHooked) {
        return
      }

      const rect = event.currentTarget.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 100
      const y = ((event.clientY - rect.top) / rect.height) * 100

      if (y < 50) {
        this.$emit('error', 'Нужно бросать в воду')
        return
      }

      this.$emit('cast', {
        x: Math.round(x),
        y: Math.round(y)
      })
    },

    startPull() {
      this.$emit('start-pull')
    },

    stopPull() {
      this.$emit('stop-pull')
    }
  }
}
</script>

<style scoped>
.fishing-area {
  margin-bottom: 10px;
}

.fishing-area__water {
  position: relative;
  height: 420px;
  border: 1px solid black;
  margin-bottom: 10px;
  padding: 10px;
  background-size: cover;
  background-position: center;
  overflow: hidden;
  cursor: crosshair;
}

.fishing-area__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.15);
  pointer-events: none;
}

.fishing-area__minigame {
  position: absolute;
  bottom: 70px;
  left: 20px;
  right: 20px;
  z-index: 20;
  pointer-events: none;
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
  min-width: 50px;
  color: white;
  text-shadow: 1px 1px 2px black;
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

.fishing-area__message {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 220px;
  background: white;
  border: 1px solid black;
  padding: 5px;
  z-index: 5;
  pointer-events: none;
  text-align: center;
}

.fishing-area__float {
  position: absolute;
  width: 34px;
  height: 34px;
  margin-left: -17px;
  margin-top: -17px;
  z-index: 10;
  pointer-events: none;
}

.fishing-area__float-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.fishing-area__action-button {
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: 35px;
  padding: 10px;
  font-size: 16px;
  font-weight: bold;
  background: #4CAF50;
  color: white;
  border: 1px solid black;
  cursor: pointer;
  user-select: none;
  z-index: 20;
}

.fishing-area__action-button:active {
  background: #45a049;
}
</style>