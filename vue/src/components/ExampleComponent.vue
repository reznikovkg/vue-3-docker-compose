<template>
  <div :class="['example-component', { 'example-component--active': isActive }]" @click="handleClick">
    <h3 class="example-component__title">{{ title }}</h3>
    <p class="example-component__description">{{ description }}</p>
    <button class="example-component__button" @click.stop="emitEvent">Click me</button>
    <span v-if="showCounter" class="example-component__counter">Count: {{ count }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, withDefaults } from 'vue'

interface Props {
  title: string
  description?: string
  initialCount?: number
  showCounter?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  description: 'Default description',
  initialCount: 0,
  showCounter: true
})

const emit = defineEmits<{
  (e: 'button-click', value: number): void
  (e: 'component-click'): void
}>()

const count = ref(props.initialCount)
const isActive = ref(false)

const handleClick = () => {
  isActive.value = !isActive.value
  emit('component-click')
}

const emitEvent = () => {
  count.value++
  emit('button-click', count.value)
}
</script>

<style scoped lang="less">
.example-component {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &--active {
    border-color: #42b883;
    background-color: #f8f9fa;
  }

  &__title {
    margin: 0 0 0.5rem 0;
    color: #2c3e50;
  }

  &__description {
    margin: 0 0 1rem 0;
    color: #666;
  }

  &__button {
    padding: 0.5rem 1rem;
    background-color: #42b883;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: #369b74;
    }
  }
}
</style>
