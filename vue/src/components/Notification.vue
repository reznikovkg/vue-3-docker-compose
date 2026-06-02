<template>
  <transition name="slide">
    <div v-if="notice" class="notice">
      {{ notice }}
    </div>
  </transition>
</template>

<script setup>
import { computed, watch } from "vue"
import { useStore } from "vuex"

const store = useStore()
const notice = computed(() => store.getters.notice)

let timer = null

watch(notice, (value) => {
  clearTimeout(timer)
  if (value) {
    timer = setTimeout(() => store.dispatch("clearNotice"), 2000)
  }
})
</script>

<style scoped lang="less">
.notice {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 22px;
  background: #5a4632;
  color: #fff;
  font-weight: bold;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  z-index: 10;
}

.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}
</style>
