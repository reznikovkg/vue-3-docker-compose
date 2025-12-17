<template>
  <div class="fishing-mini">
    <div class="fishing-mini__bar">
      <div class="fishing-mini__target"></div>
      <div class="fishing-mini__indicator" :style="{ bottom: pos + '%' }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  difficulty?: number
}>()

const emit = defineEmits<{ (e: 'result', ok: boolean): void }>()

const pos = ref<number>(50)
const dir = ref<number>(1)
let raf: number = 0
let last: number = 0

const loop = (t: number): void => {
  const dt: number = last ? (t - last) / 1000 : 0
  last = t
  const baseSpeed: number = 80
  const speed: number = baseSpeed * (props.difficulty || 1)
  pos.value += dir.value * speed * dt
  if (pos.value > 100) {
    pos.value = 100
    dir.value = -1
  }
  if (pos.value < 0) {
    pos.value = 0
    dir.value = 1
  }
  raf = requestAnimationFrame(loop)
}

const onKey = (e: KeyboardEvent): void => {
  if (e.code === 'Space') {
    e.preventDefault()
    const ok: boolean = pos.value <= 10
    emit('result', ok)
  }
}

onMounted(() => {
  raf = requestAnimationFrame(loop)
  window.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('keydown', onKey)
})
</script>

<style scoped lang="less">
.fishing-mini {
  width: 220px;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;

  &__bar {
    position: relative;
    width: 60px;
    height: 200px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
  }

  &__target {
    position: absolute;
    bottom: 0;
    height: 10%;
    width: 100%;
    background: rgba(46, 204, 113, 0.6);
  }

  &__indicator {
    position: absolute;
    left: 0;
    width: 100%;
    height: 6px;
    background: #e74c3c;
  }

  &__hint {
    margin-left: 12px;
    font-size: 12px;
    opacity: 0.7;
  }
}
</style>
