<template>
  <div class="field">
    <ElementCard
      v-for="key in openedElements"
      :key="key"
      :element-key="key"
      @pick="addToTable(key)"
    />
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useStore } from "vuex"
import ElementCard from "../ElementCard.vue"

const store = useStore()
const openedElements = computed(() => store.getters.openedElements)

const addToTable = (key) => {
  store.dispatch("addToTable", key)
}
</script>

<style scoped lang="less">
.field {
  flex: 6;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 12px;
  padding: 12px;
  overflow-y: auto;
  align-content: flex-start;
}

@media (max-width: 600px) {
  .field {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 8px;
  }
}
</style>
