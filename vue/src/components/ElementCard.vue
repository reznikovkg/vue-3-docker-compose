<template>
  <div class="card" @click="emit('pick')">
    <div class="card__icon">{{ element.icon }}</div>
    <div class="card__name">{{ element.name }}</div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from "vue"
import { useStore } from "vuex"

const props = defineProps({
  elementKey: String,
})
const emit = defineEmits(["pick"])

const store = useStore()
const element = computed(() => store.getters.getElement(props.elementKey))
</script>

<style scoped lang="less">
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  padding: 12px;
  background: #fffdf7;
  border: 1px solid #e6dcc6;
  border-radius: 14px;
  cursor: pointer;
  transition: 0.15s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 14px rgba(80, 60, 30, 0.18);
  }

  &__icon {
    font-size: 34px;
    margin-bottom: 6px;
  }

  &__name {
    font-size: 15px;
    font-weight: bold;
    color: #5a4632;
  }
}
</style>
