<template>
  <div class="fishing-area">
    <div class="fishing-area__water">
      <div class="fishing-area__bite" :class="{ 'fishing-area__bite--active': isBiting }">
        {{ biteMessage }}
      </div>

      <button class="fishing-area__button" @click="onCast" :disabled="isWaiting">
        {{ buttonText }}
      </button>

      <div class="fishing-area__timer" v-if="isWaiting">
        {{ timer }} сек
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FishingArea',
  props: {
    isWaiting: {
      type: Boolean,
      required: true
    },
    isBiting: {
      type: Boolean,
      required: true
    },
    timer: {
      type: Number,
      required: true
    },
    biteMessage: {
      type: String,
      required: true
    },
    buttonText: {
      type: String,
      required: true
    }
  },
  methods: {
    onCast() {
      this.$emit('cast')
    }
  }
}
</script>

<style scoped>
.fishing-area__water {
  border: 1px solid black;
  height: 200px;
  margin-bottom: 10px;
  padding: 10px;
  background: #f0f0f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.fishing-area__bite {
  border: 1px solid black;
  padding: 5px;
  margin-bottom: 5px;
  width: 100%;
  text-align: center;
  background: white;
}

.fishing-area__bite--active {
  background: yellow;
}

.fishing-area__button {
  border: 1px solid black;
  padding: 5px 10px;
  margin-bottom: 5px;
  background: white;
  cursor: pointer;
  width: 100%;
}

.fishing-area__button:hover {
  background: #f0f0f0;
}

.fishing-area__button:disabled {
  background: #e0e0e0;
  cursor: not-allowed;
}

.fishing-area__timer {
  border: 1px solid black;
  padding: 5px;
  width: 100%;
  text-align: center;
  background: white;
}
</style>