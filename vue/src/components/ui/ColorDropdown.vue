<template>
  <div class="color-dropdown">
    <div class="color-dropdown__current" @click="() => toggleDropdown()">
      <img :src="currentImage" class="color-dropdown__current__preview" />
      <span>{{ currentName }}</span>
      <span class="color-dropdown__current__arrow">{{ isOpen ? '▲' : '▼' }}</span>
    </div>
    
    <div v-if="isOpen" class="color-dropdown__dropdown">
      <div 
        v-for="color in colors" 
        :key="color.value"
        class="color-dropdown__dropdown__option"
        :class="{ active: color.value === modelValue }"
        @click="() => selectColor(color.value)"
      >
        <img :src="color.image" class="color-dropdown__dropdown__option__preview" />
        <span>{{ color.name }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue'
import soundManager from './../../utils/soundManager'

interface ColorOption {
  value: string
  name: string
  image: string
}

export default {
  name: 'ColorDropdown',
  props: {
    modelValue: {
      type: String,
      required: true
    },
    colors: {
      type: Array as PropType<ColorOption[]>,
      required: true
    }
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return {
      isOpen: false
    }
  },
  computed: {
    currentImage(): string {
      const selected = this.colors.find(c => c.value === this.modelValue)
      return selected?.image || ''
    },
    currentName(): string {
      const selected = this.colors.find(c => c.value === this.modelValue)
      return selected?.name || ''
    }
  },
  methods: {
    toggleDropdown() {
      soundManager.play('click')
      this.isOpen = !this.isOpen
    },
    selectColor(value: string) {
      soundManager.play('click')
      this.$emit('update:modelValue', value)
      this.$emit('change', value)
      this.isOpen = false
    },
    closeOnClickOutside(e: MouseEvent) {
      if (!this.$el.contains(e.target as Node)) {
        this.isOpen = false
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.closeOnClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeOnClickOutside)
  }
}
</script>

<style scoped lang="scss">
.color-dropdown {
  position: relative;

  &__current {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: #3a3f44;
    border: 2px solid #3a3f44;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: #4a4f54;
    }

    &__preview {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      object-fit: cover;
    }

    &__arrow {
      margin-left: auto;
      color: #b0b0b0;
      font-size: 12px;
    }
  }

  &__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 5px;
    background: #3a3f44;
    border: 2px solid #4a4f54;
    border-radius: 6px;
    z-index: 10;
    max-height: 300px;
    overflow-y: auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: dropdownFadeIn 0.2s ease;

    &__option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #4a4f54;
      }

      &.active {
        background: #00d389;
        
        span {
          color: white;
          font-weight: 600;
        }
      }

      &__preview {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        object-fit: cover;
      }

      span {
        color: #ededf0;
      }
    }
  }
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>